import React from 'react';
import { getTransactionImpact, formatBTC, formatRelativeTime, formatDate, satToFloat } from '../utils/bitcoin';

export default function TransactionItem({ tx, address, btcPrice }) {
  const { net, received, sent } = getTransactionImpact(tx, address);
  const isReceive = net >= 0;
  const confirmed = tx.status?.confirmed;
  const confirmations = confirmed ? '已确认' : '待确认';
  const timeStr = formatRelativeTime(tx.status?.block_time);
  const dateStr = formatDate(tx.status?.block_time);

  const btcNet = satToFloat(Math.abs(net));
  const usdNet = btcPrice ? (btcNet * btcPrice).toFixed(2) : null;

  return (
    <div className="tx-item">
      <div className={`tx-icon ${isReceive ? 'tx-icon-receive' : 'tx-icon-send'}`}>
        {isReceive ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 19 19 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 5 5 12" />
          </svg>
        )}
      </div>

      <div className="tx-info">
        <div className="tx-type">{isReceive ? '收款' : '付款'}</div>
        <div className="tx-meta">
          <span className={`tx-confirm ${confirmed ? 'tx-confirmed' : 'tx-pending'}`}>
            {confirmations}
          </span>
          <span className="tx-dot">·</span>
          <span className="tx-time" title={dateStr}>{timeStr}</span>
        </div>
        <div className="tx-id">
          <a
            href={`https://blockstream.info/tx/${tx.txid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            {tx.txid.slice(0, 12)}...{tx.txid.slice(-8)}
          </a>
        </div>
      </div>

      <div className="tx-amount">
        <div className={`tx-btc ${isReceive ? 'amount-receive' : 'amount-send'}`}>
          {isReceive ? '+' : '-'}{formatBTC(Math.abs(net))}
        </div>
        {usdNet && (
          <div className="tx-usd">
            {isReceive ? '+' : '-'}${parseFloat(usdNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
}
