import React, { useState } from 'react';
import { Plus, Trash2, Download, Upload, RefreshCw, Calendar } from 'lucide-react';
import { PartyEvent, Currency, CURRENCIES } from '../types';
import { exportAllDataAsJson, importAllDataFromJson } from '../core/storage';
import { sounds } from '../core/soundEffects';

interface EventModalProps {
  events: PartyEvent[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onCreateEvent: (title: string, currency: Currency, description?: string) => void;
  onUpdateCurrentEvent: (title: string, currency: Currency, description?: string) => void;
  onDeleteEvent: (id: string) => void;
  onResetDemo: () => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onCreateEvent,
  onUpdateCurrentEvent,
  onDeleteEvent,
  onResetDemo,
  onClose,
}) => {
  const currentEvent = events.find(e => e.id === activeEventId) || events[0];

  const [mode, setMode] = useState<'switch' | 'new' | 'edit'>('switch');

  // New / Edit Form state
  const [title, setTitle] = useState(currentEvent?.title || '');
  const [description, setDescription] = useState(currentEvent?.description || '');
  const [currency, setCurrency] = useState<Currency>(currentEvent?.currency || 'RUB');

  const handleStartCreate = () => {
    sounds.playTap();
    setTitle('');
    setDescription('');
    setCurrency('RUB');
    setMode('new');
  };

  const handleStartEdit = () => {
    sounds.playTap();
    setTitle(currentEvent?.title || '');
    setDescription(currentEvent?.description || '');
    setCurrency(currentEvent?.currency || 'RUB');
    setMode('edit');
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    sounds.playTap();
    onCreateEvent(title.trim(), currency, description.trim() || undefined);
    setMode('switch');
    onClose();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    sounds.playTap();
    onUpdateCurrentEvent(title.trim(), currency, description.trim() || undefined);
    setMode('switch');
  };

  const handleExport = () => {
    sounds.playTap();
    const json = exportAllDataAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skladno_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content && importAllDataFromJson(content)) {
        sounds.playSuccess();
        alert('Данные успешно импортированы!');
        window.location.reload();
      } else {
        alert('Некорректный файл резервной копии');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Calendar size={20} color="var(--accent-primary)" />
            {mode === 'switch' && 'Мои события и тусовки'}
            {mode === 'new' && 'Создать новое событие'}
            {mode === 'edit' && 'Настройки текущего события'}
          </h3>
          <button type="button" className="btn btn-icon btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {mode === 'switch' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Выберите событие или создайте новое:
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleStartCreate}
              >
                <Plus size={15} />
                <span>Создать</span>
              </button>
            </div>

            <div className="card-list" style={{ marginBottom: 20 }}>
              {events.map(ev => {
                const isActive = ev.id === activeEventId;
                const total = ev.expenses.reduce((sum, e) => sum + e.amount, 0);
                const sym = CURRENCIES[ev.currency]?.symbol || '₽';

                return (
                  <div
                    key={ev.id}
                    className="expense-card"
                    style={{
                      cursor: 'pointer',
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-color)',
                      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                    }}
                    onClick={() => {
                      sounds.playTap();
                      onSelectEvent(ev.id);
                      onClose();
                    }}
                  >
                    <div className="card-left">
                      <div className="card-icon" style={{ fontSize: '1.4rem' }}>
                        {ev.title.slice(0, 2).trim() || '🎉'}
                      </div>
                      <div className="card-info">
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{ev.title}</span>
                          {isActive && (
                            <span className="brand-badge" style={{ fontSize: '0.65rem' }}>
                              Активно
                            </span>
                          )}
                        </div>
                        <div className="card-subtitle">
                          <span>{ev.members.length} участников</span>
                          <span>•</span>
                          <span>{ev.expenses.length} трат</span>
                          <span>•</span>
                          <span className="num-font" style={{ fontWeight: 700 }}>
                            {total.toLocaleString('ru-RU')} {sym}
                          </span>
                        </div>
                      </div>
                    </div>

                    {events.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-icon btn-sm"
                        style={{ color: 'var(--danger)', width: 32, height: 32 }}
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Удалить событие «${ev.title}»?`)) {
                            sounds.playTap();
                            onDeleteEvent(ev.id);
                          }
                        }}
                        title="Удалить событие"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={handleStartEdit}
              >
                Редактировать текущее
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (window.confirm('Сбросить текущие данные и загрузить демонстрационную тусовку?')) {
                    sounds.playTap();
                    onResetDemo();
                    onClose();
                  }
                }}
                title="Восстановить демо-тусовку"
              >
                <RefreshCw size={14} />
                <span>Демо-данные</span>
              </button>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                title="Скачать все события в JSON файл"
              >
                <Download size={14} />
                <span>Экспорт JSON</span>
              </button>

              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} />
                <span>Импорт JSON</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
              </label>
            </div>
          </div>
        )}

        {(mode === 'new' || mode === 'edit') && (
          <form onSubmit={mode === 'new' ? handleSaveNew : handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Название события:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Например: Поездка на дачу / ДР Влада"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Валюта:</label>
              <select
                className="form-select"
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
              >
                {Object.values(CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Описание / Заметка:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Например: Пятница, 18:00 у Дани"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('switch')}
              >
                Назад
              </button>
              <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                {mode === 'new' ? 'Создать событие' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
