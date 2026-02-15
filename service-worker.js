/**
 * service-worker.js - Offline-Cache fuer FakeIt
 *
 * Implementiert eine Cache-First-Strategie: Alle App-Assets werden beim
 * ersten Laden im Browser-Cache gespeichert. Nachfolgende Anfragen werden
 * direkt aus dem Cache bedient, ohne Netzwerkzugriff.
 *
 * Bei einem Update der App muss CACHE_NAME geaendert werden (z.B. 'fakeit-v2.0.0'),
 * damit der alte Cache geloescht und die neuen Dateien heruntergeladen werden.
 */

/** Cache-Versionsname - bei App-Updates erhoehen */
const CACHE_NAME = 'fakeit-v2.0.0';

/** Alle Dateien, die fuer den Offline-Betrieb gecacht werden */
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './manifest.json',
  './sites/home.html',
  './sites/home.js',
  './sites/newgame.html',
  './sites/newgame.js',
  './sites/game.html',
  './sites/game.js',
  './sites/categories.html',
  './sites/categories.js',
  './sites/info.html',
  './sites/info.js',
  './sites/pagenotfound.html',
  './assets/default_categories.json',
  './assets/add.png',
  './assets/add-disabled.png',
  './assets/check.png',
  './assets/crew.png',
  './assets/delete.png',
  './assets/impostor.png',
  './assets/minus.png',
  './assets/minus-disabled.png',
  './assets/next.png',
  './assets/next-disabled.png',
  './assets/question.png',
  './assets/start.png',
  './assets/start-btn.png',
  './assets/start-btn-disabled.png',
  './icons/main.png',
  './icons/android-chrome-192x192.png',
  './icons/android-chrome-512x512.png',
  './icons/favicon.ico'
];

/**
 * Install-Event: Alle Assets in den Cache laden.
 * skipWaiting() sorgt dafuer, dass der neue Service Worker sofort aktiv wird,
 * ohne auf das Schliessen aller Tabs zu warten.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/**
 * Activate-Event: Alte Cache-Versionen loeschen.
 * clients.claim() uebernimmt sofort die Kontrolle ueber alle offenen Tabs.
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch-Event: Cache-First-Strategie.
 * 1. Wenn die Anfrage im Cache liegt -> direkt aus dem Cache liefern
 * 2. Sonst -> Netzwerk-Anfrage versuchen
 * 3. Bei Netzwerk-Fehler und HTML-Anfrage -> index.html als Fallback
 *    (damit die SPA auch offline navigierbar bleibt)
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

