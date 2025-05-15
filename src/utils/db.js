const DB_NAME = 'story-sejarah-db';
const DB_VERSION = 1;
const STORE_NAME = 'flags';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Failed to open IndexedDB');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function setFlag(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject('❌ Failed to write flag');
  });
}

export async function getFlag(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? false);
    request.onerror = () => reject('❌ Failed to read flag');
  });
}

export async function clearFlag(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('flags', 'readwrite');
    const store = tx.objectStore('flags');
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve(true);
    };
    request.onerror = (e) => {
      console.error(`❌ Failed to delete flag '${key}'`, e);
      reject(e);
    };
  });
}

export async function cacheStories(stories, key = 'cachedStories') {
  const db = await openDB();
  const tx = db.transaction('flags', 'readwrite');
  tx.objectStore('flags').put(stories, key);
  return tx.complete;
}

export async function getCachedStories(key = 'cachedStories') {
  const db = await openDB();
  const tx = db.transaction('flags', 'readonly');
  const result = await tx.objectStore('flags').get(key);
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (typeof result === 'object' && result.listStory) return result.listStory;
  return [];
}
