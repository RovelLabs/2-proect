import React from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, Circle, QrCode } from 'lucide-react';
import { PartyEvent, SettlementTransaction, CURRENCIES, MemberBalance } from '../types';
import { getBankById, formatPhoneNumber } from '../core/sbpHelper';
import { sounds } from '../core/soundEffects';

interface SettlementTabProps {
  event: PartyEvent;
  transactions: SettlementTransaction[];
  balances: Map<string, MemberBalance>;
  onToggleSettled: (txId: string) => void;
  onOpenSbpModal: (tx: SettlementTransaction) => void;
}

export const SettlementTab: React.FC<SettlementTabProps> = ({
  event,
  transactions,
  balances,
  onToggleSettled,
  onOpenSbpModal,
}) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const memberMap = new Map(event.members.map(m => [m.id, m]));

  const allSettled = transactions.length > 0 && transactions.every(t => t.isSettled);

  const handleToggle = (tx: SettlementTransaction) => {
    sounds.playSettle();
    onToggleSettled(tx.id);

    // If this action will make all settled, celebrate!
    const willBeAllSettled = transactions.every(t => (t.id === tx.id ? !t.isSettled : t.isSettled));
    if (willBeAllSettled) {
      sounds.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#a3e635', '#38bdf8'],
      });
    }
  };

  return (
    <div className="settlement-container">
      {allSettled && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(163,230,53,0.15))',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '16px',
            animation: 'scaleUp 0.3s ease-out',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
            Все долги закрыты!
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Вся компания в полном расчёте. Никаких обид и неловкостей!
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Оптимальные переводы по СБП ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤝</div>
            <div className="empty-title">Все в расчёте</div>
            <div className="empty-desc">
              Либо ещё нет трат, либо каждый участник уже оплатил ровно свою долю.
            </div>
          </div>
        ) : (
          <div className="card-list">
            {transactions.map(tx => {
              const fromMember = memberMap.get(tx.fromMemberId);
              const toMember = memberMap.get(tx.toMemberId);
              const bank = getBankById(toMember?.preferredBank);

              return (
                <div
                  key={tx.id}
                  className={`tx-card ${tx.isSettled ? 'settled' : ''}`}
                >
                  <div className="card-left">
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: tx.isSettled ? 'var(--accent-primary)' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => handleToggle(tx)}
                      title={tx.isSettled ? 'Отметить как непереведённый' : 'Отметить как переведённый'}
                    >
                      {tx.isSettled ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>

                    <div className="card-info">
                      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{fromMember?.avatarEmoji} {fromMember?.name}</span>
                        <ArrowRight size={14} style={{ opacity: 0.5 }} />
                        <span>{toMember?.avatarEmoji} {toMember?.name}</span>
                      </div>

                      <div className="card-subtitle">
                        {bank && (
                          <span
                            className="bank-badge"
                            style={{ backgroundColor: bank.color }}
                          >
                            {bank.shortName}
                          </span>
                        )}
                        {toMember?.phone && (
                          <span>📱 {formatPhoneNumber(toMember.phone)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tx-right-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div className="card-amount num-font">
                      {tx.amount.toLocaleString('ru-RU')} {currencySymbol}
                    </div>

                    {!tx.isSettled && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          sounds.playTap();
                          onOpenSbpModal(tx);
                        }}
                        title="Открыть СБП QR и реквизиты"
                      >
                        <QrCode size={15} />
                        <span>СБП</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Net Balances Overview */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Баланс участников
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {event.members.map(member => {
            const bal = balances.get(member.id);
            const net = bal?.netBalance || 0;
            const isPositive = net > 0.01;
            const isNegative = net < -0.01;

            return (
              <div
                key={member.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '1.2rem' }}>{member.avatarEmoji}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </span>
                </div>

                <div
                  className="num-font"
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: isPositive ? 'var(--accent-primary)' : isNegative ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {isPositive && '+'}
                  {net.toLocaleString('ru-RU')} {currencySymbol}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {isPositive ? 'ему должны' : isNegative ? 'он должен' : 'в расчёте'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
