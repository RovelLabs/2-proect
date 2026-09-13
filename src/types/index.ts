export type Currency = 'RUB' | 'KZT' | 'BYN' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  RUB: { code: 'RUB', symbol: '₽', name: 'Российский рубль', flag: '🇷🇺' },
  KZT: { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', flag: '🇰🇿' },
  BYN: { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', flag: '🇧🇾' },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро', flag: '🇪🇺' },
};

export interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  color: string;
  iconText: string;
  schema?: string;
}

export const CIS_BANKS: BankInfo[] = [
  { id: 'tinkoff', name: 'Т-Банк (Тинькофф)', shortName: 'Т-Банк', color: '#FFDD2D', iconText: 'Т' },
  { id: 'sber', name: 'СберБанк', shortName: 'Сбер', color: '#21A038', iconText: 'С' },
  { id: 'alfa', name: 'Альфа-Банк', shortName: 'Альфа', color: '#EF3124', iconText: 'А' },
  { id: 'vtb', name: 'ВТБ', shortName: 'ВТБ', color: '#002882', iconText: 'В' },
  { id: 'yandex', name: 'Яндекс Банк', shortName: 'Яндекс', color: '#FC3F1D', iconText: 'Я' },
  { id: 'raiffeisen', name: 'Райффайзен', shortName: 'Райф', color: '#FFEE00', iconText: 'Р' },
  { id: 'ozon', name: 'Озон Банк', shortName: 'Озон', color: '#005BFF', iconText: 'О' },
  { id: 'kaspi', name: 'Kaspi.kz', shortName: 'Kaspi', color: '#F14635', iconText: 'K' },
];

export interface Member {
  id: string;
  name: string;
  avatarEmoji: string;
  phone?: string;
  preferredBank?: string; // bank id from CIS_BANKS
}

export type ExpenseCategory = 'food' | 'drinks' | 'transport' | 'entertainment' | 'living' | 'other';

export interface CategoryConfig {
  id: ExpenseCategory;
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  food: { id: 'food', name: 'Еда и пицца', emoji: '🍕', color: '#F97316' },
  drinks: { id: 'drinks', name: 'Напитки', emoji: '🥤', color: '#38BDF8' },
  entertainment: { id: 'entertainment', name: 'Развлечения', emoji: '🎉', color: '#A855F7' },
  transport: { id: 'transport', name: 'Такси и проезд', emoji: '🚕', color: '#FACC15' },
  living: { id: 'living', name: 'Аренда и жильё', emoji: '🏠', color: '#EC4899' },
  other: { id: 'other', name: 'Другое', emoji: '🛍️', color: '#10B981' },
};

export type SplitType = 'equal' | 'exact' | 'shares' | 'items';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  assignedTo: string[]; // member IDs
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidById: string; // member ID
  splitType: SplitType;
  participants: string[]; // member IDs participating
  exactAmounts?: Record<string, number>; // memberId -> exact amount
  shares?: Record<string, number>; // memberId -> share weight (e.g. 1, 2)
  items?: ExpenseItem[];
  createdAt: number;
  note?: string;
}

export interface SettlementTransaction {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  isSettled: boolean;
}

export interface PartyEvent {
  id: string;
  title: string;
  description?: string;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
  members: Member[];
  expenses: Expense[];
  settledTransactions: string[]; // Transaction IDs that were marked as settled
}

export interface MemberBalance {
  memberId: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = creditor (owes nothing, is owed), negative = debtor (owes others)
}
