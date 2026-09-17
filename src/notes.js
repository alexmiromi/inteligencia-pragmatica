/* ===== caderno: destaques, anotações, exportação (incluído dentro do IIFE do shell pelo build.py) ===== */
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function findNote(id){for(var i=0;i<S.notes.length;i++)if(S.notes[i].id===id)return S.notes[i];return null}
function findHL(id){for(var i=0;i<S.hl.length;i++)if(S.hl[i].id===id)return S.hl[i];return null}
function hlText(h){return h.parts.map(function(p){return p.t}).join('\n')}
function chName(id){var i=idx(id);return i<0?'Geral':'Cap. '+CH[i].num+' · '+CH[i].title}
function plain(html){var d=document.createElement('div');d.innerHTML=html;return d.textContent}
function fmtDate(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)}
function grow(ta){ta.style.height='auto';ta.style.height=(ta.scrollHeight+2)+'px'}
function counts(){return{hl:S.hl.length,notes:S.notes.length,ex:Object.keys(S.ex).length,
  ideas:S.notes.filter(function(n){return n.idea}).length+S.hl.filter(function(h){return h.idea}).length}}
function plural(n,one,many){return n+' '+(n===1?one:many)}

/* --- blocos e destaques --- */
function indexBlocks(art){var i=0;$$('p,li,td,h2,h3',art).forEach(function(el){el.setAttribute('data-b',i++)})}
function clearMarks(art){$$('mark[data-h]',art).forEach(function(m){var p=m.parentNode;while(m.firstChild)p.insertBefore(m.firstChild,m);p.removeChild(m);p.normalize()})}
function wrap(el,s,e,id,noted){var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),n,pos=0,todo=[];
  while((n=w.nextNode())){var len=n.nodeValue.length,a=Math.max(s,pos),z=Math.min(e,pos+len);if(a<z)todo.push([n,a-pos,z-pos]);pos+=len}
  todo.forEach(function(t){var r=document.createRange();r.setStart(t[0],t[1]);r.setEnd(t[0],t[2]);
    var m=document.createElement('mark');m.setAttribute('data-h',id);if(noted)m.className='noted';r.surroundContents(m)})}
function applyHL(){var art=$('#content');if(!art)return;clearMarks(art);var all=$$('[data-b]',art);
  S.hl.filter(function(h){return h.ch===cur}).forEach(function(h){h.parts.forEach(function(p){
    var el=all[p.b];
    if(!el||el.textContent.slice(p.s,p.e)!==p.t){el=null; /* texto do capítulo mudou: procura o trecho de novo */
      for(var i=0;i<all.length;i++){var k=all[i].textContent.indexOf(p.t);if(k>=0){el=all[i];p.b=i;p.s=k;p.e=k+p.t.length;break}}}
    if(el)wrap(el,p.s,p.e,h.id,!!h.note)})})}
function partsFromRange(range){var parts=[];
  $$('#content [data-b]').forEach(function(el){if(!range.intersectsNode(el))return;
    var full=el.textContent,s=0,e=full.length,r;
    if(el.contains(range.startContainer)){r=document.createRange();r.selectNodeContents(el);r.setEnd(range.startContainer,range.startOffset);s=r.toString().length}
    if(el.contains(range.endContainer)){r=document.createRange();r.selectNodeContents(el);r.setEnd(range.endContainer,range.endOffset);e=r.toString().length}
    while(s<e&&/\s/.test(full.charAt(s)))s++;while(e>s&&/\s/.test(full.charAt(e-1)))e--;
    if(e>s)parts.push({b:+el.getAttribute('data-b'),s:s,e:e,t:full.slice(s,e)})});
  return parts}
function addHL(parts){if(!parts.length)return null;var h={id:uid(),ch:cur,parts:parts,note:'',idea:false,ts:Date.now()};
  S.hl.push(h);save();applyHL();renderChNotes();return h}
function removeHL(id){S.hl=S.hl.filter(function(h){return h.id!==id});save()}

/* --- modo marcador (toque no trecho) --- */
function setMarking(v){marking=!!v;document.body.classList.toggle('marking',marking);var b=$('#b-mark');if(b)b.setAttribute('aria-pressed',String(marking));
  if(marking)document.body.classList.remove('bar-hidden')}
$('#b-mark').onclick=function(){setMarking(!marking);toast(marking?'Marcador ligado: toque num trecho pra destacar ou tirar o destaque':'Marcador desligado')};
$('#b-note').onclick=function(){openSheet({kind:'new',ch:cur,sec:currentSec()})};
function currentSec(){var mid=window.innerHeight*.5,s='';$$('#content h2').forEach(function(h){if(h.getBoundingClientRect().top<mid)s=h.textContent});return s}

/* --- seleção de texto --- */
var selbar=$('#selbar'),lastRange=null,selT,actT=0;
document.addEventListener('selectionchange',function(){clearTimeout(selT);selT=setTimeout(function(){
  var sel=window.getSelection(),art=$('#content'),ok=false;
  if(view==='ch'&&art&&!sheetOpen&&!marking&&sel&&sel.rangeCount&&!sel.isCollapsed&&sel.toString().trim().length>1){
    var r=sel.getRangeAt(0);if(art.contains(r.startContainer)||art.contains(r.endContainer)){lastRange=r.cloneRange();ok=true}}
  selbar.classList.toggle('show',ok)},180)});
function selAction(withNote){var now=Date.now();if(now-actT<500)return;actT=now;if(!lastRange)return;
  var h=addHL(partsFromRange(lastRange));lastRange=null;selbar.classList.remove('show');
  var sel=window.getSelection();if(sel)sel.removeAllRanges();
  if(!h){toast('Não deu pra destacar esse trecho');return}
  if(withNote)openSheet({kind:'hl',id:h.id,focus:true});else toast('Destaque salvo')}
[['#sel-hl',false],['#sel-note',true]].forEach(function(p){var b=$(p[0]);
  b.addEventListener('pointerdown',function(e){e.preventDefault();selAction(p[1])});
  b.addEventListener('click',function(){selAction(p[1])})});

/* --- janela de anotação --- */
var sheet=$('#sheet'),shCtx=null,sheetOpen=false;
function openSheet(ctx){var t=$('#sh-text'),q=$('#sh-quote'),idea=$('#sh-idea'),del=$('#sh-del'),title=$('#sh-title'),o;
  if(ctx.kind==='note'){o=findNote(ctx.id);if(!o)return}
  if(ctx.kind==='hl'){o=findHL(ctx.id);if(!o)return}
  shCtx=ctx;sheetOpen=true;selbar.classList.remove('show');q.hidden=true;del.hidden=false;del.textContent='Excluir';
  if(ctx.kind==='new'){title.textContent='Nova anotação · '+chName(ctx.ch);t.value='';idea.checked=false;del.hidden=true}
  else if(ctx.kind==='note'){title.textContent='Anotação · '+chName(o.ch);t.value=o.text;idea.checked=!!o.idea}
  else{title.textContent='Destaque · '+chName(o.ch);q.hidden=false;q.textContent=hlText(o);t.value=o.note||'';idea.checked=!!o.idea;del.textContent='Remover destaque'}
  t.placeholder=ctx.kind==='hl'?'Nota sobre este trecho (opcional)':'O que você pensou? Onde dá pra aplicar?';
  sheet.hidden=false;if(ctx.kind!=='hl'||ctx.focus)t.focus()}
function closeSheet(){sheet.hidden=true;sheetOpen=false;shCtx=null}
function changed(){if(view==='ch'){applyHL();renderChNotes()}else if(view==='nb')renderNotebook(true);else if(view==='home')renderHome(true)}
$('#sh-cancel').onclick=closeSheet;
$('#sh-save').onclick=function(){var c=shCtx,v=$('#sh-text').value.trim(),idea=$('#sh-idea').checked,o;if(!c)return;
  if(c.kind==='new'){if(v)S.notes.push({id:uid(),ch:c.ch||'',sec:c.sec||'',text:v,idea:idea,ts:Date.now()})}
  else if(c.kind==='note'){o=findNote(c.id);if(o){if(v){o.text=v;o.idea=idea}else S.notes=S.notes.filter(function(n){return n.id!==c.id})}}
  else{o=findHL(c.id);if(o){o.note=v;o.idea=idea}}
  save();closeSheet();changed();if(v||c.kind==='hl')toast('Salvo neste aparelho')};
$('#sh-del').onclick=function(){var c=shCtx;if(!c)return;
  if(c.kind==='note')S.notes=S.notes.filter(function(n){return n.id!==c.id});
  if(c.kind==='hl')removeHL(c.id);
  save();closeSheet();changed();toast(c.kind==='hl'?'Destaque removido':'Anotação excluída')};

/* --- extras do capítulo: resposta do exercício, anotações, cliques --- */
function noteItemHTML(n,withCh){return '<li><button class="note-item" data-note="'+esc(n.id)+'">'+(n.idea?'<span class="tag">aplicar</span>':'')+
  '<span class="nt">'+esc(n.text)+'</span><small>'+fmtDate(n.ts)+(withCh?' · '+esc(chName(n.ch)):'')+(n.sec?' · '+esc(n.sec):'')+'</small></button></li>'}
function hlItemHTML(h,withCh){return '<li class="nb-hl"><button class="note-item" data-hl="'+esc(h.id)+'"><span class="q">'+esc(hlText(h))+'</span>'+
  (h.idea?'<span class="tag">aplicar</span>':'')+(h.note?'<span class="nt">'+esc(h.note)+'</span>':'')+
  '<small>'+fmtDate(h.ts)+(withCh?' · '+esc(chName(h.ch)):'')+'</small></button><a class="goto" href="#/c/'+esc(h.ch)+'?h='+esc(h.id)+'">ver no texto</a></li>'}
function bindItems(root){
  $$('[data-note]',root).forEach(function(b){b.onclick=function(){openSheet({kind:'note',id:b.getAttribute('data-note')})}});
  $$('[data-hl]',root).forEach(function(b){b.onclick=function(){openSheet({kind:'hl',id:b.getAttribute('data-hl')})}})}
function renderChNotes(){var box=$('#ch-notes');if(!box||view!=='ch')return;
  var ns=S.notes.filter(function(n){return n.ch===cur}),hs=S.hl.filter(function(h){return h.ch===cur});
  box.innerHTML='<h2 class="sec">Minhas anotações deste capítulo</h2>'+
    (ns.length?'<ul class="notes">'+ns.map(function(n){return noteItemHTML(n)}).join('')+'</ul>'
      :'<p class="empty" style="margin-bottom:12px">Nenhuma anotação ainda. Pra destacar, selecione um trecho do texto ou ligue o marcador lá em cima.</p>')+
    '<button class="btn" id="add-note" style="width:100%">+ Nova anotação</button>'+
    '<p class="nb-link">'+plural(hs.length,'destaque','destaques')+' neste capítulo · <a href="#/notas">abrir meu caderno</a></p>';
  $('#add-note').onclick=function(){openSheet({kind:'new',ch:cur,sec:''})};bindItems(box)}
function chapterExtras(art,id){var rc=$('.recap',art);
  if(rc){var w=document.createElement('div');w.className='exbox';
    w.innerHTML='<label for="ex-t">Minha resposta ao exercício</label><textarea id="ex-t" rows="3" placeholder="Escreva aqui. Salva sozinho."></textarea><small>Fica salvo neste aparelho e sai na exportação do caderno.</small>';
    rc.appendChild(w);var ta=$('textarea',w);ta.value=S.ex[id]||'';grow(ta);
    ta.oninput=function(){if(ta.value.trim())S.ex[id]=ta.value;else delete S.ex[id];grow(ta);clearTimeout(sv);sv=setTimeout(save,400)}}
  applyHL();renderChNotes();
  art.addEventListener('click',function(e){if(e.target.closest('a,button,textarea,input,label'))return;
    var m=e.target.closest('mark[data-h]');
    if(marking){var b=e.target.closest('[data-b]');
      if(m){removeHL(m.getAttribute('data-h'));applyHL();renderChNotes();toast('Destaque removido');return}
      if(b){var full=b.textContent,s=0,en=full.length;while(s<en&&/\s/.test(full.charAt(s)))s++;while(en>s&&/\s/.test(full.charAt(en-1)))en--;
        if(en>s){addHL([{b:+b.getAttribute('data-b'),s:s,e:en,t:full.slice(s,en)}]);toast('Destaque salvo')}}
      return}
    if(m){var sel=window.getSelection();if(sel&&!sel.isCollapsed)return;openSheet({kind:'hl',id:m.getAttribute('data-h')})}})}

/* --- exportação --- */
function exportMD(){var s=stats(),c=counts(),L=[],ideasN=S.notes.filter(function(n){return n.idea}),ideasH=S.hl.filter(function(h){return h.idea});
  L.push('# Caderno de leitura: Inteligência Pragmática','');
  L.push('Exportado em '+new Date().toLocaleDateString('pt-BR')+' · '+s.n+' de '+s.total+' capítulos lidos · '+plural(c.hl,'destaque','destaques')+' · '+plural(c.notes,'anotação','anotações')+' · '+plural(c.ideas,'ideia pra aplicar','ideias pra aplicar'),'');
  L.push('Contexto pra quem for ler: são minhas anotações do livro. O objetivo é transformar as ideias marcadas em aplicação prática.','');
  if(ideasN.length||ideasH.length){L.push('## Ideias pra aplicar na prática','');
    ideasN.forEach(function(n){L.push('- [ ] '+n.text.replace(/\n+/g,' ')+' ('+chName(n.ch)+(n.sec?', seção: '+n.sec:'')+')')});
    ideasH.forEach(function(h){L.push('- [ ] '+(h.note?h.note.replace(/\n+/g,' ')+' | ':'')+'trecho: "'+hlText(h).replace(/\n+/g,' ')+'" ('+chName(h.ch)+')')});L.push('')}
  var favs=Object.keys(S.fav).filter(function(k){return TRIG[k]}).sort();
  if(favs.length){L.push('## Meus gatilhos favoritos','');favs.forEach(function(k){L.push('- '+plain(TRIG[k].html).trim()+' ('+chName(TRIG[k].ch)+')')});L.push('')}
  [''].concat(CH.map(function(x){return x.id})).forEach(function(id){
    var hs=S.hl.filter(function(h){return (h.ch||'')===id}),ns=S.notes.filter(function(n){return (n.ch||'')===id}),ex=id&&S.ex[id];
    if(!hs.length&&!ns.length&&!ex)return;
    L.push('## '+chName(id),'');
    if(hs.length){L.push('### Destaques','');hs.forEach(function(h){hlText(h).split('\n').forEach(function(l){L.push('> '+l)});
      if(h.note)L.push('','Nota'+(h.idea?' (aplicar)':'')+': '+h.note);L.push('')})}
    if(ns.length){L.push('### Anotações','');ns.forEach(function(n){L.push('- '+(n.idea?'(aplicar) ':'')+n.text.replace(/\n/g,'\n  ')+(n.sec?' (seção: '+n.sec+')':''))});L.push('')}
    if(ex){L.push('### Exercício: minha resposta','',ex,'')}});
  return L.join('\n')}
function fileStamp(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function download(name,text,type){var b=new Blob([text],{type:type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},1500)}
function shareOrDownload(base,text,variants){
  for(var i=0;i<variants.length;i++){try{var f=new File([text],base+variants[i][0],{type:variants[i][1]});
    if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Caderno Inteligência Pragmática'}).catch(function(){});return}}catch(e){}}
  download(base+variants[0][0],text,variants[0][1]);toast('Arquivo baixado')}
function copyText(text){function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);
    ta.focus();ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();toast(ok?'Copiado. Agora é só colar na conversa.':'Não consegui copiar. Use o botão de arquivo.')}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){toast('Copiado. Agora é só colar na conversa.')},fb);else fb()}
function importJSON(txt){var o=JSON.parse(txt),d=o&&(o.state||o),added=0,k,ids={};if(!d||typeof d!=='object')throw new Error('formato');
  S.notes.forEach(function(n){ids[n.id]=1});S.hl.forEach(function(h){ids[h.id]=1});
  (d.notes||[]).forEach(function(n){if(n&&n.id&&typeof n.text==='string'&&!ids[n.id]){S.notes.push({id:String(n.id),ch:String(n.ch||''),sec:String(n.sec||''),text:n.text,idea:!!n.idea,ts:+n.ts||Date.now()});added++}});
  (d.hl||[]).forEach(function(h){if(h&&h.id&&Array.isArray(h.parts)&&!ids[h.id]){S.hl.push({id:String(h.id),ch:String(h.ch||''),note:String(h.note||''),idea:!!h.idea,ts:+h.ts||Date.now(),
    parts:h.parts.filter(function(p){return p&&typeof p.t==='string'}).map(function(p){return{b:+p.b||0,s:+p.s||0,e:+p.e||0,t:p.t}})});added++}});
  for(k in (d.ex||{}))if(!S.ex[k]&&typeof d.ex[k]==='string'){S.ex[k]=d.ex[k];added++}
  for(k in (d.read||{}))if(!S.read[k])S.read[k]=+d.read[k]||Date.now();
  for(k in (d.fav||{}))S.fav[k]=1;
  save();return added}

/* --- tela "Meu caderno" --- */
function renderNotebook(keep){var y=window.scrollY;cur=null;view='nb';document.body.classList.remove('reading');setMarking(false);
  var c=counts(),h='',empty=!c.hl&&!c.notes&&!c.ex;
  h+='<section class="cover nb"><p class="eyebrow">Meu caderno</p><h1>Anotações e destaques</h1><p class="tagline">'+plural(c.hl,'destaque','destaques')+' · '+plural(c.notes,'anotação','anotações')+
     ' · '+plural(c.ex,'exercício','exercícios')+' · '+plural(c.ideas,'ideia pra aplicar','ideias pra aplicar')+'</p>'+
     '<div class="overall"><p><b>Exportar.</b> "Copiar tudo" gera um texto pronto pra colar na conversa com o Claude. Tudo aqui fica salvo só neste aparelho, então faça backup de vez em quando.</p>'+
     '<div class="exp"><button class="btn primary" id="x-copy">Copiar tudo</button><button class="btn" id="x-share">Salvar ou enviar arquivo</button>'+
     '<button class="btn" id="x-json">Backup (.json)</button><button class="btn" id="x-imp">Restaurar backup</button></div>'+
     '<input type="file" id="x-file" accept=".json,application/json" hidden></div>'+
     '<button class="btn nb-add" id="nb-add">+ Anotação geral (sem capítulo)</button></section>';
  if(empty)h+='<p class="empty" style="margin-top:24px">Seu caderno está vazio. Durante a leitura: selecione um trecho e toque em "Destacar", use o lápis da barra pra anotar, marque "ideia pra aplicar" no que for virar ação, e responda os exercícios no fim de cada capítulo.</p>';
  var ideasN=S.notes.filter(function(n){return n.idea}),ideasH=S.hl.filter(function(x){return x.idea});
  if(ideasN.length||ideasH.length)h+='<h2 class="sec">Ideias pra aplicar</h2><ul class="notes">'+ideasN.map(function(n){return noteItemHTML(n,true)}).join('')+ideasH.map(function(x){return hlItemHTML(x,true)}).join('')+'</ul>';
  [''].concat(CH.map(function(x){return x.id})).forEach(function(id){
    var hs=S.hl.filter(function(x){return (x.ch||'')===id}),ns=S.notes.filter(function(n){return (n.ch||'')===id}),ex=id&&S.ex[id];
    if(!hs.length&&!ns.length&&!ex)return;
    h+='<h2 class="sec">'+(id?'<a href="#/c/'+esc(id)+'">'+esc(chName(id))+' →</a>':'Geral')+'</h2>';
    if(ex)h+='<div class="nb-ex"><small>Exercício: minha resposta</small><p>'+esc(ex)+'</p></div>';
    h+='<ul class="notes">'+hs.map(function(x){return hlItemHTML(x)}).join('')+ns.map(function(n){return noteItemHTML(n)}).join('')+'</ul>'});
  app.innerHTML=h;bindItems(app);
  $('#nb-add').onclick=function(){openSheet({kind:'new',ch:'',sec:''})};
  $('#x-copy').onclick=function(){copyText(exportMD())};
  $('#x-share').onclick=function(){shareOrDownload('caderno-inteligencia-pragmatica-'+fileStamp(),exportMD(),[['.md','text/markdown'],['.txt','text/plain']])};
  $('#x-json').onclick=function(){shareOrDownload('backup-inteligencia-pragmatica-'+fileStamp(),JSON.stringify({app:'inteligencia-pragmatica',v:1,exported:new Date().toISOString(),state:S},null,1),[['.json','application/json'],['.txt','text/plain']])};
  var fi=$('#x-file');$('#x-imp').onclick=function(){fi.click()};
  fi.onchange=function(){var f=fi.files&&fi.files[0];if(!f)return;var rd=new FileReader();
    rd.onload=function(){try{var n=importJSON(String(rd.result));renderNotebook();toast('Backup restaurado · '+plural(n,'item novo','itens novos'))}catch(e){toast('Arquivo inválido. Use o .json gerado pelo botão Backup.')}};rd.readAsText(f)};
  bar.innerHTML='<b>Meu caderno</b>';document.title='Meu caderno · Inteligência Pragmática';prog.style.width='0';document.body.classList.remove('bar-hidden');
  window.scrollTo(0,keep?y:0)}
