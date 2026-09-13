import React, { useState, useEffect } from 'react';
import { Smartphone, X, ChevronRight } from 'lucide-react';

interface IosInstallBannerProps {
  onOpenInstallModal: () => void;
}

export const IosInstallBanner: React.FC<IosInstallBannerProps> = ({ onOpenInstallModal }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    // Check if already in standalone (installed) mode
    const isStandalone = (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('skladno_ios_banner_dismissed') === 'true';

    if (isIos && !isStandalone && !isDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('skladno_ios_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="ios-install-banner">
      <div className="ios-banner-left" onClick={onOpenInstallModal}>
        <div className="ios-banner-icon">
          <Smartphone size={20} color="#FFFFFF" />
        </div>
        <div className="ios-banner-texts">
          <div className="ios-banner-heading">Установите на iPhone</div>
          <div className="ios-banner-subheading">Добавьте на экран «Домой» для оплат по СБП в 1 тап</div>
        </div>
      </div>

      <div className="ios-banner-actions">
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={onOpenInstallModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
        >
          <span>Как</span>
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          className="btn btn-icon btn-sm"
          onClick={handleDismiss}
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
