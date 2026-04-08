/**
 * SSO Helper - Extracts Firebase auth data from IndexedDB and navigates
 * to a cross-domain URL with the auth token appended as a URL hash.
 * This enables seamless Single Sign-On across the Vanpower ecosystem.
 */

const SSO_DOMAINS = [
  'wordsmith.vanpower.live',
  'mathgenius.vanpower.live',
  'humanity.vanpower.live',
  'vanpower.live',
];

/**
 * Reads all Firebase auth entries from IndexedDB.
 */
function getAuthDataFromIDB(): Promise<Array<{ fbase_key: string; value: any }> | null> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('firebaseLocalStorageDb');
    req.onerror = () => reject(new Error('Failed to open IndexedDB'));
    req.onsuccess = (ev: any) => {
      const db = ev.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('firebaseLocalStorage')) {
        resolve(null);
        return;
      }
      const tx = db.transaction('firebaseLocalStorage', 'readonly');
      const store = tx.objectStore('firebaseLocalStorage');
      const getAllValues = store.getAll();
      const getAllKeys = store.getAllKeys();
      getAllValues.onsuccess = () => {
        getAllKeys.onsuccess = () => {
          const values = getAllValues.result;
          const keys = getAllKeys.result;
          const data = keys.map((k, i) => ({ fbase_key: k as string, value: values[i] }));
          resolve(data);
        };
        getAllKeys.onerror = () => reject(new Error('Failed to get keys'));
      };
      getAllValues.onerror = () => reject(new Error('Failed to get values'));
    };
  });
}

/**
 * Checks if a URL belongs to a Vanpower ecosystem domain.
 */
export function isVanpowerDomain(url: string): boolean {
  return SSO_DOMAINS.some((domain) => url.includes(domain));
}

/**
 * Navigates to a cross-app URL with SSO auth data injected via URL hash.
 * If the user is not logged in or extraction fails, falls back to regular navigation.
 *
 * @param href - The target URL to navigate to
 * @param openInNewTab - Whether to open in a new tab (default: true)
 */
export async function navigateWithSSO(href: string, openInNewTab: boolean = true): Promise<void> {
  try {
    const data = await getAuthDataFromIDB();
    if (data && data.length > 0) {
      const payloadStr = encodeURIComponent(JSON.stringify(data));
      const finalUrl = new URL(href);
      finalUrl.hash = 'auth_sync=' + payloadStr;
      if (openInNewTab) {
        window.open(finalUrl.toString(), '_blank');
      } else {
        window.location.href = finalUrl.toString();
      }
      return;
    }
  } catch (err) {
    console.error('SSO extract failed:', err);
  }
  // Fallback: navigate without SSO
  if (openInNewTab) {
    window.open(href, '_blank');
  } else {
    window.location.href = href;
  }
}
