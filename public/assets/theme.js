// ── btdat.io.vn Shared Theme ──
(function(T){
  const KEY='btdat-theme';
  function init(){
    const h=T.documentElement;
    let s=localStorage.getItem(KEY);
    if(!s){s=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';localStorage.setItem(KEY,s)}
    h.setAttribute('data-theme',s);
  }
  function toggle(){
    const h=T.documentElement;
    const n=h.getAttribute('data-theme')==='light'?'dark':'light';
    h.setAttribute('data-theme',n);
    localStorage.setItem(KEY,n);
    T.querySelectorAll('.theme-btn-icon').forEach(e=>{e.textContent=n==='light'?'🌙':'☀️'});
  }
  init();
  T.querySelectorAll('.theme-btn').forEach(b=>b.addEventListener('click',toggle));
  T.addEventListener('click',e=>{const b=e.target.closest('.theme-btn');if(b)return toggle()});
  // Re-run on dynamically added theme btns
  const obs=new MutationObserver(()=>T.querySelectorAll('.theme-btn:not([data-bound])').forEach(b=>{b.dataset.bound='1';b.addEventListener('click',toggle)}));
  obs.observe(T.body,{childList:true,subtree:true});
})(document);

// ── Toast ──
function toast(msg,type='success',duration=3000){
  const c=document.querySelector('.toast-container')||(()=>{const d=document.createElement('div');d.className='toast-container';document.body.appendChild(d);return d})();
  const t=document.createElement('div');t.className='toast '+type;t.innerHTML=msg;
  c.appendChild(t);
  setTimeout(()=>{t.classList.add('removing');setTimeout(()=>t.remove(),250)},duration);
}
