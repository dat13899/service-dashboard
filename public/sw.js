const CACHE='btdat-v1';
const ASSETS=['/','/dashboard','/documents','/assets/global.css','/assets/theme.js','/assets/favicon.svg','/assets/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim());e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin===location.origin&&(u.pathname.startsWith('/assets/')||u.pathname==='/'||u.pathname==='/dashboard'||u.pathname==='/documents')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(r=>{const c=caches.open(CACHE);c.then(cache=>cache.put(e.request,r.clone()));return r})));
  }
});
