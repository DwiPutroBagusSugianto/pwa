// sw.js — ILG SmartTest offline support

const CACHE_NAME = 'ilg-smarttest-v1.3';
const API_BASE = 'https://smart.infotama.net.id/api';
const DB_NAME = 'ilg-smarttest-offline';
const QUEUE_STORE = 'pending-results';

const STATIC_ASSETS = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/style.css',
  '/pwa/style-modern-saas-2025.css',
  '/pwa/bundle1.min.js',
  '/pwa/logoilg.jpeg'
];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'localId', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function queueRequest(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllQueued() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const req = tx.objectStore(QUEUE_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteQueued(localId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).delete(localId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Install / activate ----------
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---------- Fetch handler ----------
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isApi = url.href.startsWith(API_BASE);

  if (!isApi) {
    // File statis: cache-first
    e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
    return;
  }

  // --- Endpoint submit hasil kuis: butuh penanganan khusus offline ---
  if (isApi && url.pathname.endsWith('/results') && e.request.method === 'POST') {
    e.respondWith(handleResultsSubmit(e.request));
    return;
  }

  // --- Endpoint GET lain (quizzes, me, dst): network-first + cache fallback ---
  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(fetch(e.request));
});

async function handleResultsSubmit(request) {
  const bodyText = await request.clone().text();
  const authHeader = request.headers.get('Authorization');

  try {

    const res = await fetch(request.clone());
    return res;
  } catch (err) {

    await queueRequest({
      url: request.url,
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: bodyText,
      queuedAt: new Date().toISOString()
    });


    try {
      if ('sync' in self.registration) {
        await self.registration.sync.register('sync-results');
      }
    } catch (_) {

    }

    return new Response(
      JSON.stringify({
        id: 'offline-' + Date.now(),
        message: 'Hasil disimpan offline, akan disinkronkan otomatis saat online kembali'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ---------- Background Sync: dipanggil browser otomatis saat koneksi kembali ----------
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-results') {
    e.waitUntil(syncQueuedResults());
  }
});

// ---------- Fallback manual: dipanggil dari halaman lewat postMessage ----------
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'TRY_SYNC_RESULTS') {
    e.waitUntil ? e.waitUntil(syncQueuedResults()) : syncQueuedResults();
  }
});

async function syncQueuedResults() {
  const items = await getAllQueued();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      if (res.ok) {
        await deleteQueued(item.localId);
        const clientsList = await self.clients.matchAll();
        clientsList.forEach((client) =>
          client.postMessage({ type: 'RESULT_SYNCED', localId: item.localId })
        );
      }
    } catch (_) {
      break;
    }
  }
}
