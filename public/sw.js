self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).then(function(){
      return self.registration.unregister();
    })
  );
});
self.addEventListener('fetch',function(e){e.respondWith(fetch(e.request))});
