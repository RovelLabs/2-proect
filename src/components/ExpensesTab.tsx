import React from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { PartyEvent, Expense, CURRENCIES, CATEGORIES } from '../types';
import { sounds } from '../core/soundEffects';

interface ExpensesTabProps {
  event: PartyEvent;
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  event,
  onAddExpense,
  onDeleteExpense,
}) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const memberMap = new Map(event.members.map(m => [m.id, m]));

  const sortedExpenses = [...event.expenses].sort((a, b) => b.createdAt - a.createdAt);

  const getSplitLabel = (expense: Expense): string => {
    switch (expense.splitType) {
      case 'equal':
        return expense.participants.length === event.members.length
          ? 'Поровну на всех'
          : `Поровну на ${expense.participants.length} чел.`;
      case 'exact':
        return 'По точным суммам';
      case 'shares':
        return 'По долям';
      case 'items':
        return 'По чеку / позициям';
      default:
        return 'Поровну';
    }
  };

  return (
    <div className="expenses-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          История трат ({event.expenses.length})
        </h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            sounds.playTap();
            onAddExpense();
          }}
        >
          <Plus size={15} />
          <span>Новая трата</span>
        </button>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍕</div>
          <div className="empty-title">Пока нет трат</div>
          <div className="empty-desc">
            Добавьте первую покупку (пиццу, такси, напитки), чтобы рассчитать сплит с друзьями.
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              sounds.playTap();
              onAddExpense();
            }}
          >
            <Plus size={15} />
            <span>Добавить трату</span>
          </button>
        </div>
      ) : (
        <div className="card-list">
          {sortedExpenses.map(expense => {
            const payer = memberMap.get(expense.paidById);
            const category = CATEGORIES[expense.category] || CATEGORIES.other;

            return (
              <div key={expense.id} className="expense-card">
                <div className="card-left">
                  <div className="card-icon" style={{ backgroundColor: `${category.color}20` }}>
                    {category.emoji}
                  </div>

                  <div className="card-info">
                    <div className="card-title">{expense.title}</div>
                    <div className="card-subtitle">
                      <span>Оплатил: {payer?.avatarEmoji} {payer?.name}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Tag size={12} /> {getSplitLabel(expense)}
                      </span>
                      {expense.note && (
                        <>
                          <span>•</span>
                          <span style={{ fontStyle: 'italic' }}>«{expense.note}»</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="card-amount num-font" style={{ color: 'var(--text-primary)' }}>
                    {expense.amount.toLocaleString('ru-RU')} {currencySymbol}
                  </div>

                  <button
                    type="button"
                    className="btn btn-icon btn-sm"
                    style={{ width: 32, height: 32, color: 'var(--text-muted)' }}
                    onClick={() => {
                      if (window.confirm(`Удалить трату «${expense.title}»?`)) {
                        sounds.playTap();
                        onDeleteExpense(expense.id);
                      }
                    }}
                    title="Удалить трату"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
