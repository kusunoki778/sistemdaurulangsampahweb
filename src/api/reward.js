import { apiClient } from './client';
import { unwrapPaginated } from './waste';

/** Katalog reward (publik). Filter memakai ?tipe=barang|voucher|saldo_digital */
export async function getRewardsApi(tipe) {
  const map = {
    Produk: 'barang',
    Voucher: 'voucher',
    'Saldo Digital': 'saldo_digital',
    barang: 'barang',
    voucher: 'voucher',
    saldo_digital: 'saldo_digital',
  };
  const t = map[tipe];
  const query = t ? `?tipe=${t}` : '';
  const res = await apiClient(`/rewards${query}`);
  return res.data || [];
}

export async function getRewardDetailApi(id) {
  const res = await apiClient(`/rewards/${id}`);
  return res.data;
}

/** Tukar koin dengan reward. user_id diambil backend dari Bearer token. */
export async function redeemRewardApi(rewardId, nomorTujuanDigital = null) {
  return await apiClient('/permintaan-reward', {
    method: 'POST',
    body: JSON.stringify({
      reward_id: rewardId,
      nomor_tujuan_digital: nomorTujuanDigital,
    }),
  });
}

/** Riwayat penukaran reward milik user yang login (wajib token). */
export async function getRedeemHistoryApi() {
  const res = await apiClient('/permintaan-reward');
  return unwrapPaginated(res.data);
}
