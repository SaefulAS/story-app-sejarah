const DB_NAME = 'notification-db';
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
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(value, key);
  return tx.complete;
}

export async function getFlag(key) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  return tx.objectStore(STORE_NAME).get(key);
}

export async function clearFlag(key) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(key);
  return tx.complete;
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
