/* Browser companion: journal entries stay in this browser only. */
(function(){
  'use strict';
  const api = window.BeappPractice, $ = id=>document.getElementById(id);
  const KEY = 'beapp_practice_kit_journal_v1';
  const today = new Date();
  const date = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  const escape = value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const status = (id,text,error=false)=>{ $(id).textContent=text; $(id).classList.toggle('error',error); };
  function options(){
    const data = new FormData($('plan-form'));
    return {minutes:Number(data.get('minutes')),focus:data.get('focus')};
  }
  function renderSession(){
    const session = api.createSession(options());
    $('session').innerHTML='<h3>Your '+session.minutes+'-minute starting route</h3><p>Read the rules, finish an attempt, and note the result.</p><ol>'+
      session.tasks.map((task,i)=>'<li><span class="step-number">'+String(i+1).padStart(2,'0')+'</span><div><a target="_blank" rel="noopener" href="'+task.url+'">'+task.name+' ↗</a><small>'+escape(task.steps[0])+'</small></div></li>').join('')+
      '</ol><a class="button primary" target="_blank" rel="noopener" href="'+session.tasks[0].url+'">Start with '+session.tasks[0].name+' ↗</a>';
  }
  function readResults(){
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)||list.length>1000) throw new Error('The saved journal could not be read. Your existing data has been left in place.');
    return list.map(api.validateResult);
  }
  let entries=[];
  function renderResults(){
    $('download-results').disabled=entries.length===0;
    $('results').innerHTML=entries.length?entries.slice(-20).reverse().map(row=>{
      const task=api.getTask(row.task);
      return '<article class="result-row"><div><strong>'+task.name+'</strong><strong>'+row.value+' '+escape(task.unit)+'</strong></div><small>'+escape(row.date)+' · '+escape(row.condition)+'</small>'+
        (row.notes?'<p>'+escape(row.notes)+'</p>':'')+'</article>';
    }).join(''):'<div class="empty"><strong>Your first result goes here.</strong><p>Finish one exercise on BEAPP, then copy its result into this journal.</p></div>';
    if (entries.length>20) status('storage-status','Showing the latest 20 results. Export CSV includes all '+entries.length+' entries.');
  }
  function refreshResults(){
    try {entries=readResults(); status('storage-status',''); renderResults();}
    catch(error){status('storage-status',error.message+' Export any unsaved entries before leaving this page.',true);}
  }
  function updateValue(){
    const task=api.getTask($('result-task').value), input=$('result-value');
    $('value-label').textContent=task.label;
    $('value-help').textContent=task.read;
    input.min=task.min; input.step=task.integer?'1':'any';
    if (task.max!==undefined) input.max=task.max; else input.removeAttribute('max');
    input.value='';
  }
  function download(filename,text){
    const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');
    anchor.href=url; anchor.download=filename; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  $('week-start').value=date; $('result-date').value=date;
  $('result-task').innerHTML=api.TASKS.map(task=>'<option value="'+task.id+'">'+task.name+'</option>').join('');
  $('exercise-guide').innerHTML=api.TASKS.map(task=>'<article class="card exercise"><img src="assets/'+task.area+'.svg" alt=""><h3>'+task.name+'</h3><p>'+task.read+'</p><details><summary>How to do it</summary><div class="answer"><ol>'+task.steps.map(step=>'<li>'+escape(step)+'</li>').join('')+'</ol><p class="tip">'+escape(task.tip)+'</p></div></details><a target="_blank" rel="noopener" href="'+task.url+'">Try '+task.name+' ↗</a></article>').join('');
  $('plan-form').addEventListener('change',renderSession);
  $('plan-form').addEventListener('submit',event=>event.preventDefault());
  $('result-task').addEventListener('change',updateValue);
  $('download-week').addEventListener('click',()=>{
    try {download('beapp-practice-plan.csv',api.weekToCsv(api.createWeek({startDate:$('week-start').value,...options()})));status('week-status','Your 7-day CSV plan is ready. Each day is optional.');}
    catch(error){status('week-status',error.message,true);}
  });
  $('print-plan').addEventListener('click',()=>window.print());
  $('result-form').addEventListener('submit',event=>{
    event.preventDefault();
    let row;
    try {row=api.validateResult({date:$('result-date').value,task:$('result-task').value,value:$('result-value').value,condition:$('result-condition').value,notes:$('result-notes').value});}
    catch(error){status('save-status',error.message,true);return;}
    try {
      const current=readResults();
      if(current.length>=1000){status('save-status','This journal has 1,000 entries. Export CSV to keep a copy.',true);return;}
      const next=[...current,row];
      localStorage.setItem(KEY,JSON.stringify(next));
      entries=next;status('save-status','Saved in this browser.');status('storage-status','');renderResults();
      $('result-value').value='';$('result-notes').value='';
    } catch(error) {
      // Preserve an exportable in-memory entry when storage is unavailable.
      entries=[...entries,row];renderResults();
      status('save-status','Could not save to browser storage. This entry is temporary: export CSV before leaving or reloading.',true);
    }
  });
  $('download-results').addEventListener('click',()=>{
    if(entries.length) download('beapp-practice-journal.csv',api.resultsToCsv(entries));
  });
  window.addEventListener('storage',event=>{if(event.key===KEY) refreshResults();});
  renderSession();updateValue();refreshResults();
})();
