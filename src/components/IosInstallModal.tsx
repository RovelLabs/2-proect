import React, { useState } from 'react';
import { X, Smartphone, Share, PlusSquare, Download, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'safari' | 'profile' | 'ipa'>('safari');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadProfile = () => {
    setDownloaded(true);
    const link = document.createElement('a');
    link.href = '/skladno.mobileconfig';
    link.download = 'Skladno.mobileconfig';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content ios-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="ios-badge-icon">
              <Smartphone size={22} color="#6366F1" />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', margin: 0 }}>Установка на iPhone</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Полноценное приложение со сплитом долгов и переводами по СБП
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="ios-tabs">
          <button
            type="button"
            className={`ios-tab ${activeTab === 'safari' ? 'active' : ''}`}
            onClick={() => setActiveTab('safari')}
          >
            <Share size={15} />
            <span>В 2 тапа (Safari)</span>
            <span className="ios-tab-badge">Топ</span>
          </button>
          <button
            type="button"
            className={`ios-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Download size={15} />
            <span>Профиль (.mobileconfig)</span>
          </button>
          <button
            type="button"
            className={`ios-tab ${activeTab === 'ipa' ? 'active' : ''}`}
            onClick={() => setActiveTab('ipa')}
          >
            <Sparkles size={15} />
            <span>AltStore / Scarlet</span>
          </button>
        </div>

        {/* Tab 1: Safari Add to Home Screen */}
        {activeTab === 'safari' && (
          <div className="ios-tab-body">
            <div className="ios-banner-tip">
              <ShieldCheck size={18} color="#10B981" />
              <div>
                <strong>Официальный метод (как у Т-Банка и Сбера):</strong> Работает прямо сейчас, не слетает через 7 дней и не требует регистрации.
              </div>
            </div>

            <div className="ios-steps-list">
              <div className="ios-step-item">
                <div className="ios-step-number">1</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">
                    Нажмите «Поделиться» внизу экрана
                  </div>
                  <div className="ios-step-desc">
                    В стандартном браузере <strong>Safari</strong> нажмите на иконку квадрата со стрелкой вверх (<strong>Поделиться</strong>) в нижней панели.
                  </div>
                  <div className="ios-step-visual">
                    <Share size={20} color="#3B82F6" />
                    <span>Кнопка «Поделиться» в нижней панели Safari</span>
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-number">2</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">
                    Выберите «На экран “Домой”»
                  </div>
                  <div className="ios-step-desc">
                    Прокрутите открывшееся меню немного вниз и нажмите пункт с плюсиком <strong>«На экран “Домой”»</strong> (Add to Home Screen).
                  </div>
                  <div className="ios-step-visual">
                    <PlusSquare size={20} color="#10B981" />
                    <span>Пункт «На экран “Домой”»</span>
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-number">3</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">
                    Подтвердите «Добавить»
                  </div>
                  <div className="ios-step-desc">
                    В правом верхнем углу нажмите <strong>«Добавить»</strong>. На рабочем столе iPhone появится иконка «Складно»!
                  </div>
                </div>
              </div>
            </div>

            <div className="ios-advantages">
              <div className="adv-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Полноэкранный режим без адресной строки Safari</span>
              </div>
              <div className="adv-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Мгновенный перевод по СБП в Сбер, Т-Банк, Альфу, ВТБ</span>
              </div>
              <div className="adv-item">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Полная работа офлайн без интернета</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Apple Configuration Profile (.mobileconfig) */}
        {activeTab === 'profile' && (
          <div className="ios-tab-body">
            <div className="ios-banner-tip">
              <Sparkles size={18} color="#6366F1" />
              <div>
                <strong>Профиль конфигурации Apple WebClip:</strong> позволяет установить ярлык приложения сразу в систему в 1 клик.
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '1.2rem 0' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.6rem' }}
                onClick={handleDownloadProfile}
              >
                <Download size={20} />
                <span>{downloaded ? 'Профиль скачан! Проверьте Настройки' : 'Скачать профиль для iPhone (.mobileconfig)'}</span>
              </button>
            </div>

            <div className="ios-steps-list">
              <div className="ios-step-item">
                <div className="ios-step-number">1</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">Разрешите загрузку профиля</div>
                  <div className="ios-step-desc">
                    При нажатии на кнопку Safari спросит разрешение. Нажмите <strong>«Разрешить»</strong>, затем <strong>«Закрыть»</strong>.
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-number">2</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">Откройте «Настройки» iPhone</div>
                  <div className="ios-step-desc">
                    Вверху Настроек появится пункт <strong>«Профиль загружен»</strong> (либо зайдите в <em>Основные ➔ VPN и управление устройством</em>).
                  </div>
                </div>
              </div>

              <div className="ios-step-item">
                <div className="ios-step-number">3</div>
                <div className="ios-step-content">
                  <div className="ios-step-title">Нажмите «Установить»</div>
                  <div className="ios-step-desc">
                    Введите код-пароль разблокировки iPhone и подтвердите установку. Иконка приложения сразу появится на рабочем столе.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: IPA for Sideloading */}
        {activeTab === 'ipa' && (
          <div className="ios-tab-body">
            <div className="ios-banner-tip">
              <AlertCircle size={18} color="#F59E0B" />
              <div>
                <strong>Для продвинутых пользователей iOS:</strong> Установка нативного IPA через сторонние установщики (Scarlet, AltStore, Sideloadly, TrollStore).
              </div>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Вы можете собрать нативный iOS-пакет через исходный проект Capacitor в Xcode, либо использовать готовый веб-пакет без каких-либо лимитов сертификатов.
              </p>

              <div className="ios-sideload-links">
                <a
                  href="https://github.com/RovelLabs/2-proect/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}
                >
                  <Download size={18} />
                  <span>Скачать профиль или исходники на GitHub Releases</span>
                </a>
              </div>

              <div className="ios-steps-list" style={{ marginTop: '1rem' }}>
                <div className="ios-step-item">
                  <div className="ios-step-number">•</div>
                  <div className="ios-step-content">
                    <div className="ios-step-title">Scarlet / AltStore / TrollStore</div>
                    <div className="ios-step-desc">
                      Поддерживает установку нативного IPA с кастомным Bundle ID <code>app.skladno.split</code>.
                    </div>
                  </div>
                </div>
                <div className="ios-step-item">
                  <div className="ios-step-number">•</div>
                  <div className="ios-step-content">
                    <div className="ios-step-title">Полная поддержка СБП</div>
                    <div className="ios-step-desc">
                      Генерация диплинков в банковские приложения (Сбер, Т-Банк, Альфа-Банк, ВТБ) работает на всех версиях iOS 14–18+.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            100% бесплатно • Без сбора данных
          </span>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
