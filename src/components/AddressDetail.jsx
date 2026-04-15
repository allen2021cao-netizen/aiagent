import React, { useState, useEffect, useCallback } from 'react';
import {
  getAddressInfo,
  getAddressTransactions,
  formatBTC,
  formatUSD,
  shortenAddress,
  satToFloat,
} from '../utils/bitcoin';
import TransactionItem from './TransactionItem';
import EditNameModal from './EditNameModal';

export default function AddressDetail({ entry, btcPrice, onBack, onRemove, onUpdateName }) {
  const [info, setInfo] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [addrInfo, addrTxs] = await Promise.all([
        getAddressInfo(entry.address),
        getAddressTransactions(entry.address),
      ]);
      setInfo(addrInfo);
      setTxs(addrTxs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [entry.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const balance = info
    ? info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
    : 0;
  const unconfirmedBalance = info
    ? info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum
    : 0;
  const totalReceived = info ? info.chain_stats.funded_txo_sum : 0;
  const totalSent = info ? info.chain_stats.spent_txo_sum : 0;
  const txCount = info ? info.chain_stats.tx_count : 0;
  const btcBalance = satToFloat(balance);
  const usd = formatUSD(btcBalance, btcPrice);

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-title-wrap">
          <h1 className="detail-title">{entry.name}</h1>
          <button className="detail-edit-name" onClick={() => setShowEdit(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <button
          className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchData(true)}
          disabled={refreshing}
          title="刷新"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      <div className="detail-scroll">
        {/* Address row */}
        <div className="detail-address-card">
          <div className="detail-address-label">比特币地址</div>
          <div className="detail-address-row">
            <span className="detail-address-text">{entry.address}</span>
            <button
              className={`btn-copy ${copied ? 'btn-copy-done' : ''}`}
              onClick={handleCopy}
              title="复制地址"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <a
            href={`https://blockstream.info/address/${entry.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-explorer-link"
          >
            在区块链浏览器中查看
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {loading ? (
          <div className="detail-loading">
            <div className="spinner" />
            <p>正在加载地址数据...</p>
          </div>
        ) : error ? (
          <div className="detail-error">
            <div className="error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => fetchData()}>重试</button>
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div className="balance-hero">
              <div className="balance-label">当前余额</div>
              <div className="balance-btc">{formatBTC(balance)}</div>
              {usd && <div className="balance-usd">≈ {usd}</div>}
              {unconfirmedBalance !== 0 && (
                <div className="balance-unconfirmed">
                  待确认: {unconfirmedBalance > 0 ? '+' : ''}{formatBTC(unconfirmedBalance)}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">累计收款</div>
                <div className="stat-value stat-receive">{formatBTC(totalReceived)}</div>
                {btcPrice && (
                  <div className="stat-usd">{formatUSD(satToFloat(totalReceived), btcPrice)}</div>
                )}
              </div>
              <div className="stat-card">
                <div className="stat-label">累计付款</div>
                <div className="stat-value stat-send">{formatBTC(totalSent)}</div>
                {btcPrice && (
                  <div className="stat-usd">{formatUSD(satToFloat(totalSent), btcPrice)}</div>
                )}
              </div>
              <div className="stat-card stat-card-full">
                <div className="stat-label">交易总数</div>
                <div className="stat-value">{txCount} 笔</div>
              </div>
            </div>

            {/* Transactions */}
            <div className="tx-section">
              <div className="section-header">
                <h3 className="section-title">最近交易</h3>
                <span className="section-sub">最多显示 25 条</span>
              </div>

              {txs.length === 0 ? (
                <div className="tx-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                  <p>暂无交易记录</p>
                </div>
              ) : (
                <div className="tx-list">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx.txid}
                      tx={tx}
                      address={entry.address}
                      btcPrice={btcPrice}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="danger-zone">
              <button
                className="btn-remove-address"
                onClick={() => onRemove(entry.id)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                删除此地址
              </button>
            </div>
          </>
        )}
      </div>

      {showEdit && (
        <EditNameModal
          currentName={entry.name}
          address={entry.address}
          onSave={(name) => { onUpdateName(entry.id, name); setShowEdit(false); }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
