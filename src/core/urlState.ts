import LZString from 'lz-string';
import { PartyEvent, SettlementTransaction, CURRENCIES } from '../types';
import { getBankById, formatPhoneNumber } from './sbpHelper';

export function serializeEventToHash(event: PartyEvent): string {
  try {
    const json = JSON.stringify(event);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return `#s=${compressed}`;
  } catch (e) {
    console.error('Failed to serialize event:', e);
    return '';
  }
}

export function deserializeEventFromHash(hash: string): PartyEvent | null {
  try {
    if (!hash) return null;
    const match = hash.match(/#s=([^&]+)/);
    if (!match) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(match[1]);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as PartyEvent;
  } catch (e) {
    console.error('Failed to deserialize event from hash:', e);
    return null;
  }
}

export function formatTelegramSummary(
  event: PartyEvent,
  transactions: SettlementTransaction[],
  appUrl?: string
): string {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const totalSpent = event.expenses.reduce((sum, e) => sum + e.amount, 0);

  const memberMap = new Map(event.members.map(m => [m.id, m]));

  const lines: string[] = [
    `🎉 *${event.title}*`,
    `Всего потрачено: *${totalSpent.toLocaleString('ru-RU')} ${currencySymbol}*`,
    `Участников: ${event.members.length} | Трат: ${event.expenses.length}`,
    '',
    '⚖️ *Расчёт долгов по СБП:*',
  ];

  if (transactions.length === 0) {
    lines.push('✨ Все в расчёте! Долгов нет.');
  } else {
    for (const tx of transactions) {
      const from = memberMap.get(tx.fromMemberId)?.name || 'Кто-то';
      const toMember = memberMap.get(tx.toMemberId);
      const toName = toMember?.name || 'Кому-то';
      const bank = getBankById(toMember?.preferredBank);
      const bankText = bank ? ` (${bank.shortName})` : '';
      const phoneText = toMember?.phone ? ` 📱 ${formatPhoneNumber(toMember.phone)}` : '';
      const status = tx.isSettled ? '✅ [Оплачено]' : '👉';

      lines.push(
        `${status} *${from}* переводит *${tx.amount.toLocaleString('ru-RU')} ${currencySymbol}* → *${toName}*${bankText}${phoneText}`
      );
    }
  }

  if (appUrl) {
    lines.push('');
    lines.push(`🔗 *Открыть интерактивный счёт:* ${appUrl}`);
  }

  lines.push('');
  lines.push('_Посчитано через Складно_ ⚡');

  return lines.join('\n');
}
