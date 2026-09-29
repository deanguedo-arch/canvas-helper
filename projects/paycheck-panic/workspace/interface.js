/* User direction: illustration and plain language, no emoji in the learner UI. */
const ppPlainText=text=>String(text).replace(/⚡/gu,' energy ').replace(/😰/gu,' stress ').replace(/🙂/gu,' happiness ').replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu,'').replace(/^[ \t]+/,'');
function ppCleanText(root){
  if(root.nodeType===3){if(root.parentElement?.closest('script,style,textarea'))return;const clean=ppPlainText(root.nodeValue);if(clean!==root.nodeValue)root.nodeValue=clean;return;}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))ppCleanText(n);
}
ppCleanText(document.body);
new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')ppCleanText(r.target);else for(const n of r.addedNodes)ppCleanText(n);}}).observe(document.body,{subtree:true,childList:true,characterData:true});
const ppFillText=CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText=function(text,...rest){return ppFillText.call(this,ppPlainText(text),...rest);};
const ppStrokeText=CanvasRenderingContext2D.prototype.strokeText;
CanvasRenderingContext2D.prototype.strokeText=function(text,...rest){return ppStrokeText.call(this,ppPlainText(text),...rest);};
for(const el of document.querySelectorAll('[title],[aria-label]'))for(const attr of ['title','aria-label'])if(el.hasAttribute(attr))el.setAttribute(attr,ppPlainText(el.getAttribute(attr)));
CHARACTERS.find(c=>c.id==='classic').flav='A fresh start, with a familiar striped shirt.';
window.addEventListener('pp-art-ready',()=>{for(const cv of document.querySelectorAll('#chargrid canvas')){const ctx=cv.getContext('2d');ctx.clearRect(0,0,112,130);PPArt.person(ctx,cv.parentElement.dataset.cid,56,124,'s',0,'idle',116);}});
const ppCharacter=pickCharacter;pickCharacter=mode=>{ppCharacter(mode);for(const card of $('chargrid').children){const old=card.querySelector('img,canvas'),cv=document.createElement('canvas');cv.width=112;cv.height=130;cv.setAttribute('aria-label',charDef(card.dataset.cid).name);old.replaceWith(cv);PPArt.person(cv.getContext('2d'),card.dataset.cid,56,124,'s',0,'idle',116);card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Choose '+charDef(card.dataset.cid).name);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};}};
BUD_LABEL.other='Other expenses';
const ppIncome=noteIncome,ppSpend=noteSpend;
function ppTransaction(kind,category,amount){if(!Number.isFinite(amount))throw new Error('Invalid transaction');G.transactions=G.transactions||[];G.transactions.push({id:(G.transactionSeq=(G.transactionSeq||0)+1),month:G.month,day:G.campaign?.day||1,kind,category,amount:_r2(amount)});}
noteIncome=n=>{ppIncome(n);ppTransaction('income','income',n);};noteSpend=(c,n)=>{ppSpend(c,n);ppTransaction(c==='savings'?'transfer':'expense',c,n);};
loanExtraPay=amount=>{const L=G.loan;if(!L)return;const paid=_r2(Math.min(Number(amount),G.cash,L.bal));if(!Number.isFinite(paid)||paid<=0)return;G.cash=_r2(G.cash-paid);L.bal=_r2(L.bal-paid);L.arrears=_r2(Math.max(0,(L.arrears||0)-paid));noteSpend('debt',paid);if(L.bal<=.005)G.loan=null;addScore(5);hud();save();toast(G.loan?`Paid ${fmt$(paid)}. Balance ${fmt$(L.bal)}; overdue portion ${fmt$(L.arrears)}.`:'Loan repaid.');openBank();};
const ppLoanSchedule=showLoanSchedule;showLoanSchedule=()=>{if(G.loan?.left<=0){showMenu('Loan past maturity',`Outstanding ${fmt$(G.loan.bal)}. Overdue ${fmt$(G.loan.arrears||0)} is included in that balance. Interest continues until repayment.`,[{label:'Back to bank',fn:openBank}]);}else ppLoanSchedule();};
const ppHudPortrait=hud;hud=()=>{ppHudPortrait();const old=$('avatar');if(!old)return;let cv=$('ppAvatar');if(!cv){cv=document.createElement('canvas');cv.id='ppAvatar';cv.width=70;cv.height=90;cv.style.cssText='width:38px;height:46px;object-fit:cover';old.after(cv);old.hidden=true;}const ctx=cv.getContext('2d');ctx.clearRect(0,0,70,90);PPArt.person(ctx,G.char,35,128,'s',0,'idle',120);};
const ppMarket=renderMarket;renderMarket=()=>{ppMarket();const art={bread:'bread',eggs:'eggs',chicken:'chicken',milk:'milk',cheese:'cheese',apples:'apple',oj:'juice'};for(const card of document.querySelectorAll('.mktitem')){const id=card.querySelector('[data-mi]')?.dataset.mi;if(!id)continue;const cv=document.createElement('canvas');cv.width=80;cv.height=80;cv.className='market-illustration';cv.setAttribute('aria-hidden','true');card.prepend(cv);const sheet=id==='coffee'?'props':art[id]?'groceries':'groceriesExtra';PPArt.sprite(cv.getContext('2d'),sheet,art[id]||id,40,78,68,70);for(const b of card.querySelectorAll('button'))b.setAttribute('aria-label',(b.dataset.d==='1'?'Add ':'Remove ')+GROC_ITEMS.find(i=>i.id===id).name);}};
