import React from 'react';
import AddressCard from './AddressCard';

export default function HomeView({ addresses, btcPrice, onSelect, onAdd, onRemove, onEditName }) {
  return (
    <div className="home-view">
      {/* Hero header */}
      <div className="home-header">
        <div className="home-logo">
          <span className="btc-symbol">₿</span>
        </div>
        <div>
          <h1 className="home-title">Bitcoin Tracker</h1>
          <p className="home-subtitle">观察钱包地址</p>
        </div>
        {btcPrice && (
          <div className="btc-price-badge">
            <span className="btc-price-label">BTC</span>
            <span className="btc-price-value">
              ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        )}
      </div>

      <div className="home-scroll">
        {addresses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 15h4" />
                <path d="M13 15h3" />
              </svg>
            </div>
            <h2 className="empty-title">还没有观察地址</h2>
            <p className="empty-desc">添加任意比特币地址，实时追踪余额与交易记录</p>
            <button className="btn-primary btn-lg" onClick={onAdd}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              添加第一个地址
            </button>
          </div>
        ) : (
          <>
            <div className="section-bar">
              <span className="section-bar-title">我的观察地址</span>
              <span className="section-bar-count">{addresses.length} 个</span>
            </div>
            <div className="card-list">
              {addresses.map((entry) => (
                <AddressCard
                  key={entry.id}
                  entry={entry}
                  btcPrice={btcPrice}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  onEditName={onEditName}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB add button */}
      {addresses.length > 0 && (
        <button className="fab" onClick={onAdd} title="添加地址">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
