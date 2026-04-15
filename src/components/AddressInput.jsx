import React, { useState, useRef, useEffect } from 'react';
import { isValidBitcoinAddress } from '../utils/bitcoin';

export default function AddressInput({ onAdd, onClose }) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const addressRef = useRef(null);

  useEffect(() => {
    addressRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError('请输入比特币地址');
      return;
    }
    if (!isValidBitcoinAddress(trimmed)) {
      setError('无效的比特币地址格式');
      return;
    }
    setError('');
    onAdd(trimmed, name.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
      setError('');
    } catch {
      // clipboard access denied
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">添加观察地址</h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">比特币地址 *</label>
            <div className="input-row">
              <input
                ref={addressRef}
                className={`form-input ${error ? 'form-input-error' : ''}`}
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(''); }}
                placeholder="bc1q... 或 1... 或 3..."
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <button type="button" className="btn-paste" onClick={handlePaste} title="粘贴">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">自定义名称（可选）</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：我的冷钱包、交易所地址..."
              maxLength={30}
            />
            <p className="form-hint">{name.length}/30</p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              添加地址
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
