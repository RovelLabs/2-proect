import { describe, it, expect } from 'vitest';
import { serializeEventToHash, deserializeEventFromHash, formatTelegramSummary } from '../src/core/urlState';
import { PartyEvent } from '../src/types';

describe('urlState', () => {
  const sampleEvent: PartyEvent = {
    id: 'test_event',
    title: 'Пицца в пятницу',
    currency: 'RUB',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    members: [
      { id: 'm1', name: 'Иван', avatarEmoji: '😎', phone: '79991112233', preferredBank: 'tinkoff' },
      { id: 'm2', name: 'Ольга', avatarEmoji: '🌸', phone: '79994445566', preferredBank: 'sber' },
    ],
    expenses: [
      {
        id: 'e1',
        title: 'Пицца',
        amount: 1000,
        category: 'food',
        paidById: 'm1',
        splitType: 'equal',
        participants: ['m1', 'm2'],
        createdAt: 1700000000000,
      },
    ],
    settledTransactions: [],
  };

  it('compresses and decompresses event state preserving all properties', () => {
    const hash = serializeEventToHash(sampleEvent);
    expect(hash.startsWith('#s=')).toBe(true);

    const recovered = deserializeEventFromHash(hash);
    expect(recovered).not.toBeNull();
    expect(recovered?.id).toBe(sampleEvent.id);
    expect(recovered?.title).toBe(sampleEvent.title);
    expect(recovered?.members).toHaveLength(2);
    expect(recovered?.expenses[0].amount).toBe(1000);
  });

  it('generates friendly telegram summary text with emoji and SBP settlement', () => {
    const txs = [
      {
        id: 'tx1',
        fromMemberId: 'm2',
        toMemberId: 'm1',
        amount: 500,
        isSettled: false,
      },
    ];
    const text = formatTelegramSummary(sampleEvent, txs, 'https://skladno.app');
    expect(text).toContain('Пицца в пятницу');
    expect(text).toContain('500 ₽');
    expect(text).toContain('Ольга');
    expect(text).toContain('Иван');
    expect(text).toContain('Складно');
  });
});
