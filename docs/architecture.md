# Архитектура проекта «Складно» (Skladno)

## 1. Концепция и архитектурные принципы

«Складно» спроектирован по парадигме **Local-First + Zero-Friction Web/PWA**:
- **Клиентская автономность:** Все вычисления, хранение данных и генерация отчетов происходят непосредственно на устройстве пользователя.
- **Мгновенный старт без регистрации (Zero-Login):** Пользователю не нужно указывать почту, пароль, номер телефона или проходить SMS-авторизацию.
- **Серверless-шаринг (URL-State / Peer-Sync):** Состояние группы или конкретного события может быть сериализовано, сжато алгоритмом LZ-String / Base64-URL и передано через ссылку в Telegram. При открытии ссылки состояние мгновенно распаковывается в локальное хранилище участника.
- **Оффлайн-работа (PWA):** Сервис доступен без подключения к сети благодаря Service Worker и кешированию ассетов.
- **Приватность по умолчанию (Privacy-First):** Никаких трекеров, cookies рекламных сетей, номеров банковских карт на сервере.

---

## 2. Диаграмма компонентов и потока данных

```mermaid
flowchart TD
    User([Пользователь / Компания друзей]) --> UI[Mobile-First React UI / PWA]
    
    subgraph Client [Клиентское приложение (Local-First)]
        UI --> StateManager[State Manager / React Context]
        StateManager --> LocalDB[(LocalStorage / IndexedDB)]
        StateManager --> DebtEngine[Debt Minimization Engine]
        StateManager --> SBPEngine[SBP & QR Generator]
        StateManager --> ShareEngine[LZ-String URL / TG Formatter]
    end
    
    subgraph Algorithms [Алгоритмический модуль]
        DebtEngine --> GreedyFlow[Жадный алгоритм минимизации графа транзакций O(N log N)]
        DebtEngine --> BalanceCalc[Расчет чистого баланса каждого участника]
    end
    
    subgraph Output [Каналы распространения]
        ShareEngine --> TG[Telegram-сообщение / Карточка с чеком]
        ShareEngine --> WebLink[URL со сжатым состоянием #state=...]
        SBPEngine --> BankLink[СБП Deep-Link / QR код для оплаты]
    end
    
    subgraph OptionalBackend [Опциональный Backend для Live-комнат]
        UI -.->|WebSocket / REST| SyncServer[Fastify / Hono Realtime Hub]
        SyncServer -.-> MemoryRoom[(In-Memory / SQLite Room State)]
    end
```

---

## 3. Математика: Алгоритм минимизации графа взаимозадолженностей

В компании из $N$ человек при десятках покупок («кто-то купил пиццу», «кто-то напитки», «кто-то билеты в кино») количество попарных транзакций может достигать $O(N^2)$.  
Например, в компании из 5 человек может возникнуть до 20 взаимных переводов.

«Складно» решает эту проблему за $O(N \log N)$ с помощью алгоритма сведения чистого баланса:

1. **Расчёт чистого баланса для каждого участника $i$:**
   $$\text{Balance}_i = \text{Оплачено}_i - \text{Потреблено}_i$$
   Сумма всех балансов строго равна нулю: $\sum_{i=1}^n \text{Balance}_i = 0$.
2. **Разделение на кредиторов и должников:**
   - Множество должников $D = \{i \mid \text{Balance}_i < -0.01\}$
   - Множество кредиторов $C = \{j \mid \text{Balance}_j > 0.01\}$
3. **Жадное сведение (Greedy Debt Settling):**
   - Берется максимальный должник $d \in D$ с долгом $|\text{Balance}_d|$ и максимальный кредитор $c \in C$ с требованием $\text{Balance}_c$.
   - Формируется транзакция на сумму $M = \min(|\text{Balance}_d|, \text{Balance}_c)$ от $d$ к $c$.
   - Балансы обновляются, участник с обнуленным балансом исключается.
   - Процесс гарантированно завершается не более чем за $N - 1$ транзакцию.

В результате вместо 15 хаотичных переводов компания получает **2–3 простых перевода по СБП**.

---

## 4. Специфика СБП (Система быстрых платежей)

Для каждого перевода приложение предоставляет:
1. **Номер телефона получателя** (с возможностью копирования в один клик).
2. **Предпочитаемый банк** (Т-Банк, Сбер, Альфа, ВТБ и др.) для удобства отправителя.
3. **Готовые deep-links банковских приложений** или QR-код стандарта ГОСТ Р 56042-2014 / СБП НСПК, позволяющий навести камеру смартфона и моментально открыть окно подтверждения перевода в мобильном банке без ручного ввода суммы.

---

## 5. Хранение и структура данных

### Модель события (Event / Trip / Party):
```typescript
export interface Member {
  id: string;
  name: string;
  avatarEmoji: string;
  phone?: string;
  preferredBank?: string; // e.g. "tinkoff", "sber", "alfa", "vtb"
}

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
  currency: 'RUB' | 'KZT' | 'BYN' | 'USD' | 'EUR';
  paidById: string;
  splitType: SplitType;
  participants: string[]; // member IDs
  exactAmounts?: Record<string, number>; // memberId -> amount
  items?: ExpenseItem[];
  createdAt: number;
  category: 'food' | 'drinks' | 'transport' | 'entertainment' | 'living' | 'other';
}

export interface PartyEvent {
  id: string;
  title: string;
  description?: string;
  currency: 'RUB' | 'KZT' | 'BYN' | 'USD' | 'EUR';
  createdAt: number;
  updatedAt: number;
  members: Member[];
  expenses: Expense[];
  settledTransactions?: string[]; // IDs of settled payments
}
```

---

## 6. Безопасность и отказоустойчивость

- **Отсутствие уязвимых точек на стороне сервера:** Базовый режим приложения статичен (HTML5 + CSS3 + React + WebAssembly/JS). Никакая база данных не может быть взломана или слита в даркнет, так как данные хранятся в защищенном локальном хранилище браузера (`localStorage` / `IndexedDB`).
- **Санитизация пользовательского ввода:** Любые имена, названия трат и телефоны экранируются против XSS-инъекций как при отображении в DOM, так и при генерации Telegram Markdown/HTML карточек.
- **Zero-knowledge sharing:** При отправке ссылки в Telegram хэш `#state=...` никогда не отправляется на сервер веб-хостинга согласно стандарту протокола HTTP (фрагмент URL обрабатывается исключительно браузером на стороне клиента).
