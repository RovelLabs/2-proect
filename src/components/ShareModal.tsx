import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, QrCode } from 'lucide-react';
import { PartyEvent, SettlementTransaction } from '../types';
import { serializeEventToHash, formatTelegramSummary } from '../core/urlState';
import { generateQrCodeDataUrl } from '../core/sbpHelper';
import { sounds } from '../core/soundEffects';

interface ShareModalProps {
  event: PartyEvent;
  transactions: SettlementTransaction[];
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  event,
  transactions,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${serializeEventToHash(event)}`
    : '';

  const tgMessage = formatTelegramSummary(event, transactions, currentUrl);

  useEffect(() => {
    let active = true;
    if (currentUrl) {
      generateQrCodeDataUrl(currentUrl).then(url => {
        if (active) setQrUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    sounds.playTap();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(tgMessage);
    sounds.playTap();
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendTelegram = () => {
    sounds.playTap();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(tgMessage)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Send size={20} color="var(--accent-primary)" />
            Поделиться с друзьями
          </h3>
          <button type="button" className="btn btn-icon btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Telegram Direct Send */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleSendTelegram}
            style={{
              background: 'linear-gradient(135deg, #229ED9, #1D8ABF)',
              boxShadow: '0 4px 14px rgba(34, 158, 217, 0.4)',
            }}
          >
            <Send size={18} />
            <span>Отправить в чат Telegram</span>
          </button>
        </div>

        {/* Message preview */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Сводка для чата:</label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '0.78rem' }}
              onClick={handleCopyText}
            >
              {copiedText ? <Check size={13} color="var(--accent-primary)" /> : <Copy size={13} />}
              <span>{copiedText ? 'Скопировано' : 'Скопировать текст'}</span>
            </button>
          </div>

          <pre
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '0.82rem',
              whiteSpace: 'pre-wrap',
              maxHeight: '160px',
              overflowY: 'auto',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
            }}
          >
            {tgMessage}
          </pre>
        </div>

        {/* Interactive Link Copy */}
        <div className="form-group">
          <label className="form-label">Интерактивная ссылка (Local-First):</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              className="form-input num-font"
              style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
              value={currentUrl}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyLink}
            >
              {copiedLink ? <Check size={16} color="var(--accent-primary)" /> : <Copy size={16} />}
              <span>{copiedLink ? 'Готово!' : 'Копия'}</span>
            </button>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
            💡 Состояние закодировано прямо в ссылке. Друг откроет её без регистрации!
          </div>
        </div>

        {/* QR Code */}
        {qrUrl && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              marginTop: '16px',
            }}
          >
            <img
              src={qrUrl}
              alt="QR Ссылка"
              style={{ width: '160px', height: '160px', display: 'block' }}
            />
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <QrCode size={14} /> Отсканируйте камерой телефона
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
