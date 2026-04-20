const CACHE_NAME = 'clinica-psicologia-cache-v1'; // Nome atualizado
const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/agenda192.ico',
  './icons/agenda.png'
];

// Instalação: Salva os arquivos estáticos no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto: Arquivos estáticos armazenados.');
      return cache.addAll(APP_FILES);
    })
  );
});

// Ativação: Limpa caches antigos (importante para quando você atualizar o app)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch: Serve o conteúdo do cache quando offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se estiver no cache, retorna. Se não, busca na rede.
      return response || fetch(event.request);
    })
  );
});