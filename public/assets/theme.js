// ── btdat.io.vn Shared Theme ──
(function(T){
  const KEY='btdat-theme';
  function getTheme(){
    let s=localStorage.getItem(KEY);
    if(!s){s=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';localStorage.setItem(KEY,s)}
    return s;
  }
  function apply(s){
    T.documentElement.setAttribute('data-theme',s);
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
