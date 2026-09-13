import { Member, Expense, MemberBalance, SettlementTransaction } from '../types';

/**
 * Calculates net balance for every member in the event.
 * netBalance > 0: Member paid more than they consumed (is owed money).
 * netBalance < 0: Member consumed more than they paid (owes money).
 */
export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): Map<string, MemberBalance> {
  const balanceMap = new Map<string, MemberBalance>();

  for (const m of members) {
    balanceMap.set(m.id, {
      memberId: m.id,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    });
  }

  for (const expense of expenses) {
    const paidBy = balanceMap.get(expense.paidById);
    if (paidBy) {
      paidBy.totalPaid += expense.amount;
    }

    const participants = expense.participants.filter(id => balanceMap.has(id));
    if (participants.length === 0) continue;

    if (expense.splitType === 'equal') {
      const perPerson = expense.amount / participants.length;
      for (const pId of participants) {
        const p = balanceMap.get(pId)!;
        p.totalOwed += perPerson;
      }
    } else if (expense.splitType === 'exact' && expense.exactAmounts) {
      for (const pId of participants) {
        const amount = expense.exactAmounts[pId] || 0;
        const p = balanceMap.get(pId)!;
        p.totalOwed += amount;
      }
    } else if (expense.splitType === 'shares' && expense.shares) {
      const totalShares = participants.reduce(
        (sum, id) => sum + (expense.shares?.[id] || 1),
        0
      );
      for (const pId of participants) {
        const share = expense.shares?.[pId] || 1;
        const portion = (expense.amount * share) / (totalShares || 1);
        const p = balanceMap.get(pId)!;
        p.totalOwed += portion;
      }
    } else if (expense.splitType === 'items' && expense.items && expense.items.length > 0) {
      for (const item of expense.items) {
        const assigned = item.assignedTo.filter(id => balanceMap.has(id));
        if (assigned.length > 0) {
          const itemPerPerson = item.amount / assigned.length;
          for (const aId of assigned) {
            const p = balanceMap.get(aId)!;
            p.totalOwed += itemPerPerson;
          }
        }
      }
    } else {
      // Fallback to equal split
      const perPerson = expense.amount / participants.length;
      for (const pId of participants) {
        const p = balanceMap.get(pId)!;
        p.totalOwed += perPerson;
      }
    }
  }

  // Calculate final net balance with 2-decimal rounding
  for (const balance of balanceMap.values()) {
    balance.netBalance = Math.round((balance.totalPaid - balance.totalOwed) * 100) / 100;
  }

  return balanceMap;
}

/**
 * Greedy debt minimization algorithm.
 * Reduces an arbitrary graph of pairwise debts into the minimal number of transfers (<= N-1).
 */
export function minimizeDebts(
  members: Member[],
  expenses: Expense[],
  settledIds: string[] = []
): SettlementTransaction[] {
  const balanceMap = calculateBalances(members, expenses);

  interface BalanceNode {
    memberId: string;
    amount: number;
  }

  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  for (const [memberId, bal] of balanceMap.entries()) {
    if (bal.netBalance < -0.01) {
      debtors.push({ memberId, amount: -bal.netBalance });
    } else if (bal.netBalance > 0.01) {
      creditors.push({ memberId, amount: bal.netBalance });
    }
  }

  // Sort descending by amount for greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SettlementTransaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const rounded = Math.round(settleAmount * 100) / 100;

    if (rounded > 0.009) {
      const txId = `tx_${debtor.memberId}_${creditor.memberId}_${Math.round(rounded * 100)}`;
      transactions.push({
        id: txId,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: rounded,
        isSettled: settledIds.includes(txId),
      });
    }

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) {
      dIdx++;
    }
    if (creditor.amount < 0.01) {
      cIdx++;
    }
  }

  return transactions;
}
