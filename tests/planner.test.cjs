const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../planner.js');
const base={date:'2026-10-06',task:'reaction',value:240,condition:'same level · laptop · mouse',notes:''};
test('every focus and time budget produces valid, distinct exercises',()=>{
  for(const focus of api.AREAS)for(const minutes of [2,5,8]){
    const plan=api.createSession({focus,minutes,offset:19});
    assert.ok(plan.tasks.length>=1&&plan.tasks.length<=3);
    assert.equal(new Set(plan.tasks.map(task=>task.id)).size,plan.tasks.length);
    if(focus!=='mixed')assert.ok(plan.tasks.every(task=>task.area===focus));
  }
  for(const options of [{minutes:0},{minutes:3},{focus:'IQ'},{offset:-1},{offset:1.1}])assert.throws(()=>api.createSession(options));
});
test('week dates handle month, year, leap-day, and daylight-saving boundaries',()=>{
  assert.deepEqual(api.createWeek({startDate:'2024-02-27'}).map(day=>day.date),['2024-02-27','2024-02-28','2024-02-29','2024-03-01','2024-03-02','2024-03-03','2024-03-04']);
  assert.equal(api.createWeek({startDate:'2026-12-29'})[6].date,'2027-01-04');
  assert.equal(api.createWeek({startDate:'2026-03-27'})[6].date,'2026-04-02');
  for(const startDate of ['2026-02-29','2026-02-30','x','2026-1-01',''])assert.throws(()=>api.createWeek({startDate}));
});
test('journal preserves task units and rejects missing or impossible values',()=>{
  assert.equal(api.validateResult(base).unit,'ms');
  assert.equal(api.validateResult({...base,task:'stroop',value:0}).unit,'% correct');
  assert.equal(api.validateResult({...base,task:'number_memory',value:4}).unit,'digits');
  for(const value of ['',null,undefined,true,NaN,Infinity,' ',0,-1,{},[]])assert.throws(()=>api.validateResult({...base,value}));
  assert.throws(()=>api.validateResult({...base,task:'stroop',value:101}));
  assert.throws(()=>api.validateResult({...base,task:'visual_memory',value:2.5}));
  assert.throws(()=>api.validateResult({...base,condition:''}));
  assert.throws(()=>api.validateResult({...base,date:'2026-02-30'}));
  assert.throws(()=>api.validateResult({...base,task:'unknown'}));
});
test('CSV quotes multiline text and neutralizes spreadsheet formulas',()=>{
  const csv=api.resultsToCsv([{...base,notes:'=HYPERLINK("example")\nsecond line',condition:'+formula'}]);
  assert.ok(csv.includes('"\'+formula"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""example"")\nsecond line"'));
  assert.ok(api.resultsToCsv([]).includes('"date","task","value","unit","condition","notes"'));
  assert.equal(api.weekToCsv(api.createWeek({startDate:'2026-10-06'})).trim().split('\r\n').length,8);
});
test('public links target the BEAPP site, never another project',()=>{
  for(const task of api.TASKS){
    assert.equal(new URL(task.url).origin,'https://brainexerciseapp.com');
    assert.ok(task.steps.length===3);
  }
  assert.ok(Object.isFrozen(api.TASKS));
});
