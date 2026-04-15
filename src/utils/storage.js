const STORAGE_KEY = 'btc_watch_addresses';

export function getStoredAddresses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

/**
 * Returns updated list, or null if address already exists (duplicate).
 */
export function saveAddress(address, name) {
  const list = getStoredAddresses();
  if (list.some((a) => a.address === address)) return null;
  const entry = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    address,
    name: name?.trim() || defaultName(address),
    addedAt: Date.now(),
  };
  return persist([...list, entry]);
}

export function removeAddress(id) {
  return persist(getStoredAddresses().filter((a) => a.id !== id));
}

export function updateAddressName(id, name) {
  return persist(
    getStoredAddresses().map((a) => (a.id === id ? { ...a, name: name.trim() } : a))
  );
}

function defaultName(address) {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
}
