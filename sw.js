const CACHE='instr-v5';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
// Rede primeiro (sempre pega a versão nova); cache só quando estiver offline
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const same=new URL(e.request.url).origin===location.origin;
  if(!same) return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
