import React, { useState } from 'react';
import { PartyEvent, Expense, ExpenseCategory, SplitType, CATEGORIES, CURRENCIES } from '../types';
import { sounds } from '../core/soundEffects';

interface AddExpenseModalProps {
  event: PartyEvent;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

const QUICK_SUGGESTIONS = [
  { title: '🍕 Додо Пицца', category: 'food' as ExpenseCategory },
  { title: '🥤 Самокат (напитки и чипсы)', category: 'drinks' as ExpenseCategory },
  { title: '🚕 Яндекс Такси', category: 'transport' as ExpenseCategory },
  { title: '🎲 Настолки / Антикафе', category: 'entertainment' as ExpenseCategory },
  { title: '🍿 Билеты в кино', category: 'entertainment' as ExpenseCategory },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  event,
  onClose,
  onAdd,
}) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paidById, setPaidById] = useState<string>(event.members[0]?.id || '');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    event.members.map(m => m.id)
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, number>>(
    Object.fromEntries(event.members.map(m => [m.id, 1]))
  );
  const [note, setNote] = useState('');

  const numAmount = parseFloat(amountStr) || 0;

  const handleToggleParticipant = (memberId: string) => {
    sounds.playTap();
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length > 1) {
        setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
      }
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  const handleApplySuggestion = (s: typeof QUICK_SUGGESTIONS[0]) => {
    sounds.playTap();
    setTitle(s.title);
    setCategory(s.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numAmount <= 0) return;

    sounds.playTap();

    let processedExact: Record<string, number> | undefined;
    if (splitType === 'exact') {
      processedExact = {};
      for (const pId of selectedParticipants) {
        processedExact[pId] = parseFloat(exactAmounts[pId] || '0') || 0;
      }
    }

    onAdd({
      title: title.trim(),
      amount: numAmount,
      category,
      paidById,
      splitType,
      participants: selectedParticipants,
      exactAmounts: processedExact,
      shares: splitType === 'shares' ? shares : undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">💸 Новая трата</h3>
          <button type="button" className="btn btn-icon btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick suggestions */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Быстрые варианты:
            </div>
            <div className="chips-grid">
              {QUICK_SUGGESTIONS.map(s => (
                <button
                  key={s.title}
                  type="button"
                  className="chip"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  onClick={() => handleApplySuggestion(s)}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Что купили?</label>
            <input
              type="text"
              className="form-input"
              placeholder="Например: 2 пиццы и кола"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Сумма ({currencySymbol}):</label>
            <input
              type="number"
              step="any"
              className="form-input num-font"
              style={{ fontSize: '1.2rem', fontWeight: 700 }}
              placeholder="0.00"
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Категория:</label>
            <div className="chips-grid">
              {Object.values(CATEGORIES).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`chip ${category === cat.id ? 'selected' : ''}`}
                  onClick={() => {
                    sounds.playTap();
                    setCategory(cat.id);
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Кто заплатил со своей карты?</label>
            <select
              className="form-select"
              value={paidById}
              onChange={e => setPaidById(e.target.value)}
            >
              {event.members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.avatarEmoji} {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Как делить?</label>
            <div className="tabs-nav" style={{ marginBottom: '10px' }}>
              <button
                type="button"
                className={`tab-btn ${splitType === 'equal' ? 'active' : ''}`}
                onClick={() => setSplitType('equal')}
              >
                Поровну
              </button>
              <button
                type="button"
                className={`tab-btn ${splitType === 'exact' ? 'active' : ''}`}
                onClick={() => setSplitType('exact')}
              >
                Точные суммы
              </button>
              <button
                type="button"
                className={`tab-btn ${splitType === 'shares' ? 'active' : ''}`}
                onClick={() => setSplitType('shares')}
              >
                По долям
              </button>
            </div>

            {/* Split Details */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Участники сплита (нажмите, чтобы исключить тех, кто не участвует):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {event.members.map(m => {
                  const isSelected = selectedParticipants.includes(m.id);
                  const perPerson =
                    isSelected && selectedParticipants.length > 0
                      ? numAmount / selectedParticipants.length
                      : 0;

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: isSelected ? 'var(--bg-card)' : 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        opacity: isSelected ? 1 : 0.4,
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}
                        onClick={() => handleToggleParticipant(m.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleParticipant(m.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{m.avatarEmoji}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                      </div>

                      {isSelected && splitType === 'equal' && (
                        <div className="num-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {Math.round(perPerson).toLocaleString('ru-RU')} {currencySymbol}
                        </div>
                      )}

                      {isSelected && splitType === 'exact' && (
                        <div style={{ width: '90px' }}>
                          <input
                            type="number"
                            className="form-input num-font"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            placeholder="0"
                            value={exactAmounts[m.id] || ''}
                            onChange={e =>
                              setExactAmounts({ ...exactAmounts, [m.id]: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {isSelected && splitType === 'shares' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', minHeight: 24 }}
                            onClick={() =>
                              setShares({ ...shares, [m.id]: Math.max(1, (shares[m.id] || 1) - 1) })
                            }
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
                            {shares[m.id] || 1}x
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', minHeight: 24 }}
                            onClick={() =>
                              setShares({ ...shares, [m.id]: (shares[m.id] || 1) + 1 })
                            }
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Заметка (необязательно):</label>
            <input
              type="text"
              className="form-input"
              placeholder="Например: скидка по промокоду"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || numAmount <= 0}
            >
              Добавить трату
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
