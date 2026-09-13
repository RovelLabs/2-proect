import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, QrCode, Phone, CheckCircle2 } from 'lucide-react';
import { PartyEvent, SettlementTransaction, CURRENCIES } from '../types';
import { getBankById, formatPhoneNumber, cleanPhoneDigits, generateQrCodeDataUrl } from '../core/sbpHelper';
import { sounds } from '../core/soundEffects';

interface SbpModalProps {
  event: PartyEvent;
  transaction: SettlementTransaction;
  onClose: () => void;
  onMarkSettled: (txId: string) => void;
}

export const SbpModal: React.FC<SbpModalProps> = ({
  event,
  transaction,
  onClose,
  onMarkSettled,
}) => {
  const currencySymbol = CURRENCIES[event.currency]?.symbol || '₽';
  const memberMap = new Map(event.members.map(m => [m.id, m]));

  const fromMember = memberMap.get(transaction.fromMemberId);
  const toMember = memberMap.get(transaction.toMemberId);
  const bank = getBankById(toMember?.preferredBank);

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    const phone = toMember?.phone ? cleanPhoneDigits(toMember.phone) : '';
    // Standard payload or SBP URL
    const payload = phone
      ? `https://qr.nspk.ru/proxyapp?phone=${phone}&amount=${transaction.amount}&purpose=${encodeURIComponent('Складно: ' + event.title)}`
      : `Перевод ${transaction.amount} ${currencySymbol} для ${toMember?.name || 'друга'}`;

    generateQrCodeDataUrl(payload).then(url => {
      if (active) setQrDataUrl(url);
    });

    return () => {
      active = false;
    };
  }, [event.title, toMember, transaction.amount, currencySymbol]);

  const handleCopyPhone = () => {
    if (!toMember?.phone) return;
    navigator.clipboard.writeText(cleanPhoneDigits(toMember.phone));
    sounds.playTap();
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(transaction.amount));
    sounds.playTap();
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSettle = () => {
    sounds.playSuccess();
    onMarkSettled(transaction.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <QrCode size={20} color="var(--accent-primary)" />
            Оплата по СБП
          </h3>
          <button type="button" className="btn btn-icon btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            {fromMember?.name} переводит для:
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>{toMember?.avatarEmoji}</span>
            <span>{toMember?.name}</span>
            {bank && (
              <span
                className="bank-badge"
                style={{ backgroundColor: bank.color }}
              >
                {bank.shortName}
              </span>
            )}
          </div>

          <div
            className="num-font"
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: 'var(--accent-primary)',
              margin: '12px 0',
              cursor: 'pointer',
            }}
            onClick={handleCopyAmount}
            title="Нажмите, чтобы скопировать сумму"
          >
            {transaction.amount.toLocaleString('ru-RU')} {currencySymbol}
            <span style={{ fontSize: '0.8rem', marginLeft: 6, opacity: 0.6, verticalAlign: 'middle' }}>
              {copiedAmount ? <Check size={16} /> : <Copy size={16} />}
            </span>
          </div>
        </div>

        {/* QR Code Section */}
        {qrDataUrl && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <img
              src={qrDataUrl}
              alt="СБП QR Код"
              style={{ width: '200px', height: '200px', display: 'block' }}
            />
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 8, fontWeight: 600 }}>
              Наведите камеру смартфона для быстрого перевода
            </div>
          </div>
        )}

        {/* Phone details */}
        {toMember?.phone ? (
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone size={18} style={{ opacity: 0.6 }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Номер для перевода (СБП):
                </div>
                <div className="num-font" style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {formatPhoneNumber(toMember.phone)}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyPhone}
            >
              {copiedPhone ? <Check size={15} color="var(--accent-primary)" /> : <Copy size={15} />}
              <span>{copiedPhone ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            У получателя не указан номер телефона. Уточните номер в чате или переведите по имени.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toMember?.phone && (
            <a
              href={`tel:${cleanPhoneDigits(toMember.phone)}`}
              className="btn btn-secondary btn-block"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={16} />
              <span>Позвонить получателю</span>
            </a>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleSettle}
          >
            <CheckCircle2 size={18} />
            <span>Отметить как переведённый</span>
          </button>
        </div>
      </div>
    </div>
  );
};
