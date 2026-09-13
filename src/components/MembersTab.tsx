import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, Phone, Building2 } from 'lucide-react';
import { PartyEvent, Member, CIS_BANKS } from '../types';
import { getBankById, formatPhoneNumber } from '../core/sbpHelper';
import { sounds } from '../core/soundEffects';

interface MembersTabProps {
  event: PartyEvent;
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (member: Member) => void;
  onRemoveMember: (id: string) => void;
}

const EMOJI_OPTIONS = ['😎', '🚀', '🌸', '🐱', '🎧', '🎮', '🍕', '⚡', '🔥', '🦊', '🐻', '👑'];

export const MembersTab: React.FC<MembersTabProps> = ({
  event,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // New member state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('😎');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('tinkoff');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playTap();
    onAddMember({
      name: name.trim(),
      avatarEmoji: emoji,
      phone: phone.trim() || undefined,
      preferredBank: bank || undefined,
    });
    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name.trim()) return;
    sounds.playTap();
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  return (
    <div className="members-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Участники тусовки ({event.members.length})
        </h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            sounds.playTap();
            setShowAddForm(!showAddForm);
          }}
        >
          <UserPlus size={15} />
          <span>Добавить друга</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Новый участник
          </h4>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Имя или никнейм"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Выбери аватарку:</label>
            <div className="chips-grid">
              {EMOJI_OPTIONS.map(em => (
                <button
                  key={em}
                  type="button"
                  className={`chip ${emoji === em ? 'selected' : ''}`}
                  onClick={() => setEmoji(em)}
                  style={{ fontSize: '1.2rem', padding: '4px 10px' }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Номер телефона для СБП (необязательно):</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Основной банк для переводов:</label>
            <select
              className="form-select"
              value={bank}
              onChange={e => setBank(e.target.value)}
            >
              {CIS_BANKS.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddForm(false)}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Сохранить
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Редактировать участника</h3>
              <button
                type="button"
                className="btn btn-icon btn-sm"
                onClick={() => setEditingMember(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Имя:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Аватарка:</label>
                <div className="chips-grid">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      className={`chip ${editingMember.avatarEmoji === em ? 'selected' : ''}`}
                      onClick={() => setEditingMember({ ...editingMember, avatarEmoji: em })}
                      style={{ fontSize: '1.2rem', padding: '4px 10px' }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Номер для СБП:</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+7 (999) 000-00-00"
                  value={editingMember.phone || ''}
                  onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Банк получателя:</label>
                <select
                  className="form-select"
                  value={editingMember.preferredBank || 'tinkoff'}
                  onChange={e => setEditingMember({ ...editingMember, preferredBank: e.target.value })}
                >
                  {CIS_BANKS.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditingMember(null)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-list">
        {event.members.map(member => {
          const bank = getBankById(member.preferredBank);
          const isParticipantInExpenses = event.expenses.some(
            e => e.paidById === member.id || e.participants.includes(member.id)
          );

          return (
            <div key={member.id} className="member-card">
              <div className="card-left">
                <div className="card-icon" style={{ fontSize: '1.5rem' }}>
                  {member.avatarEmoji}
                </div>
                <div className="card-info">
                  <div className="card-title">{member.name}</div>
                  <div className="card-subtitle">
                    {member.phone ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {formatPhoneNumber(member.phone)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Телефон не указан</span>
                    )}

                    {bank && (
                      <span
                        className="bank-badge"
                        style={{ backgroundColor: bank.color }}
                      >
                        <Building2 size={11} />
                        {bank.shortName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  onClick={() => {
                    sounds.playTap();
                    setEditingMember(member);
                  }}
                  title="Редактировать телефон и банк"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  className="btn btn-icon btn-sm"
                  disabled={event.members.length <= 2}
                  style={{
                    color: isParticipantInExpenses ? 'var(--text-muted)' : 'var(--danger)',
                    opacity: event.members.length <= 2 ? 0.3 : 1,
                  }}
                  onClick={() => {
                    if (isParticipantInExpenses) {
                      alert('Этот участник уже фигурирует в тратах. Сначала удалите связанные траты.');
                      return;
                    }
                    if (window.confirm(`Удалить участника «${member.name}»?`)) {
                      sounds.playTap();
                      onRemoveMember(member.id);
                    }
                  }}
                  title={
                    isParticipantInExpenses
                      ? 'Участник задействован в тратах'
                      : 'Удалить участника'
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
