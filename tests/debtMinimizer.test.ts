import { describe, it, expect } from 'vitest';
import { calculateBalances, minimizeDebts } from '../src/core/debtMinimizer';
import { Member, Expense } from '../src/types';

describe('debtMinimizer', () => {
  const members: Member[] = [
    { id: 'm1', name: 'Алексей', avatarEmoji: '😎' },
    { id: 'm2', name: 'Мария', avatarEmoji: '🌸' },
    { id: 'm3', name: 'Иван', avatarEmoji: '🚀' },
    { id: 'm4', name: 'Дима', avatarEmoji: '🎧' },
  ];

  it('calculates equal split correctly for a single expense', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        title: 'Пицца',
        amount: 2000,
        category: 'food',
        paidById: 'm1',
        splitType: 'equal',
        participants: ['m1', 'm2', 'm3', 'm4'],
        createdAt: Date.now(),
      },
    ];

    const balances = calculateBalances(members, expenses);
    expect(balances.get('m1')?.netBalance).toBe(1500); // paid 2000, consumed 500
    expect(balances.get('m2')?.netBalance).toBe(-500);
    expect(balances.get('m3')?.netBalance).toBe(-500);
    expect(balances.get('m4')?.netBalance).toBe(-500);
  });

  it('minimizes debts to the minimal number of transactions', () => {
    // Scenario:
    // m1 paid 1200 for pizza (shared by m1, m2, m3: 400 each)
    // m2 paid 600 for drinks (shared by m1, m2, m3: 200 each)
    // m3 paid 0
    // Net:
    // m1: paid 1200, owed 600 => net +600
    // m2: paid 600, owed 600 => net 0
    // m3: paid 0, owed 600 => net -600
    // Minimization should yield EXACTLY 1 transaction: m3 pays m1 600!
    const testMembers = members.slice(0, 3);
    const expenses: Expense[] = [
      {
        id: 'e1',
        title: 'Пицца',
        amount: 1200,
        category: 'food',
        paidById: 'm1',
        splitType: 'equal',
        participants: ['m1', 'm2', 'm3'],
        createdAt: Date.now(),
      },
      {
        id: 'e2',
        title: 'Напитки',
        amount: 600,
        category: 'drinks',
        paidById: 'm2',
        splitType: 'equal',
        participants: ['m1', 'm2', 'm3'],
        createdAt: Date.now(),
      },
    ];

    const txs = minimizeDebts(testMembers, expenses);
    expect(txs).toHaveLength(1);
    expect(txs[0].fromMemberId).toBe('m3');
    expect(txs[0].toMemberId).toBe('m1');
    expect(txs[0].amount).toBe(600);
  });

  it('handles selective participants correctly', () => {
    // Only m2 and m3 drink cola
    const expenses: Expense[] = [
      {
        id: 'e1',
        title: 'Кола для двоих',
        amount: 300,
        category: 'drinks',
        paidById: 'm1', // m1 bought it for m2 and m3
        splitType: 'equal',
        participants: ['m2', 'm3'],
        createdAt: Date.now(),
      },
    ];

    const balances = calculateBalances(members, expenses);
    expect(balances.get('m1')?.netBalance).toBe(300);
    expect(balances.get('m2')?.netBalance).toBe(-150);
    expect(balances.get('m3')?.netBalance).toBe(-150);
    expect(balances.get('m4')?.netBalance).toBe(0);
  });

  it('handles exact split amounts', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        title: 'Бургеры по чеку',
        amount: 1000,
        category: 'food',
        paidById: 'm1',
        splitType: 'exact',
        participants: ['m1', 'm2'],
        exactAmounts: {
          m1: 700,
          m2: 300,
        },
        createdAt: Date.now(),
      },
    ];

    const balances = calculateBalances(members, expenses);
    expect(balances.get('m1')?.netBalance).toBe(300); // paid 1000, ate 700
    expect(balances.get('m2')?.netBalance).toBe(-300); // paid 0, ate 300
  });

  it('handles itemized receipt split', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        title: 'Чек из кафе',
        amount: 900,
        category: 'food',
        paidById: 'm1',
        splitType: 'items',
        participants: ['m1', 'm2', 'm3'],
        items: [
          { id: 'i1', title: 'Пицца Пепперони', amount: 600, assignedTo: ['m1', 'm2'] },
          { id: 'i2', title: 'Лимонад', amount: 300, assignedTo: ['m3'] },
        ],
        createdAt: Date.now(),
      },
    ];

    const balances = calculateBalances(members, expenses);
    // m1 ate 300, paid 900 => +600
    // m2 ate 300, paid 0 => -300
    // m3 drank 300, paid 0 => -300
    expect(balances.get('m1')?.netBalance).toBe(600);
    expect(balances.get('m2')?.netBalance).toBe(-300);
    expect(balances.get('m3')?.netBalance).toBe(-300);

    const txs = minimizeDebts(members, expenses);
    expect(txs).toHaveLength(2);
  });
});
