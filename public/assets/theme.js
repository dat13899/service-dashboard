// ── btdat.io.vn Shared Theme — Liquid Glass ──
(function(T){
  const KEY='btdat-theme';
  function getTheme(){
    let s=localStorage.getItem(KEY);
    if(!s){s=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';localStorage.setItem(KEY,s)}
    return s;
  }
  function setBlobVars(theme){
    const dark={blob1:'#818cf8',blob2:'#06b6d4',blob3:'#a855f7',blob4:'#f59e0b'};
    const light={blob1:'#f472b6',blob2:'#fb923c',blob3:'#a78bfa',blob4:'#34d399'};
    const b=theme==='light'?light:dark;
    T.documentElement.style.setProperty('--blob-1',b.blob1);
    T.documentElement.style.setProperty('--blob-2',b.blob2);
    T.documentElement.style.setProperty('--blob-3',b.blob3);
    T.documentElement.style.setProperty('--blob-4',b.blob4);
  }
  function apply(s){
    T.documentElement.setAttribute('data-theme',s);
    setBlobVars(s);
    T.querySelectorAll('.theme-btn-icon').forEach(e=>{e.textContent=s==='light'?'🌙':'☀️'});
  }
  window.toggleTheme=function(){
    const h=T.documentElement;
    const n=h.getAttribute('data-theme')==='light'?'dark':'light';
    localStorage.setItem(KEY,n);
    apply(n);
  };
  apply(getTheme());
})(document);

// ── Toast ──
function toast(msg,type='success',duration=3000){
  const c=document.querySelector('.toast-container')||(()=>{const d=document.createElement('div');d.className='toast-container';document.body.appendChild(d);return d})();
  const t=document.createElement('div');t.className='toast '+type;t.innerHTML=msg;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('removing');setTimeout(()=>t.remove(),250)},duration);
}

// ── Scroll reveal + glass navbar ──
(function(){
  let ro=null;
  function initReveal(){
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el=>{
      if(el.getBoundingClientRect().top<window.innerHeight-60)el.classList.add('visible');
    });
    if(ro)ro.disconnect();
    ro=new IntersectionObserver(ents=>{ents.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{rootMargin:'0px 0px -60px 0px'});
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el=>ro.observe(el));
  }
  // Glass navbar scroll
  const nav=document.querySelector('.navbar.is-glass');
  if(nav){
    const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initReveal);
  else initReveal();
  window.addEventListener('load',initReveal);
  // Re-check on dynamic content
  const mo=new MutationObserver(()=>initReveal());
  mo.observe(document.body,{childList:true,subtree:true});
})();
