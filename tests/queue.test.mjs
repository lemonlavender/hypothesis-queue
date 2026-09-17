import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateQueue, planQueue, updateHypothesis, toMarkdown} from '../src/queue.mjs';
const sample = () => JSON.parse(readFileSync(new URL('../examples/research-queue.json', import.meta.url)));
test('finite budget skips expensive work and retains incomplete hypotheses', () => {
 const p=planQueue(sample());assert.deepEqual(p.selectedIds,['H1','H4']);assert.equal(p.usedHours,3.5);assert.equal(p.remainingHours,0.5);
 assert.equal(p.items.find(x=>x.id==='H2').disposition,'budget');assert.deepEqual(p.items.find(x=>x.id==='H3').missing,['falsifier','method','owner']);
});
test('budget reranks without erasing data', () => {
 const q=sample();q.budgetHours=5;assert.deepEqual(planQueue(q).selectedIds,['H1','H2']);assert.equal(q.hypotheses[2].falsifier,'');
});
test('completion records supplied observations and frees capacity', () => {
 const q=updateHypothesis(validateQueue(sample()),'H1',{result:{outcome:'inconclusive',notes:'Only 8 of 20 items reviewed; full result unavailable.'}});
 const p=planQueue(q);assert.equal(p.items[0].disposition,'recorded');assert.deepEqual(p.selectedIds,['H2']);assert.match(toMarkdown(q),/not independent verification/);
});
test('outcomes require observation text and known categories', () => {
 assert.throws(()=>updateHypothesis(sample(),'H1',{result:{outcome:'supports',notes:'  '}}),/required/);
 assert.throws(()=>updateHypothesis(sample(),'H1',{result:{outcome:'proven',notes:'x'}}),/outcome/);
});
test('park and reopen preserve the hypothesis', () => {
 let q=updateHypothesis(sample(),'H1',{parked:true});assert.deepEqual(planQueue(q).selectedIds,['H2']);
 q=updateHypothesis(q,'H1',{parked:false});assert.deepEqual(planQueue(q).selectedIds,['H1','H4']);
});
test('quarter-hour arithmetic is exact; unsupported inputs fail', () => {
 const q=sample();q.budgetHours=0.75;q.hypotheses=q.hypotheses.filter(x=>x.id!=='H3').map(x=>({...x,hours:0.25}));
 assert.equal(planQueue(q).remainingHours,0);assert.equal(planQueue(q).selectedIds.length,3);
 for(const n of [-1,0.1,Infinity,'4']){q.budgetHours=n;assert.throws(()=>validateQueue(q),/budgetHours/);}
});
test('duplicates and misspelled properties fail explicitly', () => {
 let q=sample();q.hypotheses[1].id='H1';assert.throws(()=>validateQueue(q),/Duplicate/);
 q=sample();q.hypotheses[0].falsifer='typo';assert.throws(()=>validateQueue(q),/unknown field/);
});
test('missing effort blocks work instead of making it free', () => {
 const q=sample();q.hypotheses[0].hours=null;const p=planQueue(q);assert.equal(p.items[0].disposition,'incomplete');assert.deepEqual(p.selectedIds,['H2']);
});
test('zero budget, empty queue, and stable ties', () => {
 const q=sample();q.budgetHours=0;assert.deepEqual(planQueue(q).selectedIds,[]);q.hypotheses=[];assert.equal(planQueue(q).items.length,0);
 const tied=sample();tied.hypotheses=tied.hypotheses.slice(0,2).map(x=>({...x,hours:1})).reverse();assert.deepEqual(planQueue(tied).selectedIds,['H1','H2']);
});
test('JSON round trip and bilingual Markdown preserve the plan', () => {
 const q=updateHypothesis(sample(),'H2',{parked:true});assert.deepEqual(validateQueue(JSON.parse(JSON.stringify(q))),q);
 const m=toMarkdown(q);assert.match(m,/否定条件/);assert.match(m,/Selected order.*H1 → H4/);
});
test('Markdown escapes supplied HTML and link syntax', () => {
 const q=sample();q.hypotheses[0].claim='<img src=x onerror=alert(1)> [click](javascript:alert(1))';
 const m=toMarkdown(q);assert.doesNotMatch(m,/(?<!\\)<img/);assert.ok(m.includes('\\<img'));assert.ok(m.includes('\\[click\\]'));
});
test('validation is bounded and never mutates caller data', () => {
 const q=sample(), before=JSON.stringify(q);planQueue(q);assert.equal(JSON.stringify(q),before);
 q.hypotheses=Array.from({length:101},()=>q.hypotheses[0]);assert.throws(()=>validateQueue(q),/at most 100/);
});
test('changing the claim or test design invalidates an old outcome',()=>{
 let q=updateHypothesis(sample(),'H1',{result:{outcome:'supports',notes:'Synthetic supplied observation: 1 unsupported claim of 20.'}});
 assert.equal(updateHypothesis(q,'H1',{owner:'New owner'}).hypotheses[0].result.outcome,'supports');
 assert.equal(updateHypothesis(q,'H1',{prediction:'Zero unsupported claims.'}).hypotheses[0].result,null);
});
