export const REQUIRED_EVIDENCE = ['source', 'prediction', 'falsifier', 'method', 'owner'];
export const OUTCOMES = ['supports', 'contradicts', 'inconclusive'];
function object(value, keys, where) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(where + ' must be an object');
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(where + ': unknown field ' + key);
}
function text(value, field, required = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > 4000) throw new Error(field + ' must be text, at most 4000 characters');
  const out = value.trim();
  if (required && !out) throw new Error(field + ' is required');
  return out;
}
function hours(value, field, allowZero = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < (allowZero ? 0 : 0.25) || value > 10000 || !Number.isInteger(value * 4)) {
    throw new Error(field + ' must be a number in 0.25-hour steps, ' + (allowZero ? '0' : '0.25') + '–10000');
  }
  return value;
}
export function validateQueue(input) {
  object(input, ['schemaVersion', 'title', 'budgetHours', 'hypotheses'], 'queue');
  if (input.schemaVersion !== 1) throw new Error('schemaVersion must be 1');
  if (!Array.isArray(input.hypotheses) || input.hypotheses.length > 100) throw new Error('hypotheses must be an array of at most 100 items');
  const ids = new Set();
  return {
    schemaVersion: 1, title: text(input.title, 'title', true), budgetHours: hours(input.budgetHours, 'budgetHours', true),
    hypotheses: input.hypotheses.map((item, index) => {
      const at = 'hypotheses[' + index + ']';
      object(item, ['id', 'claim', ...REQUIRED_EVIDENCE, 'hours', 'priority', 'parked', 'result'], at);
      if (typeof item.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,39}$/.test(item.id)) throw new Error(at + '.id must be a short letter/digit identifier');
      if (ids.has(item.id)) throw new Error('Duplicate id: ' + item.id);
      ids.add(item.id);
      if (![1, 2, 3].includes(item.priority)) throw new Error(at + '.priority must be 1, 2 or 3');
      if (item.parked !== undefined && typeof item.parked !== 'boolean') throw new Error(at + '.parked must be boolean');
      let result = null;
      if (item.result !== undefined && item.result !== null) {
        object(item.result, ['outcome', 'notes'], at + '.result');
        if (!OUTCOMES.includes(item.result.outcome)) throw new Error(at + '.result.outcome must be supports, contradicts or inconclusive');
        result = {outcome: item.result.outcome, notes: text(item.result.notes, at + '.result.notes', true)};
      }
      return {
        id: item.id, claim: text(item.claim, at + '.claim', true),
        ...Object.fromEntries(REQUIRED_EVIDENCE.map(field => [field, text(item[field], at + '.' + field)])),
        hours: item.hours === null || item.hours === undefined ? null : hours(item.hours, at + '.hours'),
        priority: item.priority, parked: item.parked ?? false, result
      };
    })
  };
}
export function planQueue(input) {
  const queue = validateQueue(input);
  const items = queue.hypotheses.map(item => {
    const missing = REQUIRED_EVIDENCE.filter(field => !item[field]);
    if (item.hours === null) missing.push('hours');
    return {...item, missing, disposition: item.result ? 'recorded' : item.parked ? 'parked' : missing.length ? 'incomplete' : 'budget'};
  });
  const ranked = items.filter(item => item.disposition === 'budget').sort((a, b) =>
    a.priority - b.priority || a.hours - b.hours || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let remainingUnits = queue.budgetHours * 4;
  const selectedIds = [];
  for (const item of ranked) {
    if (item.hours * 4 <= remainingUnits) {
      item.disposition = 'selected'; selectedIds.push(item.id); remainingUnits -= item.hours * 4;
    }
  }
  return {
    schemaVersion: 1, kind: 'hypothesis-queue-plan', queue,
    policy: 'Priority 1 first, then smaller effort, then ID. Skip work that does not fit. Planning only; outcomes are user-supplied.',
    budgetHours: queue.budgetHours, usedHours: queue.budgetHours - remainingUnits / 4, remainingHours: remainingUnits / 4,
    selectedIds, items, counts: Object.fromEntries(['selected','budget','incomplete','parked','recorded'].map(s => [s,items.filter(x=>x.disposition===s).length]))
  };
}
export function updateHypothesis(queue, id, patch) {
  const index = queue.hypotheses.findIndex(item => item.id === id);
  if (index < 0) throw new Error('Unknown hypothesis: ' + id);
  if (Object.hasOwn(patch, 'id')) throw new Error('Hypothesis IDs cannot be changed');
  const next = validateQueue({...queue, hypotheses: queue.hypotheses.map((item, i) => i === index ? {...item,...patch} : item)});
  const previous = queue.hypotheses[index];
  const updated = next.hypotheses[index];
  if (['claim','source','prediction','falsifier','method'].some(key => updated[key] !== previous[key])) updated.result = null;
  return next;
}
function markdownText(value) {
  return String(value).replace(/[\\\x60*_{}\[\]<>#|]/g, '\\$&').replace(/\r?\n/g, ' / ');
}
export function toMarkdown(queue) {
  const plan = planQueue(queue);
  const lines = ['# ' + markdownText(plan.queue.title), '', 'Validation plan / 假设验证计划', '',
    'Budget / 预算: ' + plan.budgetHours + ' h · Selected / 已排: ' + plan.usedHours + ' h · Remaining / 剩余: ' + plan.remainingHours + ' h',
    'Selected order / 执行顺序: ' + (plan.selectedIds.join(' → ') || 'None / 无'), '',
    '> Planning record only. No experiments are executed. Outcomes below are supplied observations, not independent verification.',
    '> 仅为计划记录；未执行实验。以下结果由使用者提供，不代表独立验证。', '',
    'Rule / 排序: Priority 1 first → lower effort → ID; skip items that do not fit. / 优先级 1 优先，再按工时、ID 排序；放不下的项暂缓。', ''];
  for (const item of plan.items) {
    lines.push('## ' + item.id + ' · ' + markdownText(item.claim), '',
      '- Disposition / 队列状态: ' + item.disposition,
      '- Priority / 优先级: ' + item.priority + ' · Effort / 工时: ' + (item.hours ?? 'unknown') + ' h',
      '- Owner / 负责人: ' + markdownText(item.owner || 'missing'),
      '- Source / 依据: ' + markdownText(item.source || 'missing'),
      '- Prediction / 预测: ' + markdownText(item.prediction || 'missing'),
      '- Falsifier / 否定条件: ' + markdownText(item.falsifier || 'missing'),
      '- Method / 验证方法: ' + markdownText(item.method || 'missing'));
    if (item.missing.length) lines.push('- Missing / 待补: ' + item.missing.join(', '));
    if (item.result) lines.push('- Reported outcome / 已记录结果: ' + item.result.outcome, '- Observation / 观测记录: ' + markdownText(item.result.notes));
    lines.push('');
  }
  return lines.join('\n');
}
