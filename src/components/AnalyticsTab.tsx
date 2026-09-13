import React from 'react';
import { PartyEvent, CURRENCIES, CATEGORIES, ExpenseCategory } from '../types';

interface AnalyticsTabProps {
  event: PartyEvent;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ event }) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const totalSpent = event.expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const exp of event.expenses) {
    const prev = categoryTotals.get(exp.category) || 0;
    categoryTotals.set(exp.category, prev + exp.amount);
  }

  const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

  // Member payments breakdown
  const memberPaid = new Map<string, number>();
  for (const exp of event.expenses) {
    const prev = memberPaid.get(exp.paidById) || 0;
    memberPaid.set(exp.paidById, prev + exp.amount);
  }

  const memberMap = new Map(event.members.map(m => [m.id, m]));
  const sortedMembers = Array.from(memberPaid.entries()).sort((a, b) => b[1] - a[1]);

  const avgPerPerson = event.members.length > 0 ? totalSpent / event.members.length : 0;

  return (
    <div className="analytics-container">
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Статистика тусовки
      </h3>

      <div className="hero-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="hero-stat-card">
          <div className="stat-label">Всего потрачено</div>
          <div className="stat-value highlight num-font">
            {totalSpent.toLocaleString('ru-RU')} {currencySymbol}
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-label">В среднем на человека</div>
          <div className="stat-value num-font">
            {Math.round(avgPerPerson).toLocaleString('ru-RU')} {currencySymbol}
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-label">Количество покупок</div>
          <div className="stat-value num-font">
            {event.expenses.length}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '12px' }}>
          Траты по категориям
        </h4>

        {sortedCategories.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Нет данных</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedCategories.map(([catKey, amount]) => {
              const cat = CATEGORIES[catKey] || CATEGORIES.other;
              const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

              return (
                <div key={catKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{cat.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </span>
                    <span className="num-font" style={{ fontWeight: 700 }}>
                      {amount.toLocaleString('ru-RU')} {currencySymbol} ({percent}%)
                    </span>
                  </div>

                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: cat.color,
                        borderRadius: 4,
                        transition: 'width 0.3s ease-out',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Who paid what */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
        }}
      >
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '12px' }}>
          Кто сколько внес денег
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedMembers.map(([memberId, amount]) => {
            const member = memberMap.get(memberId);
            const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

            return (
              <div key={memberId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{member?.avatarEmoji}</span>
                    <span style={{ fontWeight: 600 }}>{member?.name}</span>
                  </span>
                  <span className="num-font" style={{ fontWeight: 700 }}>
                    {amount.toLocaleString('ru-RU')} {currencySymbol} ({percent}%)
                  </span>
                </div>

                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: 4,
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
