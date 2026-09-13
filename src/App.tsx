import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { EventHero } from './components/EventHero';
import { SettlementTab } from './components/SettlementTab';
import { ExpensesTab } from './components/ExpensesTab';
import { MembersTab } from './components/MembersTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AddExpenseModal } from './components/AddExpenseModal';
import { SbpModal } from './components/SbpModal';
import { ShareModal } from './components/ShareModal';
import { EventModal } from './components/EventModal';

import { PartyEvent, Member, Expense, Currency, SettlementTransaction } from './types';
import { calculateBalances, minimizeDebts } from './core/debtMinimizer';
import {
  loadAllEvents,
  saveAllEvents,
  getActiveEventId,
  setActiveEventId,
  getDemoEvent,
} from './core/storage';
import { deserializeEventFromHash } from './core/urlState';
import { Plus } from 'lucide-react';
import { sounds } from './core/soundEffects';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Multi-event state
  const [events, setEvents] = useState<PartyEvent[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'settle' | 'expenses' | 'members' | 'analytics'>('settle');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [activeSbpTx, setActiveSbpTx] = useState<SettlementTransaction | null>(null);

  // Initialize
  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('skladno_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Check URL state for shared event
    let initialEvents = loadAllEvents();
    let initialActiveId = getActiveEventId();

    if (window.location.hash.startsWith('#s=')) {
      const sharedEvent = deserializeEventFromHash(window.location.hash);
      if (sharedEvent) {
        // Check if already in events
        const existingIdx = initialEvents.findIndex(e => e.id === sharedEvent.id);
        if (existingIdx >= 0) {
          initialEvents[existingIdx] = sharedEvent;
        } else {
          initialEvents.unshift(sharedEvent);
        }
        initialActiveId = sharedEvent.id;
        saveAllEvents(initialEvents);
        setActiveEventId(initialActiveId);
        // Clear hash so refresh keeps it clean
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    setEvents(initialEvents);
    setActiveId(initialActiveId);
  }, []);

  // Sync theme changes
  const toggleTheme = () => {
    sounds.playTap();
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('skladno_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const activeEvent = useMemo(() => {
    return events.find(e => e.id === activeId) || events[0] || getDemoEvent();
  }, [events, activeId]);

  // Calculations
  const balances = useMemo(() => {
    return calculateBalances(activeEvent.members, activeEvent.expenses);
  }, [activeEvent.members, activeEvent.expenses]);

  const transactions = useMemo(() => {
    return minimizeDebts(
      activeEvent.members,
      activeEvent.expenses,
      activeEvent.settledTransactions || []
    );
  }, [activeEvent.members, activeEvent.expenses, activeEvent.settledTransactions]);

  // State mutators
  const updateCurrentEvent = (updated: PartyEvent) => {
    const nextEvents = events.map(e => (e.id === updated.id ? updated : e));
    setEvents(nextEvents);
    saveAllEvents(nextEvents);
  };

  const handleToggleSettled = (txId: string) => {
    const currentSettled = activeEvent.settledTransactions || [];
    const nextSettled = currentSettled.includes(txId)
      ? currentSettled.filter(id => id !== txId)
      : [...currentSettled, txId];

    updateCurrentEvent({
      ...activeEvent,
      settledTransactions: nextSettled,
      updatedAt: Date.now(),
    });
  };

  const handleAddExpense = (expData: Omit<Expense, 'id' | 'createdAt'>) => {
    sounds.playSuccess();
    const newExpense: Expense = {
      ...expData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    updateCurrentEvent({
      ...activeEvent,
      expenses: [newExpense, ...activeEvent.expenses],
      updatedAt: Date.now(),
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    updateCurrentEvent({
      ...activeEvent,
      expenses: activeEvent.expenses.filter(e => e.id !== expenseId),
      updatedAt: Date.now(),
    });
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    updateCurrentEvent({
      ...activeEvent,
      members: [...activeEvent.members, newMember],
      updatedAt: Date.now(),
    });
  };

  const handleUpdateMember = (updatedMember: Member) => {
    updateCurrentEvent({
      ...activeEvent,
      members: activeEvent.members.map(m => (m.id === updatedMember.id ? updatedMember : m)),
      updatedAt: Date.now(),
    });
  };

  const handleRemoveMember = (memberId: string) => {
    updateCurrentEvent({
      ...activeEvent,
      members: activeEvent.members.filter(m => m.id !== memberId),
      updatedAt: Date.now(),
    });
  };

  const handleCreateEvent = (title: string, currency: Currency, description?: string) => {
    const newEv: PartyEvent = {
      id: `event_${Date.now()}`,
      title,
      description,
      currency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      members: [
        { id: 'm_me', name: 'Я', avatarEmoji: '😎' },
        { id: 'm_friend', name: 'Друг', avatarEmoji: '🚀' },
      ],
      expenses: [],
      settledTransactions: [],
    };

    const nextEvents = [newEv, ...events];
    setEvents(nextEvents);
    setActiveId(newEv.id);
    saveAllEvents(nextEvents);
    setActiveEventId(newEv.id);
  };

  const handleUpdateCurrentEventMeta = (title: string, currency: Currency, description?: string) => {
    updateCurrentEvent({
      ...activeEvent,
      title,
      currency,
      description,
      updatedAt: Date.now(),
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    const nextEvents = events.filter(e => e.id !== eventId);
    if (nextEvents.length === 0) {
      const demo = getDemoEvent();
      nextEvents.push(demo);
    }
    setEvents(nextEvents);
    const nextActive = nextEvents[0].id;
    setActiveId(nextActive);
    saveAllEvents(nextEvents);
    setActiveEventId(nextActive);
  };

  const handleResetDemo = () => {
    const demo = getDemoEvent();
    const nextEvents = [demo];
    setEvents(nextEvents);
    setActiveId(demo.id);
    saveAllEvents(nextEvents);
    setActiveEventId(demo.id);
  };

  return (
    <div className="app-container">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenShare={() => {
          sounds.playTap();
          setIsShareOpen(true);
        }}
        onOpenEvents={() => {
          sounds.playTap();
          setIsEventsOpen(true);
        }}
      />

      <EventHero
        event={activeEvent}
        transactions={transactions}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenMembers={() => setActiveTab('members')}
        onOpenSettings={() => setIsEventsOpen(true)}
      />

      {/* Navigation Tabs */}
      <nav className="tabs-nav" aria-label="Вкладки разделов">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'settle' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('settle');
          }}
        >
          <span>⚖️</span>
          <span>Итоги и СБП</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('expenses');
          }}
        >
          <span>💸</span>
          <span>Траты ({activeEvent.expenses.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('members');
          }}
        >
          <span>👥</span>
          <span>Друзья ({activeEvent.members.length})</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            sounds.playTap();
            setActiveTab('analytics');
          }}
        >
          <span>📊</span>
          <span>Аналитика</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main>
        {activeTab === 'settle' && (
          <SettlementTab
            event={activeEvent}
            transactions={transactions}
            balances={balances}
            onToggleSettled={handleToggleSettled}
            onOpenSbpModal={tx => setActiveSbpTx(tx)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            event={activeEvent}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            event={activeEvent}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab event={activeEvent} />
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <div className="fab-container">
        <button
          type="button"
          className="btn btn-primary fab-btn"
          onClick={() => {
            sounds.playTap();
            setIsAddExpenseOpen(true);
          }}
        >
          <Plus size={20} />
          <span>Добавить трату</span>
        </button>
      </div>

      {/* Modals */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          event={activeEvent}
          onClose={() => setIsAddExpenseOpen(false)}
          onAdd={handleAddExpense}
        />
      )}

      {activeSbpTx && (
        <SbpModal
          event={activeEvent}
          transaction={activeSbpTx}
          onClose={() => setActiveSbpTx(null)}
          onMarkSettled={handleToggleSettled}
        />
      )}

      {isShareOpen && (
        <ShareModal
          event={activeEvent}
          transactions={transactions}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {isEventsOpen && (
        <EventModal
          events={events}
          activeEventId={activeId}
          onSelectEvent={id => {
            setActiveId(id);
            setActiveEventId(id);
          }}
          onCreateEvent={handleCreateEvent}
          onUpdateCurrentEvent={handleUpdateCurrentEventMeta}
          onDeleteEvent={handleDeleteEvent}
          onResetDemo={handleResetDemo}
          onClose={() => setIsEventsOpen(false)}
        />
      )}
    </div>
  );
};
