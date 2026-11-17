const ROOM='ge-ilha-principal';
const KEY='ge-word-cloud-v1-'+ROOM;
const COLORS=['#0c7971','#4036a9','#2658d7','#ad5e1a','#a83280','#196d9a','#16855e'];
const $=(id)=>document.getElementById(id);
const uid=()=>globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random().toString(36).slice(2);
const defaultState=()=>({entries:[],open:true,auto:false});
let data=defaultState();let tab='pending';let moderator=false;let firebaseDB=null;let fbRefs=null;
const bc=('BroadcastChannel' in window)?new BroadcastChannel(KEY):null;
const currentUrl=new URL(location.href);
let isModView=currentUrl.searchParams.get('view')==='moderator';
const getLocal=()=>{try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultState()}};
const persist=async()=>{
 if(firebaseDB){try{await fbRefs.set(firebaseDB,fbRefs.ref(firebaseDB,'rooms/'+ROOM),data)}catch(e){alert('Falha ao sincronizar dados: '+e.message)} }
 else {localStorage.setItem(KEY,JSON.stringify(data));bc?.postMessage(data)}
 render();
};
async function setup(){
 if(window.GE_FIREBASE_CONFIG?.databaseURL){
  try{
   const lib=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
   const dbLib=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js');
   const app=lib.initializeApp(window.GE_FIREBASE_CONFIG);firebaseDB=dbLib.getDatabase(app);fbRefs=dbLib;
   dbLib.onValue(dbLib.ref(firebaseDB,'rooms/'+ROOM),snap=>{data=snap.val()||defaultState();render()},err=>alert('Não foi possível conectar ao Firebase: '+err.message));
  }catch(e){console.error(e);alert('Firebase indisponível: usando modo local.');firebaseDB=null;data=getLocal()}
 }else data=getLocal();
 if(bc)bc.onmessage=e=>{if(!firebaseDB){data=e.data;render()}};
 window.addEventListener('storage',e=>{if(e.key===KEY&&!firebaseDB){data=getLocal();render()}});
 if(isModView){isModView=false;openPinModal()}
 render();
}
function setView(which){isModView=which==='moderator';$('participant').classList.toggle('hidden',isModView);$('moderator').classList.toggle('hidden',!isModView);document.querySelector('.header').classList.toggle('hidden',isModView);if(isModView)render();}
function openModal(title,html,actions,icon='⚿'){$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal-icon').textContent=icon;$('modal-buttons').replaceChildren();for(const a of actions){const b=document.createElement('button');b.className='btn '+(a.className||'cancel');b.textContent=a.label;b.onclick=a.action;$('modal-buttons').append(b)}$('modal-backdrop').classList.remove('hidden')}
function closeModal(){$('modal-backdrop').classList.add('hidden')}
function openPinModal(){openModal('Acesso do Moderador','<p>Digite o PIN de formador para abrir a nuvem de palavras e o painel de aprovação (PIN padrão: <strong>2026</strong>).</p><input id="pin-input" type="password" inputmode="numeric" placeholder="Digite o PIN (2026)" maxlength="20" autocomplete="off"><p id="pin-error" class="error"></p>',[{label:'Cancelar',action:closeModal},{label:'Entrar como Moderador',className:'primary',action:()=>{if($('pin-input').value===(window.GE_MODERATOR_PIN||'2026')){moderator=true;closeModal();setView('moderator')}else $('pin-error').textContent='PIN incorreto. Tente novamente.'}}]);$('pin-input').focus();$('pin-input').addEventListener('keydown',e=>{if(e.key==='Enter')$('modal-buttons').lastElementChild.click()})}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
 const ent=data.entries||[];const approved=ent.filter(x=>x.status==='approved');const pending=ent.filter(x=>x.status==='pending');
 $('total-count').textContent=ent.length;$('pending-count').textContent=pending.length;$('live-count').textContent=approved.length;
 $('pending-badge').textContent=pending.length;$('published-badge').textContent=approved.length;
 $('published-info').textContent=`${approved.length} publicadas · ${new Set(approved.map(x=>x.word.toLocaleLowerCase('pt-BR'))).size} únicas`;
 $('auto-toggle').checked=!!data.auto;$('auto-caption').textContent=data.auto?'As palavras são publicadas imediatamente':'Exige aprovação manual do moderador';
 $('status-badge').classList.toggle('closed',!data.open);$('status-badge').textContent=data.open?'● Atividade Aberta':'● Atividade Encerrada';
 $('toggle-open-btn').textContent=data.open?'♙  Encerrar Envios':'↻  Reabrir Envios';
 $('word-input').disabled=!data.open;$('word-form').querySelector('button').disabled=!data.open;
 $('participant-error').textContent=data.open?'':'Os envios estão encerrados pelo moderador.';
 $('tab-pending').classList.toggle('active',tab==='pending');$('tab-published').classList.toggle('active',tab==='published');
 const items=tab==='pending'?pending:approved;const list=$('entry-list');list.replaceChildren();
 if(!items.length){const empty=document.createElement('div');empty.className='empty-list';empty.innerHTML=tab==='pending'?'Nenhuma palavra pendente no momento.<small>Novas contribuições enviadas pelos cursistas aparecerão aqui para sua aprovação.</small>':'Nenhuma palavra publicada no momento.';list.append(empty)}
 for(const item of [...items].reverse()){
 const row=document.createElement('div');row.className='entry';const info=document.createElement('div');const strong=document.createElement('strong');strong.textContent=item.word;const small=document.createElement('small');small.textContent=tab==='pending'?'Aguardando moderação':'Publicada na nuvem';info.append(strong,small);
 const acts=document.createElement('div');acts.className='entry-actions';
 if(tab==='pending'){const ok=document.createElement('button');ok.className='btn approve';ok.textContent='✓ Aprovar';ok.onclick=()=>changeEntry(item.id,'approved');acts.append(ok)}
 const del=document.createElement('button');del.className='btn reject';del.textContent='×';del.title='Excluir palavra';del.onclick=()=>changeEntry(item.id,'deleted');acts.append(del);row.append(info,acts);list.append(row)
 }
 renderCloud(approved);
}
function renderCloud(approved){const cloud=$('cloud');cloud.replaceChildren();if(!approved.length){const e=document.createElement('div');e.className='empty-cloud';e.textContent='As palavras aprovadas aparecerão aqui.';cloud.append(e);return}
 const grouped=new Map();for(const a of approved){let k=a.word.toLocaleLowerCase('pt-BR');let v=grouped.get(k);if(v)v.count++;else grouped.set(k,{word:a.word,count:1})}
 const words=[...grouped.values()].sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word,'pt-BR'));
 // Posicionamento em linhas dinâmicas, sem sobreposição, respeitando o tamanho do painel.
 const rows=[];let current=[],widthUsed=0;for(const w of words){const relativeWidth=Math.min(0.75,Math.max(0.11,w.word.length*0.025+0.11));if(widthUsed+relativeWidth>0.94&&current.length){rows.push(current);current=[];widthUsed=0}current.push({...w,relativeWidth});widthUsed+=relativeWidth}if(current.length)rows.push(current);
 const maxCount=Math.max(...words.map(x=>x.count));const height=cloud.clientHeight||450;
 rows.forEach((row,ri)=>{const sum=row.reduce((n,w)=>n+w.relativeWidth,0);let cursor=(1-sum)/2;row.forEach((w,i)=>{let div=document.createElement('span');div.className='cloud-word';div.textContent=w.word;div.style.color=COLORS[(ri*3+i)%COLORS.length];const size=Math.max(15,Math.min(54,20+(w.count/maxCount)*28-(rows.length>5?8:0)));div.style.fontSize=`clamp(14px, ${size/10}vw, ${size}px)`;div.style.left=`${(cursor+w.relativeWidth/2)*100}%`;div.style.top=`${((ri+1)/(rows.length+1))*100}%`;div.style.maxWidth=`${w.relativeWidth*100}%`;cursor+=w.relativeWidth;cloud.append(div)})})
}
async function changeEntry(id,status){data.entries=(data.entries||[]).map(x=>x.id===id?{...x,status}:x);await persist()}
$('word-form').onsubmit=async e=>{e.preventDefault();const word=$('word-input').value.trim();if(!data.open){$('participant-error').textContent='Os envios estão encerrados.';return}if(!word||/\s/u.test(word)){$('participant-error').textContent='Digite uma única palavra, sem espaços.';return}if(word.length>36)return;data.entries??=[];data.entries.push({id:uid(),word,status:data.auto?'approved':'pending',createdAt:Date.now()});await persist();$('word-form').classList.add('hidden');$('thanks').classList.remove('hidden');$('thanks-text').textContent=data.auto?'Sua palavra já está na nuvem coletiva.':'Sua contribuição foi recebida e aguarda a aprovação do moderador.';$('participant-error').textContent='';};
$('send-again').onclick=()=>{$('word-input').value='';$('word-form').classList.remove('hidden');$('thanks').classList.add('hidden');render();$('word-input').focus()};
$('btn-moderator').onclick=openPinModal;
$('participant-btn').onclick=()=>{setView('participant');$('word-form').classList.remove('hidden');$('thanks').classList.add('hidden')};
$('tab-pending').onclick=()=>{tab='pending';render()};$('tab-published').onclick=()=>{tab='published';render()};
$('auto-toggle').onchange=async e=>{data.auto=e.target.checked;await persist()};
$('toggle-open-btn').onclick=async()=>{data.open=!data.open;await persist()};
$('reset-btn').onclick=()=>openModal('Iniciar nova rodada?','<p>Isso apagará todas as palavras recebidas e publicadas nesta sala. Esta ação não pode ser desfeita.</p>',[{label:'Cancelar',action:closeModal},{label:'Limpar e reiniciar',className:'warning',action:async()=>{data.entries=[];data.open=true;await persist();closeModal()}}],'♻');
$('share-btn').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('view');openModal('Compartilhar com Cursistas',`<p>Compartilhe o endereço abaixo. Os cursistas não precisam acessar o painel do moderador.</p><input id="share-link" readonly value="${esc(u.toString())}"><p><strong>Sala:</strong> ${ROOM}</p><p id="share-note">Para funcionar entre diferentes aparelhos, configure o Firebase conforme o arquivo README.md.</p>`,[{label:'Fechar',action:closeModal},{label:'Copiar Link',className:'primary',action:async()=>{const input=$('share-link');try{await navigator.clipboard.writeText(input.value);$('share-note').textContent='Link copiado.'}catch{input.select();$('share-note').textContent='Link selecionado: use Ctrl+C.'}}}],'♧')};
$('fullscreen-btn').onclick=()=>{const panel=document.querySelector('.cloud-panel');if(document.fullscreenElement)document.exitFullscreen();else panel.requestFullscreen?.()};
$('close-modal').onclick=closeModal;$('modal-backdrop').onclick=e=>{if(e.target===$('modal-backdrop'))closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
window.addEventListener('resize',()=>{if(isModView)renderCloud((data.entries||[]).filter(x=>x.status==='approved'))});
setup();
