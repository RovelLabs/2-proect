import { PartyEvent } from '../types';

const STORAGE_EVENTS_KEY = 'skladno_events_v1';
const STORAGE_ACTIVE_ID_KEY = 'skladno_active_event_id_v1';

export function getDemoEvent(): PartyEvent {
  const now = Date.now();
  return {
    id: 'demo_party_event',
    title: '🍕 Пицца и настолки в субботу',
    description: 'Вписка у Олега, играли в Бункер и Codenames',
    currency: 'RUB',
    createdAt: now - 3600 * 1000 * 5,
    updatedAt: now,
    members: [
      { id: 'm_oleg', name: 'Олег', avatarEmoji: '😎', phone: '79991234567', preferredBank: 'tinkoff' },
      { id: 'm_danya', name: 'Даня', avatarEmoji: '🚀', phone: '79169876543', preferredBank: 'sber' },
      { id: 'm_polina', name: 'Полина', avatarEmoji: '🌸', phone: '79255554433', preferredBank: 'alfa' },
      { id: 'm_sonya', name: 'Соня', avatarEmoji: '🐱', phone: '79031112233', preferredBank: 'tinkoff' },
    ],
    expenses: [
      {
        id: 'exp_1',
        title: 'Додо Пицца (4 сыра + Пепперони)',
        amount: 2400,
        category: 'food',
        paidById: 'm_oleg',
        splitType: 'equal',
        participants: ['m_oleg', 'm_danya', 'm_polina', 'm_sonya'],
        createdAt: now - 3600 * 1000 * 4,
        note: 'Оплачено через сайт Додо',
      },
      {
        id: 'exp_2',
        title: 'Кола, чипсы и соки в Самокате',
        amount: 980,
        category: 'drinks',
        paidById: 'm_danya',
        splitType: 'equal',
        participants: ['m_oleg', 'm_danya', 'm_polina', 'm_sonya'],
        createdAt: now - 3600 * 1000 * 3,
      },
      {
        id: 'exp_3',
        title: 'Новая настолка «Бункер»',
        amount: 1500,
        category: 'entertainment',
        paidById: 'm_polina',
        splitType: 'equal',
        participants: ['m_oleg', 'm_danya', 'm_polina', 'm_sonya'],
        createdAt: now - 3600 * 1000 * 2,
      },
    ],
    settledTransactions: [],
  };
}

export function loadAllEvents(): PartyEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (!raw) {
      const initial = [getDemoEvent()];
      saveAllEvents(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as PartyEvent[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [getDemoEvent()];
      saveAllEvents(initial);
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading events:', e);
    return [getDemoEvent()];
  }
}

export function saveAllEvents(events: PartyEvent[]): void {
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events:', e);
  }
}

export function getActiveEventId(): string {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || 'demo_party_event';
  } catch {
    return 'demo_party_event';
  }
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
  } catch (e) {
    console.error('Error setting active event id:', e);
  }
}

export function exportAllDataAsJson(): string {
  const events = loadAllEvents();
  return JSON.stringify({ version: 1, exportedAt: Date.now(), events }, null, 2);
}

export function importAllDataFromJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data && Array.isArray(data.events)) {
      saveAllEvents(data.events);
      if (data.events.length > 0) {
        setActiveEventId(data.events[0].id);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
