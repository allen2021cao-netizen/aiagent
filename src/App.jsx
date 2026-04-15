import React, { useState, useEffect, useCallback } from 'react';
import HomeView from './components/HomeView';
import AddressDetail from './components/AddressDetail';
import AddressInput from './components/AddressInput';
import EditNameModal from './components/EditNameModal';
import {
  getStoredAddresses,
  saveAddress,
  removeAddress,
  updateAddressName,
} from './utils/storage';
import { getBTCPrice } from './utils/bitcoin';

export default function App() {
  const [addresses, setAddresses] = useState(() => getStoredAddresses());
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch BTC price on mount and every 60 seconds
  useEffect(() => {
    getBTCPrice().then(setBtcPrice);
    const interval = setInterval(() => getBTCPrice().then(setBtcPrice), 60_000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAddAddress = useCallback((address, name) => {
    const updated = saveAddress(address, name);
    if (!updated) {
      showToast('该地址已在列表中', 'error');
      return;
    }
    setAddresses(updated);
    setShowAddModal(false);
    showToast('地址添加成功', 'success');
  }, [showToast]);

  const handleRemoveAddress = useCallback((id) => {
    const updated = removeAddress(id);
    setAddresses(updated);
    if (selectedId === id) setSelectedId(null);
    showToast('地址已删除', 'info');
  }, [selectedId, showToast]);

  const handleUpdateName = useCallback((id, name) => {
    const updated = updateAddressName(id, name);
    setAddresses(updated);
    setEditingId(null);
    showToast('名称已更新', 'success');
  }, []);

  const selectedEntry = addresses.find((a) => a.id === selectedId);

  return (
    <div className="app-root">
      {selectedId && selectedEntry ? (
        <AddressDetail
          entry={selectedEntry}
          btcPrice={btcPrice}
          onBack={() => setSelectedId(null)}
          onRemove={handleRemoveAddress}
          onUpdateName={handleUpdateName}
        />
      ) : (
        <HomeView
          addresses={addresses}
          btcPrice={btcPrice}
          onSelect={setSelectedId}
          onAdd={() => setShowAddModal(true)}
          onRemove={handleRemoveAddress}
          onEditName={setEditingId}
        />
      )}

      {showAddModal && (
        <AddressInput
          onAdd={handleAddAddress}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingId && !selectedId && (
        <EditNameModal
          currentName={addresses.find((a) => a.id === editingId)?.name || ''}
          address={addresses.find((a) => a.id === editingId)?.address || ''}
          onSave={(name) => handleUpdateName(editingId, name)}
          onClose={() => setEditingId(null)}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
