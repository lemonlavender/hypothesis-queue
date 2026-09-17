# AI-assisted documentation study / 文档研究

Validation plan / 假设验证计划

Budget / 预算: 4 h · Selected / 已排: 3.5 h · Remaining / 剩余: 0.5 h
Selected order / 执行顺序: H1 → H4

> Planning record only. No experiments are executed. Outcomes below are supplied observations, not independent verification.
> 仅为计划记录；未执行实验。以下结果由使用者提供，不代表独立验证。

Rule / 排序: Priority 1 first → lower effort → ID; skip items that do not fit. / 优先级 1 优先，再按工时、ID 排序；放不下的项暂缓。

## H1 · Source-linked AI drafts reduce unsupported statements.

- Disposition / 队列状态: selected
- Priority / 优先级: 1 · Effort / 工时: 2 h
- Owner / 负责人: Research team A
- Source / 依据: Synthetic pilot: 4 unsupported statements among 20 draft claims.
- Prediction / 预测: A source-linked prompt produces at most 1 unsupported claim in 20.
- Falsifier / 否定条件: More than 1 of 20 claims lacks a supporting passage.
- Method / 验证方法: Compare two prompts on the same 20 synthetic questions; a reviewer checks every cited passage.

## H2 · A checklist reduces review time without reducing accuracy.

- Disposition / 队列状态: budget
- Priority / 优先级: 1 · Effort / 工时: 3 h
- Owner / 负责人: Research team B
- Source / 依据: Synthetic review log: median 12 minutes per document.
- Prediction / 预测: Median time falls below 9 minutes while unsupported-claim recall stays at least 90%.
- Falsifier / 否定条件: Median time is 9 minutes or more, or recall is below 90%.
- Method / 验证方法: Counterbalance 10 paired documents and record time and missed claims.

## H3 · Showing uncertainty improves reader decisions.

- Disposition / 队列状态: incomplete
- Priority / 优先级: 2 · Effort / 工时: 1 h
- Owner / 负责人: missing
- Source / 依据: AI-generated proposal; no pilot evidence yet.
- Prediction / 预测: Readers distinguish unsupported statements more accurately.
- Falsifier / 否定条件: missing
- Method / 验证方法: missing
- Missing / 待补: falsifier, method, owner

## H4 · A small glossary reduces terminology mismatches.

- Disposition / 队列状态: selected
- Priority / 优先级: 2 · Effort / 工时: 1.5 h
- Owner / 负责人: Research team A
- Source / 依据: Synthetic baseline: 5 mismatches across 30 term uses.
- Prediction / 预测: At most 2 mismatches across the same 30 uses.
- Falsifier / 否定条件: 3 or more mismatches remain.
- Method / 验证方法: Blindly label each term use using the same glossary and count mismatches.
