import React from 'react';
import { Settings, Plus, Users, Sparkles } from 'lucide-react';
import { PartyEvent, CURRENCIES, SettlementTransaction } from '../types';
import { sounds } from '../core/soundEffects';

interface EventHeroProps {
  event: PartyEvent;
  transactions: SettlementTransaction[];
  onAddExpense: () => void;
  onOpenMembers: () => void;
  onOpenSettings: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({
  event,
  transactions,
  onAddExpense,
  onOpenMembers,
  onOpenSettings,
}) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const totalSpent = event.expenses.reduce((sum, e) => sum + e.amount, 0);
  const unsettledCount = transactions.filter(t => !t.isSettled).length;

  return (
    <section className="event-hero">
      <div className="hero-top">
        <div className="hero-title-wrap" onClick={onOpenSettings}>
          <h1 className="hero-title">
            {event.title}
            <Settings size={16} style={{ opacity: 0.6 }} />
          </h1>
          {event.description && <p className="hero-desc">{event.description}</p>}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm hero-add-btn"
          onClick={() => {
            sounds.playTap();
            onAddExpense();
          }}
        >
          <Plus size={16} />
          <span>Добавить</span>
        </button>
      </div>

      <div className="hero-stats-grid">
        <div className="hero-stat-card">
          <div className="stat-label">Всего потрачено</div>
          <div className="stat-value highlight num-font">
            {totalSpent.toLocaleString('ru-RU')} {currencySymbol}
          </div>
        </div>

        <div className="hero-stat-card" style={{ cursor: 'pointer' }} onClick={onOpenMembers}>
          <div className="stat-label">Друзей в тусовке</div>
          <div className="stat-value num-font" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={18} style={{ opacity: 0.7 }} />
            {event.members.length}
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="stat-label">К сведению по СБП</div>
          <div className="stat-value num-font" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unsettledCount === 0 && transactions.length > 0 ? (
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                <Sparkles size={16} style={{ display: 'inline', marginRight: 4 }} />
                В расчёте!
              </span>
            ) : (
              `${unsettledCount} ${unsettledCount === 1 ? 'перевод' : 'перевода'}`
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
