/* Rounded planning conversions; no live exchange-rate API or personal data requests. */
const formattedMoneyNodes = new WeakSet();
const inrNumber = value => Math.round(value).toLocaleString('en-IN');
const inrRange = (low, high=low) => `₹${inrNumber(low)}${Math.round(low)===Math.round(high)?'':`–${inrNumber(high)}`} (INR)`;
function foreignRange(currency,low,high=low){
 const prefix={NZD:'NZ$',AUD:'AU$',CNY:'CNY ',INR:'₹'}[currency];
 if(currency==='INR')return inrRange(low,high);
 const native=`${prefix}${low.toLocaleString('en-IN')}${low===high?'':`–${high.toLocaleString('en-IN')}`}`;
 return `${native} (INR ${inrRange(low*data.exchangeRates[currency],high*data.exchangeRates[currency]).replace(' (INR)','')})`;
}
function annotateMoneyText(value){
 const placeholders=[];
 const foreign=/(NZ\$|AU\$|NZD\s+|AUD\s+|CNY\s+|¥)(\d[\d,]*(?:\.\d+)?)(?:\s*[–-]\s*(\d[\d,]*(?:\.\d+)?))?/g;
 let result=value.replace(foreign,(match,prefix,low,high)=>{
  const currency=prefix.startsWith('NZ')?'NZD':prefix.startsWith('AU')?'AUD':'CNY';
  placeholders.push(foreignRange(currency,Number(low.replaceAll(',','')),high===undefined?Number(low.replaceAll(',','')):Number(high.replaceAll(',',''))));
  return `\u0001${placeholders.length-1}\u0002`;
 });
 result=result.replace(/₹\d[\d,]*(?:\.\d+)?(?:\s*[–-]\s*\d[\d,]*(?:\.\d+)?)?/g,(match,offset,text)=>text.slice(offset+match.length).startsWith(' (INR)')?match:`${match} (INR)`);
 return result.replace(/\u0001(\d+)\u0002/g,(_,i)=>placeholders[Number(i)]);
}
function annotatePageMoney(root=document.querySelector('main')){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walker.nextNode())){
  if(formattedMoneyNodes.has(node)||node.parentElement.closest('script,style,textarea,input,[data-money-formatted]'))continue;
  if(/[₹¥]|NZ\$|AU\$|\b(?:NZD|AUD|CNY)\s+\d/.test(node.nodeValue))node.nodeValue=annotateMoneyText(node.nodeValue);
  formattedMoneyNodes.add(node);
 }
}
function budgetHTML(){
 const budget=data.budget;
 return `<section id="budget" class="content-section budget-section"><p class="eyebrow">THE WHOLE JOURNEY · PER PERSON</p><h2>Approximate trip budget.</h2><div class="budget-box"><p>${escapeHTML(budget.scope)}</p><p class="muted">${escapeHTML(budget.basis)}</p><div class="budget-total"><span>Estimated total for one person</span><strong id="budget-total" aria-live="polite" data-money-formatted></strong><small>Including 10% contingency · two travellers sharing costs</small></div><div class="budget-choices"><label><input type="checkbox" id="budget-extras">${escapeHTML(budget.optionalReserve.label)}</label><small>${escapeHTML(budget.optionalReserve.note)}</small><label><input type="checkbox" id="budget-guangzhou">${escapeHTML(budget.guangzhou.label)}</label><small>${escapeHTML(budget.guangzhou.note)}</small></div><details class="budget-breakdown"><summary>View per-person breakdown & assumptions</summary><div class="budget-table-wrap"><table class="budget-table"><caption>All amounts in this table are per person; shared room / car totals divided by two.</caption><thead><tr><th scope="col">Cost</th><th scope="col">Per person</th><th scope="col">Basis</th></tr></thead><tbody>${budget.rows.map(r=>`<tr><th scope="row">${escapeHTML(r.label)}</th><td data-money-formatted>${foreignRange(r.currency,r.low/r.share,r.high/r.share)}</td><td>${escapeHTML(r.note)}</td></tr>`).join('')}<tr id="budget-layover-row"></tr><tr id="budget-extras-row" hidden></tr><tr><th scope="row">Subtotal</th><td id="budget-subtotal" data-money-formatted></td><td>Selected allowances before contingency.</td></tr><tr><th scope="row">Contingency · 10%</th><td id="budget-contingency" data-money-formatted></td><td>Added once to the subtotal.</td></tr></tbody></table></div></details><p class="budget-exclusions">${escapeHTML(budget.excluded)}</p><details class="budget-rate-details"><summary>INR conversion rates</summary><p data-money-formatted>Rounded planning rates checked ${escapeHTML(data.exchangeRates.checked)}: NZ$1 = ₹${data.exchangeRates.NZD} (INR); AU$1 = ₹${data.exchangeRates.AUD} (INR); CNY 1 = ₹${data.exchangeRates.CNY} (INR). These are reference conversions, not card / cash quotes. Bank fees and travel-date rates may differ.</p><p>${data.exchangeRates.sources.map(([label,url])=>`<a class="source" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`).join(' · ')}</p></details></div></section>`;
}
function calculateBudget(extras=false,guangzhou=false){
 const b=data.budget;
 let low=0,high=0;
 for(const r of b.rows){low+=r.low/r.share*data.exchangeRates[r.currency];high+=r.high/r.share*data.exchangeRates[r.currency]}
 const layover=guangzhou?b.guangzhou:b.layoverBase;
 low+=layover.low*data.exchangeRates[layover.currency];high+=layover.high*data.exchangeRates[layover.currency];
 if(extras){low+=b.optionalReserve.low;high+=b.optionalReserve.high}
 return {low,high,totalLow:low*(1+b.contingency),totalHigh:high*(1+b.contingency)};
}
function setupBudget(){
 const extras=document.getElementById('budget-extras'),city=document.getElementById('budget-guangzhou');
 const update=()=>{
  const b=data.budget,totals=calculateBudget(extras.checked,city.checked);
  document.getElementById('budget-total').textContent=inrRange(totals.totalLow,totals.totalHigh);
  document.getElementById('budget-subtotal').textContent=inrRange(totals.low,totals.high);
  document.getElementById('budget-contingency').textContent=inrRange(totals.low*b.contingency,totals.high*b.contingency);
  const layover=city.checked?b.guangzhou:b.layoverBase;
  document.getElementById('budget-layover-row').innerHTML=`<th scope="row">Guangzhou · ${city.checked?'conditional city outing':'airport meals'}</th><td data-money-formatted>${foreignRange(layover.currency,layover.low,layover.high)}</td><td>${escapeHTML(city.checked?b.guangzhou.note:b.layoverBase.note)}</td>`;
  const extraRow=document.getElementById('budget-extras-row');extraRow.hidden=!extras.checked;
  extraRow.innerHTML=`<th scope="row">Selected optional activities reserve</th><td data-money-formatted>${inrRange(b.optionalReserve.low,b.optionalReserve.high)}</td><td>${escapeHTML(b.optionalReserve.note)}</td>`;
 };
 extras.addEventListener('change',update);city.addEventListener('change',update);update();
}
