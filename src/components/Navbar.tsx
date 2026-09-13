import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Share2 } from 'lucide-react';
import { sounds } from '../core/soundEffects';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenShare: () => void;
  onOpenEvents: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenShare,
  onOpenEvents,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(sounds.enabled);

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={onOpenEvents} title="Управление событиями">
        <img src="/favicon.svg" alt="Складно" className="brand-logo" />
        <div className="brand-title">
          Складно
          <span className="brand-badge">v0.1.0</span>
        </div>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="btn btn-icon"
          onClick={handleToggleSound}
          title={soundEnabled ? 'Звуки включены' : 'Звуки выключены'}
          aria-label="Переключить звук"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          type="button"
          className="btn btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenShare}
          title="Поделиться в Telegram / ссылкой"
        >
          <Share2 size={16} />
          <span className="btn-share-text">Поделиться</span>
        </button>
      </div>
    </header>
  );
};
