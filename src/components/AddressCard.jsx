import React, { useState, useEffect } from 'react';
import { getAddressInfo, formatBTC, formatUSD, shortenAddress, satToFloat } from '../utils/bitcoin';

export default function AddressCard({ entry, btcPrice, onSelect, onRemove, onEditName }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAddressInfo(entry.address)
      .then((data) => { if (!cancelled) { setInfo(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [entry.address]);

  const balance = info
    ? info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
    : 0;
  const unconfirmedBalance = info
    ? info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum
    : 0;
  const txCount = info ? info.chain_stats.tx_count + info.mempool_stats.tx_count : 0;
  const btcBalance = satToFloat(balance);
  const usd = formatUSD(btcBalance, btcPrice);

  return (
    <div className="address-card" onClick={() => !showConfirmDelete && onSelect(entry.id)}>
      <div className="card-header">
        <div className="card-name-row">
          <span className="card-name">{entry.name}</span>
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onEditName(entry.id); }}
            title="编辑名称"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <div className="card-address">{shortenAddress(entry.address)}</div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="skeleton-wrap">
            <div className="skeleton skeleton-lg" />
            <div className="skeleton skeleton-sm" />
          </div>
        ) : error ? (
          <div className="card-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : (
          <>
            <div className="card-balance-row">
              <div className="card-btc">{formatBTC(balance)}</div>
              {usd && <div className="card-usd">≈ {usd}</div>}
            </div>
            {unconfirmedBalance !== 0 && (
              <div className="card-unconfirmed">
                待确认: {unconfirmedBalance > 0 ? '+' : ''}{formatBTC(unconfirmedBalance)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card-footer">
        <div className="card-stats">
          {!loading && !error && (
            <span className="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              {txCount} 笔交易
            </span>
          )}
        </div>

        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          {showConfirmDelete ? (
            <div className="confirm-delete">
              <span className="confirm-text">确认删除？</span>
              <button className="btn-danger-sm" onClick={() => onRemove(entry.id)}>删除</button>
              <button className="btn-cancel-sm" onClick={() => setShowConfirmDelete(false)}>取消</button>
            </div>
          ) : (
            <button
              className="btn-icon btn-icon-danger"
              onClick={() => setShowConfirmDelete(true)}
              title="删除地址"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="card-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
