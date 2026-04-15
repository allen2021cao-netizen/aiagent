const BLOCKSTREAM_API = 'https://blockstream.info/api';

export async function getAddressInfo(address) {
  const res = await fetch(`${BLOCKSTREAM_API}/address/${address}`);
  if (!res.ok) {
    if (res.status === 400) throw new Error('无效的比特币地址格式');
    if (res.status === 404) throw new Error('地址不存在');
    throw new Error('网络请求失败，请检查网络连接');
  }
  return res.json();
}

export async function getAddressTransactions(address) {
  const res = await fetch(`${BLOCKSTREAM_API}/address/${address}/txs`);
  if (!res.ok) throw new Error('无法获取交易记录');
  return res.json();
}

export async function getBTCPrice() {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      return data.bitcoin.usd;
    } catch {
      return null;
    }
  }
}

export function satToFloat(sats) {
  return sats / 1e8;
}

export function formatBTC(sats) {
  const btc = satToFloat(Math.abs(sats));
  if (btc === 0) return '0 BTC';
  const fixed = btc.toFixed(8);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return `${trimmed} BTC`;
}

export function formatUSD(btcAmount, price) {
  if (!price || btcAmount == null) return null;
  const usd = Math.abs(btcAmount) * price;
  if (usd < 0.01) return '< $0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

export function shortenAddress(address, front = 8, back = 6) {
  if (!address) return '';
  if (address.length <= front + back + 3) return address;
  return `${address.slice(0, front)}...${address.slice(-back)}`;
}

/**
 * Calculate net BTC impact of a transaction on a specific address.
 * Returns: { received (sats), sent (sats), net (sats) }
 */
export function getTransactionImpact(tx, address) {
  let received = 0;
  let sent = 0;

  for (const vout of tx.vout || []) {
    if (vout.scriptpubkey_address === address) {
      received += vout.value;
    }
  }

  for (const vin of tx.vin || []) {
    if (vin.prevout?.scriptpubkey_address === address) {
      sent += vin.prevout.value;
    }
  }

  return { received, sent, net: received - sent };
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return '待确认';
  const diff = Date.now() - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月前`;
  return `${Math.floor(months / 12)} 年前`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '待确认';
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function isValidBitcoinAddress(address) {
  if (!address) return false;
  // P2PKH: starts with 1
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  // P2SH: starts with 3
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  // Bech32 (P2WPKH/P2WSH): starts with bc1
  if (/^bc1[ac-hj-np-z02-9]{6,87}$/.test(address)) return true;
  // Taproot (P2TR): starts with bc1p
  if (/^bc1p[ac-hj-np-z02-9]{6,87}$/.test(address)) return true;
  return false;
}
