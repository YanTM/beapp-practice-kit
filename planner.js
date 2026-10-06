/* BEAPP Practice Kit — MIT. This module has no network, storage, or telemetry. */
(function(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeappPractice = api;
})(typeof globalThis === 'object' ? globalThis : this, function() {
  'use strict';
  const TASKS = Object.freeze([
    {id:'reaction',name:'Reaction Time',area:'reaction',path:'/reaction-time-test/',unit:'ms',label:'Response time (ms)',min:0.01,
      steps:['Wait until the signal changes.','Then click or tap as quickly as you can.','Finish the attempt and read the result.'],
      tip:'An early click is a mistake. Keep the same device and input method when comparing attempts.',
      read:'Write the response time shown by the test. Note early clicks separately.'},
    {id:'number_memory',name:'Number Memory',area:'memory',path:'/number-memory-test/',unit:'digits',label:'Digits recalled',min:0,integer:true,
      steps:['Look at the number while it is visible.','When it disappears, type it from memory.','Submit your answer and continue as the test directs.'],
      tip:'Keep the digits in order. Record the recall result shown at the end.',
      read:'Write the digits recalled result. Compare the same test and difficulty.'},
    {id:'stroop',name:'Stroop Test',area:'attention',path:'/stroop-test/',unit:'% correct',label:'Correct answers (%)',min:0,max:100,
      steps:['Look at the ink color of the word.','Choose the answer that matches the ink color.','Ignore what the written word says.'],
      tip:'If “BLUE” is printed in red, choose red. Read accuracy together with speed.',
      read:'Write correct answers as a percentage. Add the time to your notes if shown.'},
    {id:'visual_memory',name:'Visual Memory',area:'memory',path:'/visual-memory-test/',unit:'cells',label:'Cells recalled',min:0,integer:true,
      steps:['Look at the highlighted cells.','Remember their positions after they disappear.','Select the cells you remember.'],
      tip:'Notice the whole pattern. Track incorrect selections as well as the amount recalled.',
      read:'Write the cells recalled result. Keep difficulty consistent when comparing attempts.'},
    {id:'pattern_recognition',name:'Pattern Recognition',area:'thinking',path:'/pattern-recognition-test/',unit:'% correct',label:'Correct answers (%)',min:0,max:100,
      steps:['Look at the sequence or pattern.','Find what changes from one item to the next.','Choose the answer that follows the same rule.'],
      tip:'Check shape, number, position, and direction. If you miss an answer, revisit the rule.',
      read:'Write correct answers as a percentage. Note the kind of rule you missed.'},
    {id:'visual_search',name:'Visual Search',area:'attention',path:'/visual-search-test/',unit:'% correct',label:'Correct answers (%)',min:0,max:100,
      steps:['Read the target shown in the instructions.','Scan the items on screen for that target.','Choose the matching item using the test controls.'],
      tip:'Follow the current target carefully. Record time alongside accuracy if both are shown.',
      read:'Write correct answers as a percentage. Keep target difficulty and device consistent.'},
    {id:'choice_reaction',name:'Choice Reaction',area:'reaction',path:'/choice-reaction-test/',unit:'ms',label:'Response time (ms)',min:0.01,
      steps:['Read which response belongs to each signal.','Wait for the signal to appear.','Choose the matching response.'],
      tip:'The right response matters as well as speed. Note incorrect responses separately.',
      read:'Write the response time shown. Keep the task and conditions the same.'},
    {id:'mental_rotation',name:'Mental Rotation',area:'thinking',path:'/mental-rotation-test/',unit:'% correct',label:'Correct answers (%)',min:0,max:100,
      steps:['Look closely at the reference shape.','Imagine turning it without changing its shape.','Choose the option that matches after rotation.'],
      tip:'A mirrored shape is different from a rotated shape. Check the smaller details.',
      read:'Write correct answers as a percentage. Note the shapes that were difficult.'}
  ].map(task=>Object.freeze({...task,steps:Object.freeze(task.steps),url:'https://brainexerciseapp.com'+task.path})));
  const AREAS = Object.freeze(['mixed','memory','attention','reaction','thinking']);
  function getTask(id) {
    const task = TASKS.find(item=>item.id===id);
    if (!task) throw new RangeError('Choose a known exercise.');
    return task;
  }
  function createSession({minutes=5,focus='mixed',offset=0}={}) {
    if (![2,5,8].includes(minutes)) throw new RangeError('Choose 2, 5, or 8 minutes.');
    if (!AREAS.includes(focus)) throw new RangeError('Choose a known skill area.');
    if (!Number.isInteger(offset)||offset<0) throw new RangeError('Offset must be a non-negative integer.');
    const pool = focus==='mixed'?TASKS:TASKS.filter(task=>task.area===focus);
    const count = Math.min({2:1,5:2,8:3}[minutes],pool.length);
    return {minutes,focus,tasks:Array.from({length:count},(_,i)=>pool[(offset+i)%pool.length]),
      note:'Times are a planning guide. Finish one attempt at a comfortable pace; stop when you need a break.'};
  }
  function validateDate(value) {
    if (typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError('Use a date in YYYY-MM-DD format.');
    const date = new Date(value+'T00:00:00Z');
    if (!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value) throw new RangeError('Choose a real calendar date.');
    return date;
  }
  function createWeek({startDate,minutes=5,focus='mixed'}={}) {
    const start = validateDate(startDate);
    return Array.from({length:7},(_,i)=>{
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate()+i);
      return {date:date.toISOString().slice(0,10),...createSession({minutes,focus,offset:i})};
    });
  }
  function validateResult(raw) {
    if (!raw||typeof raw!=='object') throw new TypeError('Provide a result.');
    validateDate(raw.date);
    const task = getTask(raw.task);
    if (!['number','string'].includes(typeof raw.value)||(typeof raw.value==='string'&&!raw.value.trim())) throw new RangeError('Enter a result value.');
    const value = Number(raw.value);
    if (!Number.isFinite(value)||value<task.min||(task.max!==undefined&&value>task.max)||(task.integer&&!Number.isInteger(value))) throw new RangeError('Enter a valid '+task.label.toLowerCase()+' value.');
    if (typeof raw.condition!=='string'||!raw.condition.trim()||raw.condition.length>120) throw new RangeError('Describe the difficulty, device, and input method (up to 120 characters).');
    if (raw.notes!==undefined&&(typeof raw.notes!=='string'||raw.notes.length>500)) throw new RangeError('Keep notes under 500 characters.');
    return {date:raw.date,task:task.id,value,unit:task.unit,condition:raw.condition.trim(),notes:(raw.notes||'').trim()};
  }
  function csvCell(value) {
    const text = String(value??'');
    // User text must stay text when opened by a spreadsheet.
    const safe = /^[\s]*[=+\-@]/.test(text)?"'"+text:text;
    return '"'+safe.replaceAll('"','""')+'"';
  }
  function toCsv(rows,columns) {
    return columns.map(csvCell).join(',')+'\r\n'+rows.map(row=>columns.map(key=>csvCell(row[key])).join(',')).join('\r\n')+'\r\n';
  }
  function resultsToCsv(results) {
    if (!Array.isArray(results)) throw new TypeError('Provide a result list.');
    return toCsv(results.map(validateResult),['date','task','value','unit','condition','notes']);
  }
  function weekToCsv(week) {
    return toCsv(week.map(day=>({date:day.date,minutes:day.minutes,focus:day.focus,
      exercises:day.tasks.map(task=>task.name).join(' / '),links:day.tasks.map(task=>task.url).join(' / ')})),
      ['date','minutes','focus','exercises','links']);
  }
  return Object.freeze({TASKS,AREAS,getTask,createSession,createWeek,validateResult,resultsToCsv,weekToCsv});
});
