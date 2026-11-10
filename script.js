/* ============================================================
   SCRIPT.JS – interaktivita portfólia
   Sekcie: dáta → projekty a filter → okno detailu → proces
   → počítadlá → hero kríž → scroll → navigácia/téma
   ============================================================ */

/* Skratky: $ = jeden prvok, $$ = pole všetkých zhodných prvkov */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

/* ============================================================
   DÁTA – projekty sa čítajú z index.html (karty), tu sú kroky procesu
   ============================================================ */
// Projekty sa načítajú priamo z kariet v index.html (názov = <h3>, kategória = <small>, ostatné z data-* atribútov)
const cards=$$('.card');
const projects=cards.map(c=>({t:$('h3',c).textContent,c:$('small',c).textContent,y:c.dataset.year,r:c.dataset.role,d:c.dataset.desc}));
// Kroky procesu: [názov, popis]
const steps=[['Zoznámenie','Spoločne si ujasníme cieľ, publikum a rozpočet. Výstupom je stručné zadanie.'],['Koncept','Pripravím tri smery s náčrtmi a moodboardom. Vyberieme ten, ktorý sedí.'],['Dizajn','Vybraný smer rozpracujem do detailu a spolu ho doladíme v dvoch kolách úprav.'],['Odovzdanie','Dostanete finálne súbory, manuál a podporu pri zavedení.']];

/* ============================================================
   BEŽIACI PÁS SLUŽIEB – obsah sa vloží dvakrát, aby animácia bola plynulá
   ============================================================ */
// Služby zmeníš úpravou slov v poli nižšie
$('#mq').innerHTML=Array(2).fill(['Branding','Plagáty','Typografia','Web dizajn','3D vizuály','Sociálne siete'].map(x=>`<span>${x}</span>`).join('')).join('');

/* ============================================================
   VIDEO POZADIE HERO – šetrenie výkonu a ohľad na nastavenie animácií
   ============================================================ */
// Video sa zastaví, keď hero nie je vidieť, a nespustí sa vôbec, ak má používateľ v systéme vypnuté animácie
const bgVideo=$('.hero-bg video');
if(bgVideo){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){bgVideo.removeAttribute('autoplay');bgVideo.pause()}
  else new IntersectionObserver(([e])=>{e.isIntersecting?bgVideo.play().catch(()=>{}):bgVideo.pause()}).observe($('#hero'));
}

/* ============================================================
   PROJEKTY + FILTER – vygeneruje filtre a karty a skrýva karty podľa kategórie
   ============================================================ */
// Kategórie sa odvodia automaticky z projektov, na začiatok pridáme "Všetko"
const cats=['Všetko',...new Set(projects.map(p=>p.c))];
$('#filters').innerHTML=cats.map((c,i)=>`<button class="chip" aria-pressed="${i==0}" data-c="${c}">${c}</button>`).join('');
// Každej karte pridelíme poradie (data-i) a kategóriu (data-c) pre filter a okno s detailom
cards.forEach((c,i)=>{c.dataset.i=i;c.dataset.c=projects[i].c});
// Klik na filter: označí aktívne tlačidlo a skryje karty z iných kategórií
$('#filters').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
  $$('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));
  $$('.card').forEach(c=>c.classList.toggle('hide',b.dataset.c!=='Všetko'&&c.dataset.c!==b.dataset.c));});

/* ============================================================
   OKNO S DETAILOM PROJEKTU
   ============================================================ */
// 'cur' = index zobrazeného projektu; vis() vráti indexy práve viditeľných (vyfiltrovaných) kariet
const dlg=$('#dlg');let cur=0;
const vis=()=>$$('.card:not(.hide)').map(c=>+c.dataset.i);
// Galéria v okne: obrázky a videá sa berú z <template class="gallery"> v karte projektu (index.html)
let media=[];
function loadMedia(i){
  const tpl=cards[i].querySelector('template.gallery');
  media=tpl?[...tpl.content.querySelectorAll('img,video')].map(n=>n.cloneNode(true)):[];
  const th=$('#dlThumbs');th.innerHTML='';
  media.forEach((m,k)=>{                       // jeden náhľad (thumbnail) pre každé médium
    const isV=m.tagName==='VIDEO',src=isV?m.getAttribute('poster'):m.getAttribute('src');
    const b=document.createElement('button');b.className='thumb';b.type='button';
    b.setAttribute('aria-label',`Zobraziť ${k+1} z ${media.length}`);
    b.innerHTML=(src?`<img src="${src}" alt="">`:'')+(isV?'<i>▶</i>':'');
    b.onclick=()=>setMedia(k);th.append(b);
  });
  th.hidden=media.length<2;                     // pri jedinom médiu náhľady nepotrebujeme
  setMedia(0);
}
// Zobrazí médium k vo veľkom okne (video sa spustí) a označí jeho náhľad
function setMedia(k){
  const v=$('#dlView');v.innerHTML='';v.scrollTop=0;
  if(!media.length){v.innerHTML='<div class="ph" style="aspect-ratio:4/3"><span>Bez obrázka</span></div>';return}
  const m=media[k].cloneNode(true);
  if(m.tagName==='VIDEO'){m.controls=true;m.autoplay=true;m.muted=true;m.loop=true;m.playsInline=true;m.preload='auto'}
  v.append(m);
  $$('.thumb').forEach((t,x)=>t.setAttribute('aria-current',x===k));
}
// Po zatvorení okna vyprázdnime galériu, aby sa zastavilo video
dlg.addEventListener('close',()=>{$('#dlView').innerHTML=''});

// Naplní okno údajmi projektu s indexom i
function show(i){cur=i;const p=projects[i];$('#dlTitle').textContent=p.t;
  $('#dlText').textContent=p.d;
  loadMedia(i);
  $('#dlMeta').innerHTML=`<dt>Kategória</dt><dd>${p.c}</dd><dt>Rok</dt><dd>${p.y}</dd><dt>Rozsah</dt><dd>${p.r}</dd>`;}
$('#grid').addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;show(+c.dataset.i);dlg.showModal();});
// Posun na predošlý (-1) / ďalší (+1) viditeľný projekt, na konci sa točí dokola
function step(d){const v=vis();show(v[(v.indexOf(cur)+d+v.length)%v.length]);}
$('#prev').onclick=()=>step(-1);$('#next').onclick=()=>step(1);$('#close').onclick=()=>dlg.close();
$('#dlCta').onclick=()=>dlg.close();
// Zatvorenie klikom mimo okna; šípky na klávesnici listujú projektmi
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
dlg.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});

/* ============================================================
   PROCES – prepínanie krokov
   ============================================================ */
let st=0;
$('#tabs').innerHTML=steps.map((s,i)=>`<button class="tab" role="tab" aria-selected="${i==0}" data-i="${i}">${i+1}. ${s[0]}</button>`).join('');
// Zobrazí krok i: označí záložku, vypíše text a posunie ukazovateľ
function setStep(i){st=i;$$('.tab').forEach((t,j)=>t.setAttribute('aria-selected',j===i));$('#pT').textContent=steps[i][0];$('#pP').textContent=steps[i][1];$('#pBar').style.width=((i+1)/steps.length*100)+'%';}
$('#tabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(t)setStep(+t.dataset.i)});
setStep(0);

/* ============================================================
   POČÍTADLÁ – číslo sa roztočí, keď sekcia vojde do obrazovky
   ============================================================ */
// IntersectionObserver spustí počítanie raz, keď je sekcia z polovice viditeľná
new IntersectionObserver((en,ob)=>en.forEach(x=>{if(!x.isIntersecting)return;ob.unobserve(x.target);
  $$('b[data-to]',x.target).forEach(n=>{const to=+n.dataset.to,t0=performance.now();
    (function f(t){const k=Math.min((t-t0)/1200,1);n.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)})}),{threshold:.5}).observe($('#stats'));

/* ============================================================
   HERO – zameriavací kríž sledujúci kurzor
   ============================================================ */
// Kríž sa umiestni podľa pozície myši vzhľadom na hero
const hero=$('#hero'),xh=$('#xhair');
hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  $('.h',xh).style.top=y+'px';$('.v',xh).style.left=x+'px';const c=$('#coords');c.style.left=x+'px';c.style.top=y+'px';c.textContent=Math.round(x)+', '+Math.round(y);});

/* ============================================================
   SCROLL – ukazovateľ čítania, tieň hlavičky, aktívna položka menu, tlačidlo "Hore"
   ============================================================ */
// Pri scrollovaní: šírka ukazovateľa = percento prejdenej stránky
const secs=$$('main section[id]'),links=$$('#nav a');
addEventListener('scroll',()=>{const h=document.documentElement,p=scrollY/(h.scrollHeight-innerHeight);
  $('#progress').style.width=(p*100)+'%';$('#hdr').classList.toggle('scrolled',scrollY>10);$('#top').classList.toggle('show',scrollY>600);
  let id='';secs.forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.4)id=s.id});
  links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));},{passive:true});
$('#top').onclick=()=>scrollTo({top:0});

/* ============================================================
   NAVIGÁCIA A TÉMA – mobilné menu a prepínanie svetlej/tmavej témy
   ============================================================ */
$('#burger').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#burger').setAttribute('aria-expanded',o)};
links.forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
// Téma: ručná voľba (data-theme) má prednosť pred nastavením systému
const root=document.documentElement,mq=matchMedia('(prefers-color-scheme: dark)');
const isDark=()=>root.dataset.theme?root.dataset.theme==='dark':mq.matches;
const lab=()=>$('#themeBtn').textContent=isDark()?'Svetlá':'Tmavá';lab();
$('#themeBtn').onclick=()=>{root.dataset.theme=isDark()?'light':'dark';lab()};
