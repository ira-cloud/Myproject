# Cycle & Nutrient Syncing — Stage 1 (Free MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working, testable iOS app (React Native/Expo) that calculates the user's current cycle phase, lets her log symptoms, and shows a "plate of the day" with equivalent food/tea choices — 100% offline, no backend, no AI.

**Architecture:** Expo Router app with three layers: (1) a local SQLite data layer behind a small `Store<T>` interface (swappable for an in-memory fake in tests), (2) pure, dependency-free business logic (phase engine, rules engine, pattern recognition) that is fully unit-testable without touching React Native or SQLite, (3) presentational React Native components that receive data via props and are tested with React Testing Library, wired into thin `app/` route files.

**Tech Stack:** Expo SDK 51 (React Native 0.74), TypeScript 5.3, expo-router 3.5, expo-sqlite 14, expo-notifications 0.28, NativeWind 4, Jest + jest-expo, @testing-library/react-native.

## Global Constraints

- No network calls anywhere in this app. No backend, no accounts, no analytics SDKs that transmit data.
- No medical/diagnostic language in any user-facing string ("диагноз", "лечение", "у вас дефицит X" are forbidden). Use only "продукты, богатые X" / "состояния, часто связанные с фазой Y" style copy (spec §6).
- No calorie counts, no gram-level nutrient dosing, no AI-generated or fixed "recipes" in this version — only product **names** and hand-sized portions (spec §4 note under T4, §9).
- Default food/tea pool excludes gluten, cow's milk dairy, and added sugar (spec §4.5 dietary defaults).
- Every food/tea category must offer 2+ equivalent options mixing locally accessible (UA/CIS) and international alternatives, no option ranked "better" (spec §4.5).
- All source files under `src/` use the `@/*` path alias for `src/*`.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `jest.config.js`
- Create: `app.json`
- Create: `src/types/index.ts`
- Test: `src/types/index.test.ts`

**Interfaces:**
- Produces: `Phase`, `SymptomTag`, `Intensity`, `UserProfile`, `CycleEntry`, `SymptomLog` types used by every later task.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cycle-nutrient-syncing",
  "version": "0.1.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "test": "jest"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-sqlite": "~14.0.0",
    "expo-notifications": "~0.28.0",
    "expo-status-bar": "~1.12.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "nativewind": "^4.0.36",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@testing-library/react-native": "^12.5.0",
    "@types/react": "~18.2.79",
    "jest": "^29.7.0",
    "jest-expo": "~51.0.0",
    "typescript": "~5.3.3"
  },
  "private": true
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 3: Create `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

- [ ] **Step 4: Create `jest.config.js`**

```js
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

- [ ] **Step 5: Create `app.json`**

```json
{
  "expo": {
    "name": "Cycle & Nutrient Syncing",
    "slug": "cycle-nutrient-syncing",
    "version": "0.1.0",
    "orientation": "portrait",
    "scheme": "cyclesync",
    "ios": { "bundleIdentifier": "com.iracloud.cyclesync", "supportsTablet": false },
    "plugins": ["expo-router"]
  }
}
```

- [ ] **Step 6: Write `src/types/index.ts`**

```typescript
export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type SymptomTag =
  | 'bloating'
  | 'breast_tenderness'
  | 'cramps'
  | 'acne'
  | 'apathy'
  | 'irritability'
  | 'anxiety'
  | 'sugar_craving'
  | 'salt_craving';

export type Intensity = 'light' | 'medium' | 'super';

export interface UserProfile {
  id: number;
  lastPeriodStart: string; // ISO date, e.g. "2026-07-20"
  avgCycleLength: number; // days
  avgPeriodLength: number; // days
  dietaryRestrictions: string[];
  intensity: Intensity;
  cycleLengthIsEstimate: boolean; // true if user picked "не уверена точно"
}

export interface CycleEntry {
  id: number;
  startDate: string; // ISO date
}

export interface SymptomLog {
  id: number;
  date: string; // ISO date
  tags: SymptomTag[];
}
```

- [ ] **Step 7: Write the smoke test `src/types/index.test.ts`**

```typescript
import type { Phase } from '@/types';

describe('types smoke test', () => {
  it('accepts all four valid Phase values', () => {
    const phases: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
    expect(phases).toHaveLength(4);
  });
});
```

- [ ] **Step 8: Install dependencies and run the test**

Run: `npm install && npm test -- src/types/index.test.ts`
Expected: PASS (1 test)

- [ ] **Step 9: Commit**

```bash
git add package.json tsconfig.json babel.config.js jest.config.js app.json src/types
git commit -m "chore: scaffold Expo/TypeScript project with Jest"
```

---

## Task 2: Data Layer Core — Store Interface, In-Memory Store, SQLite Store

**Files:**
- Create: `src/db/types.ts`
- Create: `src/db/inMemoryStore.ts`
- Create: `src/db/sqliteStore.ts`
- Create: `src/db/schema.ts`
- Test: `src/db/inMemoryStore.test.ts`
- Test: `src/db/sqliteStore.test.ts`

**Interfaces:**
- Consumes: nothing (foundation layer).
- Produces: `Store<T>` interface, `createInMemoryStore<T>()`, `createSqliteStore<T>(db, table, columns)`, `CREATE_TABLES_SQL` — used by every repository in Task 3 and 4.

- [ ] **Step 1: Write `src/db/types.ts`**

```typescript
export interface Store<T extends { id: number }> {
  insert(row: Omit<T, 'id'>): T;
  getAll(): T[];
  getById(id: number): T | undefined;
  update(id: number, patch: Partial<Omit<T, 'id'>>): void;
}
```

- [ ] **Step 2: Write the failing test for the in-memory store**

```typescript
// src/db/inMemoryStore.test.ts
import { createInMemoryStore } from '@/db/inMemoryStore';

interface Widget { id: number; name: string; qty: number }

describe('createInMemoryStore', () => {
  it('assigns incrementing ids on insert', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    const b = store.insert({ name: 'B', qty: 2 });
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
  });

  it('returns all inserted rows', () => {
    const store = createInMemoryStore<Widget>();
    store.insert({ name: 'A', qty: 1 });
    store.insert({ name: 'B', qty: 2 });
    expect(store.getAll()).toHaveLength(2);
  });

  it('finds a row by id', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    expect(store.getById(a.id)?.name).toBe('A');
    expect(store.getById(999)).toBeUndefined();
  });

  it('updates a row by id, leaving other fields untouched', () => {
    const store = createInMemoryStore<Widget>();
    const a = store.insert({ name: 'A', qty: 1 });
    store.update(a.id, { qty: 5 });
    expect(store.getById(a.id)).toEqual({ id: a.id, name: 'A', qty: 5 });
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- src/db/inMemoryStore.test.ts`
Expected: FAIL with "Cannot find module '@/db/inMemoryStore'"

- [ ] **Step 4: Implement `src/db/inMemoryStore.ts`**

```typescript
import type { Store } from '@/db/types';

export function createInMemoryStore<T extends { id: number }>(): Store<T> {
  let rows: T[] = [];
  let nextId = 1;

  return {
    insert(row) {
      const record = { ...row, id: nextId++ } as T;
      rows.push(record);
      return record;
    },
    getAll() {
      return [...rows];
    },
    getById(id) {
      return rows.find((r) => r.id === id);
    },
    update(id, patch) {
      rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    },
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/db/inMemoryStore.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Write the failing test for the SQLite-backed store (using a mock db, no device needed)**

```typescript
// src/db/sqliteStore.test.ts
import { createSqliteStore } from '@/db/sqliteStore';

interface Widget { id: number; name: string; qty: number }

function createMockDb() {
  return {
    runSync: jest.fn().mockReturnValue({ lastInsertRowId: 42 }),
    getAllSync: jest.fn().mockReturnValue([{ id: 1, name: 'A', qty: 1 }]),
    getFirstSync: jest.fn().mockReturnValue({ id: 1, name: 'A', qty: 1 }),
  };
}

describe('createSqliteStore', () => {
  it('builds a parameterized INSERT and returns the row with the new id', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    const result = store.insert({ name: 'A', qty: 1 });

    expect(db.runSync).toHaveBeenCalledWith(
      'INSERT INTO widgets (name, qty) VALUES (?, ?)',
      ['A', 1]
    );
    expect(result).toEqual({ name: 'A', qty: 1, id: 42 });
  });

  it('queries all rows with SELECT *', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    const rows = store.getAll();

    expect(db.getAllSync).toHaveBeenCalledWith('SELECT * FROM widgets');
    expect(rows).toHaveLength(1);
  });

  it('queries a single row by id', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.getById(1);

    expect(db.getFirstSync).toHaveBeenCalledWith('SELECT * FROM widgets WHERE id = ?', [1]);
  });

  it('builds a parameterized UPDATE for the given patch fields only', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.update(1, { qty: 9 });

    expect(db.runSync).toHaveBeenCalledWith('UPDATE widgets SET qty = ? WHERE id = ?', [9, 1]);
  });

  it('does nothing when update is called with an empty patch', () => {
    const db = createMockDb();
    const store = createSqliteStore<Widget>(db as any, 'widgets', ['name', 'qty']);

    store.update(1, {});

    expect(db.runSync).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npm test -- src/db/sqliteStore.test.ts`
Expected: FAIL with "Cannot find module '@/db/sqliteStore'"

- [ ] **Step 8: Implement `src/db/sqliteStore.ts`**

```typescript
import type { Store } from '@/db/types';

// Minimal shape we need from expo-sqlite's SQLiteDatabase — kept local so this
// file has zero import-time dependency on the native module and stays easy to
// unit test with a plain mock object.
export interface SqlDb {
  runSync(sql: string, params?: unknown[]): { lastInsertRowId: number };
  getAllSync<T>(sql: string, params?: unknown[]): T[];
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
}

export function createSqliteStore<T extends { id: number }>(
  db: SqlDb,
  table: string,
  columns: string[]
): Store<T> {
  const placeholders = columns.map(() => '?').join(', ');

  return {
    insert(row) {
      const values = columns.map((c) => (row as Record<string, unknown>)[c]);
      const result = db.runSync(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
      return { ...row, id: result.lastInsertRowId } as T;
    },
    getAll() {
      return db.getAllSync<T>(`SELECT * FROM ${table}`);
    },
    getById(id) {
      return db.getFirstSync<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]) ?? undefined;
    },
    update(id, patch) {
      const patchCols = Object.keys(patch);
      if (patchCols.length === 0) return;
      const clause = patchCols.map((c) => `${c} = ?`).join(', ');
      const values = patchCols.map((c) => (patch as Record<string, unknown>)[c]);
      db.runSync(`UPDATE ${table} SET ${clause} WHERE id = ?`, [...values, id]);
    },
  };
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm test -- src/db/sqliteStore.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 10: Write `src/db/schema.ts` (raw column names for the four tables — no test, pure data)**

```typescript
export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_period_start TEXT NOT NULL,
  avg_cycle_length INTEGER NOT NULL,
  avg_period_length INTEGER NOT NULL,
  dietary_restrictions TEXT NOT NULL,
  intensity TEXT NOT NULL,
  cycle_length_is_estimate INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cycle_entry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS symptom_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  tags TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);
`;

export const USER_PROFILE_COLUMNS = [
  'last_period_start',
  'avg_cycle_length',
  'avg_period_length',
  'dietary_restrictions',
  'intensity',
  'cycle_length_is_estimate',
];

export const CYCLE_ENTRY_COLUMNS = ['start_date'];
export const SYMPTOM_LOG_COLUMNS = ['date', 'tags'];
export const SETTINGS_COLUMNS = ['key', 'value'];
```

- [ ] **Step 11: Commit**

```bash
git add src/db/types.ts src/db/inMemoryStore.ts src/db/inMemoryStore.test.ts src/db/sqliteStore.ts src/db/sqliteStore.test.ts src/db/schema.ts
git commit -m "feat: add Store interface with in-memory and SQLite implementations"
```

---

## Task 3: UserProfile and Settings Repositories

**Files:**
- Create: `src/db/userProfileRepo.ts`
- Create: `src/db/settingsRepo.ts`
- Test: `src/db/userProfileRepo.test.ts`
- Test: `src/db/settingsRepo.test.ts`

**Interfaces:**
- Consumes: `Store<T>`, `createInMemoryStore` (Task 2), `UserProfile` type (Task 1).
- Produces: `createUserProfileRepo(store)` with `.save(data)` / `.get()`, `createSettingsRepo(store)` with `.getBool(key)` / `.setBool(key, value)` — used by onboarding (Task 8) and app routing (Task 7).

- [ ] **Step 1: Write the failing test for the UserProfile repo**

```typescript
// src/db/userProfileRepo.test.ts
import { createInMemoryStore } from '@/db/inMemoryStore';
import { createUserProfileRepo, type ProfileRow } from '@/db/userProfileRepo';

describe('userProfileRepo', () => {
  it('returns undefined when no profile has been saved yet', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());
    expect(repo.get()).toBeUndefined();
  });

  it('saves a profile and reads it back with restrictions as a real array', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());

    repo.save({
      lastPeriodStart: '2026-07-20',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      dietaryRestrictions: ['vegetarian', 'gluten_free'],
      intensity: 'medium',
      cycleLengthIsEstimate: false,
    });

    const profile = repo.get();
    expect(profile?.dietaryRestrictions).toEqual(['vegetarian', 'gluten_free']);
    expect(profile?.avgCycleLength).toBe(28);
  });

  it('overwrites the existing profile on a second save instead of creating a new one', () => {
    const repo = createUserProfileRepo(createInMemoryStore<ProfileRow>());
    repo.save({
      lastPeriodStart: '2026-07-01',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      dietaryRestrictions: [],
      intensity: 'light',
      cycleLengthIsEstimate: true,
    });
    repo.save({
      lastPeriodStart: '2026-07-20',
      avgCycleLength: 30,
      avgPeriodLength: 6,
      dietaryRestrictions: ['dairy_free'],
      intensity: 'super',
      cycleLengthIsEstimate: false,
    });

    const profile = repo.get();
    expect(profile?.avgCycleLength).toBe(30);
    expect(profile?.dietaryRestrictions).toEqual(['dairy_free']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/db/userProfileRepo.test.ts`
Expected: FAIL with "Cannot find module '@/db/userProfileRepo'"

- [ ] **Step 3: Implement `src/db/userProfileRepo.ts`**

```typescript
import type { Store } from '@/db/types';
import type { UserProfile } from '@/types';

// SQLite has no array column, so dietaryRestrictions is stored as a JSON
// string in the row and parsed back into a real array here. Exported so
// tests can create a correctly-typed InMemoryStore<ProfileRow> directly,
// instead of casting through `any`/`never`.
export type ProfileRow = Omit<UserProfile, 'dietaryRestrictions'> & { dietaryRestrictions: string };

export function createUserProfileRepo(store: Store<ProfileRow>) {
  return {
    get(): UserProfile | undefined {
      const [row] = store.getAll();
      if (!row) return undefined;
      return { ...row, dietaryRestrictions: JSON.parse(row.dietaryRestrictions) };
    },
    save(data: Omit<UserProfile, 'id'>): UserProfile {
      const existing = store.getAll()[0];
      const row = { ...data, dietaryRestrictions: JSON.stringify(data.dietaryRestrictions) };
      if (existing) {
        store.update(existing.id, row);
        return { ...data, id: existing.id };
      }
      const inserted = store.insert(row);
      return { ...data, id: inserted.id };
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/db/userProfileRepo.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing test for the Settings repo**

```typescript
// src/db/settingsRepo.test.ts
import { createInMemoryStore } from '@/db/inMemoryStore';
import { createSettingsRepo, type SettingRow } from '@/db/settingsRepo';

describe('settingsRepo', () => {
  it('returns false for a boolean flag that was never set', () => {
    const repo = createSettingsRepo(createInMemoryStore<SettingRow>());
    expect(repo.getBool('disclaimer_accepted')).toBe(false);
  });

  it('persists a boolean flag and reads it back as true', () => {
    const repo = createSettingsRepo(createInMemoryStore<SettingRow>());
    repo.setBool('disclaimer_accepted', true);
    expect(repo.getBool('disclaimer_accepted')).toBe(true);
  });

  it('overwrites an existing flag rather than duplicating it', () => {
    const repo = createSettingsRepo(createInMemoryStore<SettingRow>());
    repo.setBool('disclaimer_accepted', true);
    repo.setBool('disclaimer_accepted', false);
    expect(repo.getBool('disclaimer_accepted')).toBe(false);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- src/db/settingsRepo.test.ts`
Expected: FAIL with "Cannot find module '@/db/settingsRepo'"

- [ ] **Step 7: Implement `src/db/settingsRepo.ts`**

```typescript
import type { Store } from '@/db/types';

export interface SettingRow { id: number; key: string; value: string }

export function createSettingsRepo(store: Store<SettingRow>) {
  return {
    getBool(key: string): boolean {
      const row = store.getAll().find((r) => r.key === key);
      return row?.value === 'true';
    },
    setBool(key: string, value: boolean): void {
      const existing = store.getAll().find((r) => r.key === key);
      if (existing) {
        store.update(existing.id, { value: String(value) });
      } else {
        store.insert({ key, value: String(value) });
      }
    },
  };
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- src/db/settingsRepo.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add src/db/userProfileRepo.ts src/db/userProfileRepo.test.ts src/db/settingsRepo.ts src/db/settingsRepo.test.ts
git commit -m "feat: add UserProfile and Settings repositories"
```

---

## Task 4: CycleEntry and SymptomLog Repositories + App DB Wiring

**Files:**
- Create: `src/db/cycleEntryRepo.ts`
- Create: `src/db/symptomLogRepo.ts`
- Create: `src/db/client.ts`
- Test: `src/db/cycleEntryRepo.test.ts`
- Test: `src/db/symptomLogRepo.test.ts`

**Interfaces:**
- Consumes: `Store<T>`, `createSqliteStore`, `createInMemoryStore`, `CREATE_TABLES_SQL` and column lists (Task 2), `CycleEntry`/`SymptomLog` types (Task 1).
- Produces: `createCycleEntryRepo(store)` with `.add(startDate)` / `.getAll()`, `createSymptomLogRepo(store)` with `.add(date, tags)` / `.getAll()`, and `getRepositories()` — the single wiring point every screen imports to reach real, persisted data.

- [ ] **Step 1: Write the failing test for the CycleEntry repo**

```typescript
// src/db/cycleEntryRepo.test.ts
import { createInMemoryStore } from '@/db/inMemoryStore';
import { createCycleEntryRepo } from '@/db/cycleEntryRepo';
import type { CycleEntry } from '@/types';

describe('cycleEntryRepo', () => {
  it('starts empty', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    expect(repo.getAll()).toEqual([]);
  });

  it('adds an entry and returns it with the given start date', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    const entry = repo.add('2026-07-20');
    expect(entry.startDate).toBe('2026-07-20');
    expect(repo.getAll()).toHaveLength(1);
  });

  it('accumulates multiple entries across cycles', () => {
    const repo = createCycleEntryRepo(createInMemoryStore<CycleEntry>());
    repo.add('2026-06-01');
    repo.add('2026-06-29');
    repo.add('2026-07-27');
    expect(repo.getAll()).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/db/cycleEntryRepo.test.ts`
Expected: FAIL with "Cannot find module '@/db/cycleEntryRepo'"

- [ ] **Step 3: Implement `src/db/cycleEntryRepo.ts`**

```typescript
import type { Store } from '@/db/types';
import type { CycleEntry } from '@/types';

export function createCycleEntryRepo(store: Store<CycleEntry>) {
  return {
    add(startDate: string): CycleEntry {
      return store.insert({ startDate });
    },
    getAll(): CycleEntry[] {
      return store.getAll();
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/db/cycleEntryRepo.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing test for the SymptomLog repo**

```typescript
// src/db/symptomLogRepo.test.ts
import { createInMemoryStore } from '@/db/inMemoryStore';
import { createSymptomLogRepo, type LogRow } from '@/db/symptomLogRepo';

describe('symptomLogRepo', () => {
  it('starts empty', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    expect(repo.getAll()).toEqual([]);
  });

  it('adds a log entry and stores tags as a real array on read', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    repo.add('2026-07-25', ['bloating', 'sugar_craving']);

    const [log] = repo.getAll();
    expect(log.date).toBe('2026-07-25');
    expect(log.tags).toEqual(['bloating', 'sugar_craving']);
  });

  it('keeps separate entries for different days', () => {
    const repo = createSymptomLogRepo(createInMemoryStore<LogRow>());
    repo.add('2026-07-24', ['cramps']);
    repo.add('2026-07-25', ['bloating']);
    expect(repo.getAll()).toHaveLength(2);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- src/db/symptomLogRepo.test.ts`
Expected: FAIL with "Cannot find module '@/db/symptomLogRepo'"

- [ ] **Step 7: Implement `src/db/symptomLogRepo.ts`**

```typescript
import type { Store } from '@/db/types';
import type { SymptomLog, SymptomTag } from '@/types';

export type LogRow = Omit<SymptomLog, 'tags'> & { tags: string };

export function createSymptomLogRepo(store: Store<LogRow>) {
  return {
    add(date: string, tags: SymptomTag[]): SymptomLog {
      const row = store.insert({ date, tags: JSON.stringify(tags) });
      return { ...row, tags };
    },
    getAll(): SymptomLog[] {
      return store.getAll().map((row) => ({ ...row, tags: JSON.parse(row.tags) }));
    },
  };
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- src/db/symptomLogRepo.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 9: Write `src/db/client.ts` — wires real SQLite into the repos above (no unit test: this is pure composition, verified manually on-device in Task 8)**

```typescript
import * as SQLite from 'expo-sqlite';
import { createSqliteStore } from '@/db/sqliteStore';
import {
  CREATE_TABLES_SQL,
  USER_PROFILE_COLUMNS,
  CYCLE_ENTRY_COLUMNS,
  SYMPTOM_LOG_COLUMNS,
  SETTINGS_COLUMNS,
} from '@/db/schema';
import { createUserProfileRepo, type ProfileRow } from '@/db/userProfileRepo';
import { createCycleEntryRepo } from '@/db/cycleEntryRepo';
import { createSymptomLogRepo, type LogRow } from '@/db/symptomLogRepo';
import { createSettingsRepo, type SettingRow } from '@/db/settingsRepo';
import type { CycleEntry } from '@/types';

let cached: ReturnType<typeof buildRepositories> | null = null;

function buildRepositories() {
  const db = SQLite.openDatabaseSync('cyclesync.db');
  db.execSync(CREATE_TABLES_SQL);

  return {
    userProfile: createUserProfileRepo(createSqliteStore<ProfileRow>(db, 'user_profile', USER_PROFILE_COLUMNS)),
    cycleEntry: createCycleEntryRepo(createSqliteStore<CycleEntry>(db, 'cycle_entry', CYCLE_ENTRY_COLUMNS)),
    symptomLog: createSymptomLogRepo(createSqliteStore<LogRow>(db, 'symptom_log', SYMPTOM_LOG_COLUMNS)),
    settings: createSettingsRepo(createSqliteStore<SettingRow>(db, 'settings', SETTINGS_COLUMNS)),
  };
}

export function getRepositories() {
  if (!cached) cached = buildRepositories();
  return cached;
}
```

- [ ] **Step 10: Commit**

```bash
git add src/db/cycleEntryRepo.ts src/db/cycleEntryRepo.test.ts src/db/symptomLogRepo.ts src/db/symptomLogRepo.test.ts src/db/client.ts
git commit -m "feat: add CycleEntry/SymptomLog repositories and wire real SQLite client"
```

---

## Task 5: Phase Engine

**Files:**
- Create: `src/engine/phaseEngine.ts`
- Test: `src/engine/phaseEngine.test.ts`

**Interfaces:**
- Consumes: `UserProfile`, `CycleEntry` types (Task 1).
- Produces: `calculatePhase(profile, cycleHistory, today?): PhaseResult` where `PhaseResult = { cycleDay: number; phase: Phase; isApproximate: boolean }` — used by the Daily Dashboard (Task 9) and Pattern Recognition (Task 13).

- [ ] **Step 1: Write the failing tests**

```typescript
// src/engine/phaseEngine.test.ts
import { calculatePhase } from '@/engine/phaseEngine';
import type { CycleEntry, UserProfile } from '@/types';

const baseProfile: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-07-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

describe('calculatePhase', () => {
  it('is day 1, menstrual phase, on the first day of the period', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-01'));
    expect(result).toEqual({ cycleDay: 1, phase: 'menstrual', isApproximate: false });
  });

  it('is follicular phase on day 8 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-08'));
    expect(result.cycleDay).toBe(8);
    expect(result.phase).toBe('follicular');
  });

  it('is ovulatory phase on day 14 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-14'));
    expect(result.phase).toBe('ovulatory');
  });

  it('is luteal phase on day 21 of a 28-day cycle', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-21'));
    expect(result.cycleDay).toBe(21);
    expect(result.phase).toBe('luteal');
  });

  it('wraps to day 1 of the next cycle after avgCycleLength days', () => {
    const result = calculatePhase(baseProfile, [], new Date('2026-07-29'));
    expect(result.cycleDay).toBe(1);
    expect(result.phase).toBe('menstrual');
  });

  it('uses the rolling average of the last cycles once 3+ are logged, not the onboarding guess', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-05-01' }, // 30-day gap
      { id: 3, startDate: '2026-05-31' }, // 30-day gap
    ];
    // 30 days after the most recent start (2026-05-31) is 2026-06-30 -> day 30 wraps to day 1
    // of a fresh 30-day cycle, i.e. still menstrual, not day 30 of a 28-day cycle.
    const result = calculatePhase(baseProfile, history, new Date('2026-06-30'));
    expect(result.cycleDay).toBe(1);
    expect(result.phase).toBe('menstrual');
  });

  it('flags isApproximate when the last cycles vary by more than 7 days', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-03-01' },
      { id: 2, startDate: '2026-04-01' }, // 31-day gap
      { id: 3, startDate: '2026-04-15' }, // 14-day gap -> spread of 17 days
    ];
    const result = calculatePhase(baseProfile, history, new Date('2026-04-20'));
    expect(result.isApproximate).toBe(true);
  });

  it('flags isApproximate when the user was not sure of her cycle length and no real history exists yet', () => {
    const estimateProfile = { ...baseProfile, cycleLengthIsEstimate: true };
    const result = calculatePhase(estimateProfile, [], new Date('2026-07-01'));
    expect(result.isApproximate).toBe(true);
  });

  it('does not flag isApproximate for a regular history even if the onboarding guess was uncertain', () => {
    const estimateProfile = { ...baseProfile, cycleLengthIsEstimate: true };
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
      { id: 3, startDate: '2026-05-27' },
    ];
    const result = calculatePhase(estimateProfile, history, new Date('2026-05-28'));
    expect(result.isApproximate).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/engine/phaseEngine.test.ts`
Expected: FAIL with "Cannot find module '@/engine/phaseEngine'"

- [ ] **Step 3: Implement `src/engine/phaseEngine.ts`**

```typescript
import type { CycleEntry, Phase, UserProfile } from '@/types';

export interface PhaseResult {
  cycleDay: number;
  phase: Phase;
  isApproximate: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
// Share of the non-menstrual portion of a default 28-day/5-day-period cycle
// (23 remaining days) occupied by each later phase — used to scale phase
// boundaries proportionally when the user's real cycle length differs.
const REMAINING_PHASE_RATIOS = { follicular: 7 / 23, ovulatory: 3 / 23 };

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
}

function recentGaps(history: CycleEntry[]): number[] {
  const sorted = [...history].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const recent = sorted.slice(-6);
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    gaps.push(daysBetween(new Date(recent[i - 1].startDate), new Date(recent[i].startDate)));
  }
  return gaps;
}

export function calculatePhase(
  profile: UserProfile,
  cycleHistory: CycleEntry[],
  today: Date = new Date()
): PhaseResult {
  const gaps = cycleHistory.length >= 3 ? recentGaps(cycleHistory) : [];
  const computedAvg =
    gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null;
  const effectiveCycleLength = computedAvg ?? profile.avgCycleLength;

  const sortedHistory = [...cycleHistory].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const mostRecentStart = sortedHistory[0]?.startDate ?? profile.lastPeriodStart;

  const daysSinceStart = daysBetween(new Date(mostRecentStart), today);
  const cycleDay =
    (((daysSinceStart % effectiveCycleLength) + effectiveCycleLength) % effectiveCycleLength) + 1;

  const menstrualEnd = profile.avgPeriodLength;
  const remaining = Math.max(effectiveCycleLength - menstrualEnd, 1);
  const follicularEnd = menstrualEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.follicular);
  const ovulatoryEnd = follicularEnd + Math.round(remaining * REMAINING_PHASE_RATIOS.ovulatory);

  let phase: Phase;
  if (cycleDay <= menstrualEnd) phase = 'menstrual';
  else if (cycleDay <= follicularEnd) phase = 'follicular';
  else if (cycleDay <= ovulatoryEnd) phase = 'ovulatory';
  else phase = 'luteal';

  const isIrregular = gaps.length > 0 && Math.max(...gaps) - Math.min(...gaps) > 7;
  const isApproximate = isIrregular || (computedAvg === null && profile.cycleLengthIsEstimate);

  return { cycleDay, phase, isApproximate };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/engine/phaseEngine.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/engine/phaseEngine.ts src/engine/phaseEngine.test.ts
git commit -m "feat: add adaptive phase engine with irregular-cycle soft mode"
```

---

## Task 6: Content / Rules Engine

**Files:**
- Create: `src/content/knowledgeBase.ts`
- Create: `src/content/rulesEngine.ts`
- Test: `src/content/rulesEngine.test.ts`

**Interfaces:**
- Consumes: `Phase`, `SymptomTag` types (Task 1).
- Produces: `getRecommendation(phase, symptoms): PlateRecommendation` — used by the Plate Builder (Task 11).

- [ ] **Step 1: Write `src/content/knowledgeBase.ts` (pure data — every default option is gluten-free, cow-dairy-free, and free of added sugar per spec §4.5)**

```typescript
import type { Phase, SymptomTag } from '@/types';

export interface FoodOption {
  id: string;
  emoji: string;
  name: string;
  isLocal: boolean; // true = доступный локальный продукт, false = международная альтернатива
}

export type FoodCategoryKey = 'protein' | 'carbs' | 'fats' | 'tea_spice';

export interface PhaseContent {
  focusNutrients: string[];
  explanation: string;
  categories: Record<FoodCategoryKey, FoodOption[]>;
}

export const KNOWLEDGE_BASE: Record<Phase, PhaseContent> = {
  menstrual: {
    focusNutrients: ['Железо', 'Омега-3'],
    explanation:
      'В менструальную фазу организм теряет железо и справляется с лёгким воспалением — важно восполнять запасы и поддерживать тепло.',
    categories: {
      protein: [
        { id: 'beef_liver', emoji: '🥩', name: 'Говяжья печень', isLocal: true },
        { id: 'lentils', emoji: '🫘', name: 'Чечевица', isLocal: true },
        { id: 'salmon', emoji: '🐟', name: 'Лосось', isLocal: false },
      ],
      carbs: [
        { id: 'buckwheat_m', emoji: '🌾', name: 'Гречка', isLocal: true },
        { id: 'quinoa_m', emoji: '🍚', name: 'Киноа', isLocal: false },
      ],
      fats: [
        { id: 'sunflower_seeds', emoji: '🌻', name: 'Семечки подсолнечника', isLocal: true },
        { id: 'avocado_m', emoji: '🥑', name: 'Авокадо', isLocal: false },
      ],
      tea_spice: [
        { id: 'ginger_tea', emoji: '🫚', name: 'Имбирный чай', isLocal: true },
        { id: 'turmeric_tea', emoji: '🟡', name: 'Чай с куркумой', isLocal: false },
      ],
    },
  },
  follicular: {
    focusNutrients: ['B-витамины', 'Клетчатка'],
    explanation:
      'Эстроген растёт, энергия и метаболизм ускоряются — организму хорошо с лёгкими белками и свежими овощами.',
    categories: {
      protein: [
        { id: 'eggs', emoji: '🥚', name: 'Яйца', isLocal: true },
        { id: 'chicken', emoji: '🍗', name: 'Курица', isLocal: true },
        { id: 'tofu', emoji: '🧊', name: 'Тофу', isLocal: false },
      ],
      carbs: [
        { id: 'oats', emoji: '🌾', name: 'Овсянка', isLocal: true },
        { id: 'quinoa_f', emoji: '🍚', name: 'Киноа', isLocal: false },
      ],
      fats: [
        { id: 'flaxseed', emoji: '🌱', name: 'Семена льна', isLocal: true },
        { id: 'walnuts', emoji: '🌰', name: 'Грецкие орехи', isLocal: true },
      ],
      tea_spice: [
        { id: 'green_tea', emoji: '🍵', name: 'Зелёный чай', isLocal: false },
        { id: 'mint_tea', emoji: '🌿', name: 'Мятный чай', isLocal: true },
      ],
    },
  },
  ovulatory: {
    focusNutrients: ['Клетчатка', 'Антиоксиданты'],
    explanation:
      'Пик эстрогена — печени нужна поддержка клетчаткой и зеленью, чтобы вывести его избыток.',
    categories: {
      protein: [
        { id: 'white_fish', emoji: '🐟', name: 'Белая рыба', isLocal: true },
        { id: 'beans', emoji: '🫘', name: 'Фасоль', isLocal: true },
      ],
      carbs: [
        { id: 'beets', emoji: '🍠', name: 'Свёкла', isLocal: true },
        { id: 'sweet_potato_o', emoji: '🍠', name: 'Батат', isLocal: false },
      ],
      fats: [
        { id: 'olive_oil', emoji: '🫒', name: 'Оливковое масло', isLocal: false },
        { id: 'pumpkin_seeds_o', emoji: '🎃', name: 'Тыквенные семечки', isLocal: true },
      ],
      tea_spice: [
        { id: 'dandelion_tea', emoji: '🌼', name: 'Чай из одуванчика', isLocal: true },
        { id: 'nettle_tea', emoji: '🌿', name: 'Чай из крапивы', isLocal: true },
      ],
    },
  },
  luteal: {
    focusNutrients: ['Магний', 'B6'],
    explanation:
      'Прогестерон требует больше энергии, а магний расходуется быстрее — отсюда тяга к сладкому.',
    categories: {
      protein: [
        { id: 'turkey', emoji: '🦃', name: 'Индейка', isLocal: true },
        { id: 'chickpeas', emoji: '🧆', name: 'Нут', isLocal: true },
      ],
      carbs: [
        { id: 'buckwheat_l', emoji: '🌾', name: 'Гречка', isLocal: true },
        { id: 'sweet_potato_l', emoji: '🥔', name: 'Батат', isLocal: false },
      ],
      fats: [
        { id: 'pumpkin_seeds_l', emoji: '🎃', name: 'Тыквенные семечки', isLocal: true },
        { id: 'avocado_l', emoji: '🥑', name: 'Авокадо', isLocal: false },
      ],
      tea_spice: [
        { id: 'chamomile_tea', emoji: '🌼', name: 'Ромашковый чай', isLocal: true },
        { id: 'cinnamon_tea', emoji: '🍂', name: 'Чай с корицей', isLocal: true },
      ],
    },
  },
};

export const SYMPTOM_NOTES: Partial<Record<SymptomTag, string>> = {
  sugar_craving: 'Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.',
  bloating: 'Вздутие часто связано с замедлением ЖКТ в этой фазе — тёплая, тушёная еда сегодня комфортнее сырой.',
  cramps: 'При спазмах организму особенно нужны магний и омега-3 — они мягко снижают простагландины.',
};
```

- [ ] **Step 2: Write the failing test for the rules engine**

```typescript
// src/content/rulesEngine.test.ts
import { getRecommendation } from '@/content/rulesEngine';

describe('getRecommendation', () => {
  it('returns the luteal focus nutrients and explanation with no symptom notes when no symptoms are logged', () => {
    const rec = getRecommendation('luteal', []);
    expect(rec.focusNutrients).toEqual(['Магний', 'B6']);
    expect(rec.symptomNotes).toEqual([]);
  });

  it('returns all four categories in a stable order with 2+ options each', () => {
    const rec = getRecommendation('menstrual', []);
    expect(rec.categories.map((c) => c.key)).toEqual(['protein', 'carbs', 'fats', 'tea_spice']);
    rec.categories.forEach((c) => expect(c.options.length).toBeGreaterThanOrEqual(2));
  });

  it('includes a symptom note for a symptom that has one', () => {
    const rec = getRecommendation('luteal', ['sugar_craving']);
    expect(rec.symptomNotes).toEqual([
      'Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.',
    ]);
  });

  it('silently skips symptoms that have no note defined, without adding undefined', () => {
    const rec = getRecommendation('luteal', ['acne']);
    expect(rec.symptomNotes).toEqual([]);
  });

  it('every category mixes at least one local and offers a real alternative', () => {
    const rec = getRecommendation('follicular', []);
    const proteinOptions = rec.categories.find((c) => c.key === 'protein')!.options;
    expect(proteinOptions.some((o) => o.isLocal)).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- src/content/rulesEngine.test.ts`
Expected: FAIL with "Cannot find module '@/content/rulesEngine'"

- [ ] **Step 4: Implement `src/content/rulesEngine.ts`**

```typescript
import type { Phase, SymptomTag } from '@/types';
import { KNOWLEDGE_BASE, SYMPTOM_NOTES, type FoodCategoryKey, type FoodOption } from '@/content/knowledgeBase';

export interface PlateRecommendation {
  focusNutrients: string[];
  explanation: string;
  symptomNotes: string[];
  categories: { key: FoodCategoryKey; options: FoodOption[] }[];
}

const CATEGORY_ORDER: FoodCategoryKey[] = ['protein', 'carbs', 'fats', 'tea_spice'];

export function getRecommendation(phase: Phase, symptoms: SymptomTag[]): PlateRecommendation {
  const content = KNOWLEDGE_BASE[phase];
  const symptomNotes = symptoms
    .map((tag) => SYMPTOM_NOTES[tag])
    .filter((note): note is string => Boolean(note));

  return {
    focusNutrients: content.focusNutrients,
    explanation: content.explanation,
    symptomNotes,
    categories: CATEGORY_ORDER.map((key) => ({ key, options: content.categories[key] })),
  };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/content/rulesEngine.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/content/knowledgeBase.ts src/content/rulesEngine.ts src/content/rulesEngine.test.ts
git commit -m "feat: add food/tea knowledge base and rules engine"
```

---

## Task 7: Legal Disclaimer Gate + App Routing Logic

**Files:**
- Create: `src/components/DisclaimerGate.tsx`
- Create: `src/navigation/getInitialRoute.ts`
- Test: `src/components/DisclaimerGate.test.tsx`
- Test: `src/navigation/getInitialRoute.test.ts`

**Interfaces:**
- Consumes: nothing external.
- Produces: `<DisclaimerGate onAccept={...} />` and `getInitialRoute(disclaimerAccepted, hasProfile): Route` — used by `app/_layout.tsx` and `app/index.tsx` (Task 8).

- [ ] **Step 1: Write the failing test for `DisclaimerGate`**

```typescript
// src/components/DisclaimerGate.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { DisclaimerGate } from '@/components/DisclaimerGate';

describe('DisclaimerGate', () => {
  it('shows the disclaimer text', () => {
    render(<DisclaimerGate onAccept={() => {}} />);
    expect(screen.getByTestId('disclaimer-text')).toBeTruthy();
  });

  it('calls onAccept exactly once when the button is pressed', () => {
    const onAccept = jest.fn();
    render(<DisclaimerGate onAccept={onAccept} />);
    fireEvent.press(screen.getByTestId('accept-button'));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/DisclaimerGate.test.tsx`
Expected: FAIL with "Cannot find module '@/components/DisclaimerGate'"

- [ ] **Step 3: Implement `src/components/DisclaimerGate.tsx`**

```tsx
import { View, Text, Pressable } from 'react-native';

interface DisclaimerGateProps {
  onAccept: () => void;
}

const DISCLAIMER_TEXT =
  'Приложение носит исключительно информационный и ознакомительный характер и не является медицинской консультацией, диагностикой или назначением лечения. Всегда консультируйтесь с врачом перед изменением рациона.';

export function DisclaimerGate({ onAccept }: DisclaimerGateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-white">
      <Text className="text-lg font-semibold mb-4 text-center">Прежде чем начать</Text>
      <Text testID="disclaimer-text" className="text-base text-gray-700 mb-8 text-center">
        {DISCLAIMER_TEXT}
      </Text>
      <Pressable testID="accept-button" onPress={onAccept} className="bg-emerald-500 rounded-full px-8 py-3">
        <Text className="text-white font-semibold">Принять и продолжить</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/DisclaimerGate.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing test for `getInitialRoute`**

```typescript
// src/navigation/getInitialRoute.test.ts
import { getInitialRoute } from '@/navigation/getInitialRoute';

describe('getInitialRoute', () => {
  it('routes to the disclaimer screen first if not yet accepted', () => {
    expect(getInitialRoute(false, false)).toBe('/onboarding/disclaimer');
    expect(getInitialRoute(false, true)).toBe('/onboarding/disclaimer');
  });

  it('routes to cycle-params if disclaimer accepted but no profile saved', () => {
    expect(getInitialRoute(true, false)).toBe('/onboarding/cycle-params');
  });

  it('routes straight to the dashboard once both are done', () => {
    expect(getInitialRoute(true, true)).toBe('/dashboard');
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- src/navigation/getInitialRoute.test.ts`
Expected: FAIL with "Cannot find module '@/navigation/getInitialRoute'"

- [ ] **Step 7: Implement `src/navigation/getInitialRoute.ts`**

```typescript
export type Route = '/onboarding/disclaimer' | '/onboarding/cycle-params' | '/dashboard';

export function getInitialRoute(disclaimerAccepted: boolean, hasProfile: boolean): Route {
  if (!disclaimerAccepted) return '/onboarding/disclaimer';
  if (!hasProfile) return '/onboarding/cycle-params';
  return '/dashboard';
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- src/navigation/getInitialRoute.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add src/components/DisclaimerGate.tsx src/components/DisclaimerGate.test.tsx src/navigation/getInitialRoute.ts src/navigation/getInitialRoute.test.ts
git commit -m "feat: add legal disclaimer gate and initial-route logic"
```

---

## Task 8: Onboarding Flow (5 screens)

**Files:**
- Create: `src/components/onboarding/CycleParamsForm.tsx`
- Create: `src/components/onboarding/DietForm.tsx`
- Create: `src/components/onboarding/IntensityForm.tsx`
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`
- Create: `app/onboarding/disclaimer.tsx`
- Create: `app/onboarding/cycle-params.tsx`
- Create: `app/onboarding/diet.tsx`
- Create: `app/onboarding/intensity.tsx`
- Create: `app/dashboard.tsx` (placeholder body, filled in by Task 9)
- Test: `src/components/onboarding/CycleParamsForm.test.tsx`
- Test: `src/components/onboarding/DietForm.test.tsx`
- Test: `src/components/onboarding/IntensityForm.test.tsx`

**Interfaces:**
- Consumes: `getRepositories()` (Task 4), `getInitialRoute`, `DisclaimerGate` (Task 7), `UserProfile`/`Intensity` types (Task 1).
- Produces: a working onboarding flow that ends with a saved `UserProfile`; `app/dashboard.tsx` route target for Task 9 to fill in.

- [ ] **Step 1: Write the failing test for `CycleParamsForm`**

```typescript
// src/components/onboarding/CycleParamsForm.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { CycleParamsForm } from '@/components/onboarding/CycleParamsForm';

describe('CycleParamsForm', () => {
  it('defaults to 28/5 days and submits with cycleLengthIsEstimate=false when the user enters real numbers', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('days-since-start-3'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-22',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: false,
    });
  });

  it('submits with cycleLengthIsEstimate=true and the 28/5 defaults when "не уверена точно" is selected', () => {
    const onSubmit = jest.fn();
    render(<CycleParamsForm onSubmit={onSubmit} today={new Date('2026-07-25')} />);

    fireEvent.press(screen.getByTestId('days-since-start-0'));
    fireEvent.press(screen.getByTestId('not-sure-toggle'));
    fireEvent.press(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      lastPeriodStart: '2026-07-25',
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: true,
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/onboarding/CycleParamsForm.test.tsx`
Expected: FAIL with "Cannot find module '@/components/onboarding/CycleParamsForm'"

- [ ] **Step 3: Implement `src/components/onboarding/CycleParamsForm.tsx`**

```tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export interface CycleParamsData {
  lastPeriodStart: string;
  avgCycleLength: number;
  avgPeriodLength: number;
  cycleLengthIsEstimate: boolean;
}

interface CycleParamsFormProps {
  onSubmit: (data: CycleParamsData) => void;
  today?: Date;
}

const DAYS_SINCE_OPTIONS = [0, 1, 2, 3, 4, 5, 6];
const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Subtracts whole days using epoch milliseconds rather than
// Date.setDate()/getDate() (which operate in the device's local timezone).
// Mixing that with the UTC-based toISOString() below can shift the computed
// date by a day depending on the device's timezone offset — this keeps the
// whole calculation consistently UTC-based instead.
function subtractDaysUtc(date: Date, days: number): Date {
  return new Date(date.getTime() - days * DAY_MS);
}

export function CycleParamsForm({ onSubmit, today = new Date() }: CycleParamsFormProps) {
  const [daysSince, setDaysSince] = useState(0);
  const [notSure, setNotSure] = useState(false);

  function handleSubmit() {
    const start = subtractDaysUtc(today, daysSince);
    onSubmit({
      lastPeriodStart: toIsoDate(start),
      avgCycleLength: 28,
      avgPeriodLength: 5,
      cycleLengthIsEstimate: notSure,
    });
  }

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">Когда начались последние месячные?</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {DAYS_SINCE_OPTIONS.map((n) => (
          <Pressable
            key={n}
            testID={`days-since-start-${n}`}
            onPress={() => setDaysSince(n)}
            className={`px-4 py-2 rounded-full ${daysSince === n ? 'bg-emerald-500' : 'bg-gray-100'}`}
          >
            <Text className={daysSince === n ? 'text-white' : 'text-gray-700'}>
              {n === 0 ? 'Сегодня' : `${n} дн. назад`}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        testID="not-sure-toggle"
        onPress={() => setNotSure((v) => !v)}
        className={`px-4 py-2 rounded-full self-start mb-8 ${notSure ? 'bg-emerald-500' : 'bg-gray-100'}`}
      >
        <Text className={notSure ? 'text-white' : 'text-gray-700'}>Не уверена точно</Text>
      </Pressable>
      <Pressable testID="submit-button" onPress={handleSubmit} className="bg-emerald-500 rounded-full px-8 py-3 self-start">
        <Text className="text-white font-semibold">Далее</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/onboarding/CycleParamsForm.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Write the failing test for `DietForm`**

```typescript
// src/components/onboarding/DietForm.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { DietForm } from '@/components/onboarding/DietForm';

describe('DietForm', () => {
  it('submits an empty list when nothing is selected (omnivore)', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith([]);
  });

  it('submits the selected restrictions', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('option-gluten_free'));
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith(['vegetarian', 'gluten_free']);
  });

  it('toggles a selection off when pressed twice', () => {
    const onSubmit = jest.fn();
    render(<DietForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('option-vegetarian'));
    fireEvent.press(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledWith([]);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- src/components/onboarding/DietForm.test.tsx`
Expected: FAIL with "Cannot find module '@/components/onboarding/DietForm'"

- [ ] **Step 7: Implement `src/components/onboarding/DietForm.tsx`**

```tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

interface DietFormProps {
  onSubmit: (restrictions: string[]) => void;
}

const OPTIONS: { id: string; label: string }[] = [
  { id: 'vegetarian', label: 'Вегетарианство' },
  { id: 'gluten_free', label: 'Без глютена' },
  { id: 'dairy_free', label: 'Без молочных продуктов' },
];

export function DietForm({ onSubmit }: DietFormProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">Есть ли пищевые ограничения?</Text>
      <View className="gap-2 mb-8">
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            testID={`option-${opt.id}`}
            onPress={() => toggle(opt.id)}
            className={`px-4 py-2 rounded-full self-start ${selected.includes(opt.id) ? 'bg-emerald-500' : 'bg-gray-100'}`}
          >
            <Text className={selected.includes(opt.id) ? 'text-white' : 'text-gray-700'}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="submit-button" onPress={() => onSubmit(selected)} className="bg-emerald-500 rounded-full px-8 py-3 self-start">
        <Text className="text-white font-semibold">Далее</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- src/components/onboarding/DietForm.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 9: Write the failing test for `IntensityForm`**

```typescript
// src/components/onboarding/IntensityForm.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { IntensityForm } from '@/components/onboarding/IntensityForm';

describe('IntensityForm', () => {
  it('submits "medium" when that option is pressed', () => {
    const onSubmit = jest.fn();
    render(<IntensityForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-medium'));
    expect(onSubmit).toHaveBeenCalledWith('medium');
  });

  it('submits "light" and "super" for the other two options', () => {
    const onSubmit = jest.fn();
    render(<IntensityForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('option-light'));
    expect(onSubmit).toHaveBeenCalledWith('light');
  });
});
```

- [ ] **Step 10: Run the test to verify it fails**

Run: `npm test -- src/components/onboarding/IntensityForm.test.tsx`
Expected: FAIL with "Cannot find module '@/components/onboarding/IntensityForm'"

- [ ] **Step 11: Implement `src/components/onboarding/IntensityForm.tsx`**

```tsx
import { View, Text, Pressable } from 'react-native';
import type { Intensity } from '@/types';

interface IntensityFormProps {
  onSubmit: (intensity: Intensity) => void;
}

const OPTIONS: { id: Intensity; label: string; hint: string }[] = [
  { id: 'light', label: '🐣 Light', hint: 'Сохранить привычки, минимизировать вред' },
  { id: 'medium', label: '🌿 Medium', hint: 'Мягкие постепенные замены' },
  { id: 'super', label: '⚡ Super', hint: 'Максимальная перестройка' },
];

export function IntensityForm({ onSubmit }: IntensityFormProps) {
  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-lg font-semibold mb-4">В каком темпе хочешь заботиться о себе?</Text>
      <View className="gap-3">
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            testID={`option-${opt.id}`}
            onPress={() => onSubmit(opt.id)}
            className="px-4 py-3 rounded-2xl bg-gray-100"
          >
            <Text className="font-semibold">{opt.label}</Text>
            <Text className="text-gray-600 text-sm">{opt.hint}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npm test -- src/components/onboarding/IntensityForm.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 13: Wire the route files (no automated test — verified manually on-device in Step 14)**

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

```tsx
// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { getRepositories } from '@/db/client';
import { getInitialRoute } from '@/navigation/getInitialRoute';

export default function Index() {
  useEffect(() => {
    const repos = getRepositories();
    const disclaimerAccepted = repos.settings.getBool('disclaimer_accepted');
    const hasProfile = Boolean(repos.userProfile.get());
    router.replace(getInitialRoute(disclaimerAccepted, hasProfile));
  }, []);
  return null;
}
```

```tsx
// app/onboarding/disclaimer.tsx
import { router } from 'expo-router';
import { DisclaimerGate } from '@/components/DisclaimerGate';
import { getRepositories } from '@/db/client';

export default function DisclaimerScreen() {
  return (
    <DisclaimerGate
      onAccept={() => {
        getRepositories().settings.setBool('disclaimer_accepted', true);
        router.replace('/onboarding/cycle-params');
      }}
    />
  );
}
```

```tsx
// app/onboarding/cycle-params.tsx
import { router } from 'expo-router';
import { CycleParamsForm, type CycleParamsData } from '@/components/onboarding/CycleParamsForm';

export default function CycleParamsScreen() {
  // expo-router serializes route params to strings regardless of input type,
  // and every downstream screen (see intensity.tsx) reads them back as
  // strings — so we convert explicitly here instead of relying on a cast.
  function handleSubmit(data: CycleParamsData) {
    router.push({
      pathname: '/onboarding/diet',
      params: {
        lastPeriodStart: data.lastPeriodStart,
        avgCycleLength: String(data.avgCycleLength),
        avgPeriodLength: String(data.avgPeriodLength),
        cycleLengthIsEstimate: String(data.cycleLengthIsEstimate),
      },
    });
  }
  return <CycleParamsForm onSubmit={handleSubmit} />;
}
```

```tsx
// app/onboarding/diet.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { DietForm } from '@/components/onboarding/DietForm';

export default function DietScreen() {
  const params = useLocalSearchParams();
  function handleSubmit(dietaryRestrictions: string[]) {
    router.push({ pathname: '/onboarding/intensity', params: { ...params, dietaryRestrictions: JSON.stringify(dietaryRestrictions) } });
  }
  return <DietForm onSubmit={handleSubmit} />;
}
```

```tsx
// app/onboarding/intensity.tsx
import { router, useLocalSearchParams } from 'expo-router';
import { IntensityForm } from '@/components/onboarding/IntensityForm';
import { getRepositories } from '@/db/client';
import type { Intensity } from '@/types';

export default function IntensityScreen() {
  const params = useLocalSearchParams<{
    lastPeriodStart: string;
    avgCycleLength: string;
    avgPeriodLength: string;
    cycleLengthIsEstimate: string;
    dietaryRestrictions: string;
  }>();

  function handleSubmit(intensity: Intensity) {
    getRepositories().userProfile.save({
      lastPeriodStart: params.lastPeriodStart,
      avgCycleLength: Number(params.avgCycleLength),
      avgPeriodLength: Number(params.avgPeriodLength),
      dietaryRestrictions: JSON.parse(params.dietaryRestrictions),
      intensity,
      cycleLengthIsEstimate: params.cycleLengthIsEstimate === 'true',
    });
    router.replace('/dashboard');
  }
  return <IntensityForm onSubmit={handleSubmit} />;
}
```

```tsx
// app/dashboard.tsx — placeholder body; Task 9 replaces this with the real dashboard.
import { View, Text } from 'react-native';

export default function DashboardScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Дашборд скоро здесь</Text>
    </View>
  );
}
```

- [ ] **Step 14: Manually verify the full onboarding flow on a device/simulator**

Run: `npm start`, press `i` to launch iOS Simulator.
Expected: app opens on the Disclaimer screen → Accept → pick days since period → Next → pick diet restrictions (or none) → Next → pick intensity → lands on the dashboard placeholder. Force-quit and relaunch the app — it should skip straight to the dashboard placeholder (profile already saved).

- [ ] **Step 15: Commit**

```bash
git add src/components/onboarding app/_layout.tsx app/index.tsx app/onboarding app/dashboard.tsx
git commit -m "feat: add onboarding flow (disclaimer, cycle params, diet, intensity)"
```

---

## Task 9: Daily Dashboard — Phase Card

**Files:**
- Create: `src/components/PhaseCard.tsx`
- Modify: `app/dashboard.tsx`
- Test: `src/components/PhaseCard.test.tsx`

**Interfaces:**
- Consumes: `PhaseResult` (Task 5), `getRepositories()` (Task 4).
- Produces: `<PhaseCard result={...} />` — mounted at the top of `app/dashboard.tsx`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/PhaseCard.test.tsx
import { render, screen } from '@testing-library/react-native';
import { PhaseCard } from '@/components/PhaseCard';

describe('PhaseCard', () => {
  it('shows the exact cycle day and phase name when not approximate', () => {
    render(<PhaseCard result={{ cycleDay: 21, phase: 'luteal', isApproximate: false }} />);
    expect(screen.getByText('День 21 · Лютеиновая фаза')).toBeTruthy();
  });

  it('shows an approximate label when isApproximate is true', () => {
    render(<PhaseCard result={{ cycleDay: 21, phase: 'luteal', isApproximate: true }} />);
    expect(screen.getByText('Ориентировочно лютеиновая фаза')).toBeTruthy();
  });

  it('renders the correct Russian name for each phase', () => {
    const { rerender } = render(<PhaseCard result={{ cycleDay: 1, phase: 'menstrual', isApproximate: false }} />);
    expect(screen.getByText('День 1 · Менструальная фаза')).toBeTruthy();

    rerender(<PhaseCard result={{ cycleDay: 8, phase: 'follicular', isApproximate: false }} />);
    expect(screen.getByText('День 8 · Фолликулярная фаза')).toBeTruthy();

    rerender(<PhaseCard result={{ cycleDay: 14, phase: 'ovulatory', isApproximate: false }} />);
    expect(screen.getByText('День 14 · Овуляторная фаза')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/PhaseCard.test.tsx`
Expected: FAIL with "Cannot find module '@/components/PhaseCard'"

- [ ] **Step 3: Implement `src/components/PhaseCard.tsx`**

```tsx
import { View, Text } from 'react-native';
import type { PhaseResult } from '@/engine/phaseEngine';
import type { Phase } from '@/types';

interface PhaseCardProps {
  result: PhaseResult;
}

const PHASE_NAMES: Record<Phase, string> = {
  menstrual: 'Менструальная фаза',
  follicular: 'Фолликулярная фаза',
  ovulatory: 'Овуляторная фаза',
  luteal: 'Лютеиновая фаза',
};

export function PhaseCard({ result }: PhaseCardProps) {
  const label = result.isApproximate
    ? `Ориентировочно ${PHASE_NAMES[result.phase].toLowerCase()}`
    : `День ${result.cycleDay} · ${PHASE_NAMES[result.phase]}`;

  return (
    <View className="bg-gradient-to-br from-emerald-100 to-orange-100 rounded-3xl p-6 mb-4">
      <Text className="text-xl font-semibold text-gray-800">{label}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/PhaseCard.test.tsx`
Expected: PASS (3 tests, 5 assertions)

- [ ] **Step 5: Wire it into `app/dashboard.tsx`**

```tsx
// app/dashboard.tsx
import { View, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { calculatePhase } from '@/engine/phaseEngine';
import { getRepositories } from '@/db/client';

export default function DashboardScreen() {
  const repos = getRepositories();
  const profile = repos.userProfile.get()!;
  const cycleHistory = repos.cycleEntry.getAll();

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 6: Manually verify on-device**

Run: `npm start`, open iOS Simulator, complete onboarding.
Expected: dashboard shows a card like "День 22 · Лютеиновая фаза" based on the date entered during onboarding.

- [ ] **Step 7: Commit**

```bash
git add src/components/PhaseCard.tsx src/components/PhaseCard.test.tsx app/dashboard.tsx
git commit -m "feat: add phase card to the daily dashboard"
```

---

## Task 10: Daily Dashboard — Symptom Check-In

**Files:**
- Create: `src/components/SymptomCheckIn.tsx`
- Modify: `app/dashboard.tsx`
- Test: `src/components/SymptomCheckIn.test.tsx`

**Interfaces:**
- Consumes: `SymptomTag` type (Task 1).
- Produces: `<SymptomCheckIn selected={...} onChange={...} onSave={...} />` — mounted in `app/dashboard.tsx`, writes through `getRepositories().symptomLog`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/SymptomCheckIn.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';

describe('SymptomCheckIn', () => {
  it('toggles a tag into the selection when tapped', () => {
    const onChange = jest.fn();
    render(<SymptomCheckIn selected={[]} onChange={onChange} onSave={() => {}} />);
    fireEvent.press(screen.getByTestId('tag-bloating'));
    expect(onChange).toHaveBeenCalledWith(['bloating']);
  });

  it('toggles a tag out of the selection when tapped again', () => {
    const onChange = jest.fn();
    render(<SymptomCheckIn selected={['bloating']} onChange={onChange} onSave={() => {}} />);
    fireEvent.press(screen.getByTestId('tag-bloating'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('calls onSave when the save button is pressed', () => {
    const onSave = jest.fn();
    render(<SymptomCheckIn selected={['cramps']} onChange={() => {}} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('save-symptoms-button'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/SymptomCheckIn.test.tsx`
Expected: FAIL with "Cannot find module '@/components/SymptomCheckIn'"

- [ ] **Step 3: Implement `src/components/SymptomCheckIn.tsx`**

```tsx
import { View, Text, Pressable } from 'react-native';
import type { SymptomTag } from '@/types';

interface SymptomCheckInProps {
  selected: SymptomTag[];
  onChange: (tags: SymptomTag[]) => void;
  onSave: () => void;
}

const TAGS: { id: SymptomTag; label: string }[] = [
  { id: 'bloating', label: '🎈 Вздутие' },
  { id: 'breast_tenderness', label: '💔 Болезненность груди' },
  { id: 'cramps', label: '😣 Спазмы' },
  { id: 'acne', label: '🔴 Акне' },
  { id: 'apathy', label: '😶 Апатия' },
  { id: 'irritability', label: '😤 Раздражительность' },
  { id: 'anxiety', label: '😰 Тревожность' },
  { id: 'sugar_craving', label: '🍬 Тяга к сладкому' },
  { id: 'salt_craving', label: '🧂 Тяга к солёному' },
];

export function SymptomCheckIn({ selected, onChange, onSave }: SymptomCheckInProps) {
  function toggle(tag: SymptomTag) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }

  return (
    <View className="bg-gray-50 rounded-3xl p-4 mb-4">
      <Text className="text-base font-semibold mb-3">Как ты себя чувствуешь сегодня?</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <Pressable
            key={tag.id}
            testID={`tag-${tag.id}`}
            onPress={() => toggle(tag.id)}
            className={`px-3 py-2 rounded-full ${selected.includes(tag.id) ? 'bg-emerald-500' : 'bg-white'}`}
          >
            <Text className={selected.includes(tag.id) ? 'text-white' : 'text-gray-700'}>{tag.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="save-symptoms-button" onPress={onSave} className="bg-emerald-500 rounded-full px-6 py-2 self-start">
        <Text className="text-white font-semibold">Сохранить</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/SymptomCheckIn.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire it into `app/dashboard.tsx`**

```tsx
// app/dashboard.tsx
import { View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';
import { calculatePhase } from '@/engine/phaseEngine';
import { getRepositories } from '@/db/client';
import type { SymptomTag } from '@/types';

// Uses the UTC calendar date, matching how every other stored date (cycle
// starts, symptom logs) is produced — see subtractDaysUtc in
// CycleParamsForm.tsx. Accepted simplification: someone logging a symptom
// within a few hours of local midnight could see it land on the adjacent
// UTC day; not worth extra complexity for a first version.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const repos = getRepositories();
  const profile = repos.userProfile.get()!;
  const cycleHistory = repos.cycleEntry.getAll();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomTag[]>([]);

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  function saveSymptoms() {
    repos.symptomLog.add(todayIso(), selectedSymptoms);
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
        <SymptomCheckIn selected={selectedSymptoms} onChange={setSelectedSymptoms} onSave={saveSymptoms} />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 6: Manually verify on-device**

Run: `npm start`, open iOS Simulator.
Expected: tapping symptom tags highlights them, "Сохранить" does not crash; relaunching the app and checking `repos.symptomLog.getAll()` (temporarily log it to console) shows the saved entry.

- [ ] **Step 7: Commit**

```bash
git add src/components/SymptomCheckIn.tsx src/components/SymptomCheckIn.test.tsx app/dashboard.tsx
git commit -m "feat: add symptom check-in to the daily dashboard"
```

---

## Task 11: Daily Dashboard — Plate Builder with Equivalent Choices

**Files:**
- Create: `src/components/PlateBuilder.tsx`
- Modify: `app/dashboard.tsx`
- Test: `src/components/PlateBuilder.test.tsx`

**Interfaces:**
- Consumes: `getRecommendation` (Task 6), `PlateRecommendation`/`FoodOption` types (Task 6).
- Produces: `<PlateBuilder phase={...} symptoms={...} />` — mounted in `app/dashboard.tsx` below the symptom check-in.

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/PlateBuilder.test.tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import { PlateBuilder } from '@/components/PlateBuilder';

describe('PlateBuilder', () => {
  it('shows the focus nutrients and explanation for the given phase', () => {
    render(<PlateBuilder phase="luteal" symptoms={[]} />);
    expect(screen.getByText('Магний, B6')).toBeTruthy();
  });

  it('shows a symptom note when a relevant symptom is passed', () => {
    render(<PlateBuilder phase="luteal" symptoms={['sugar_craving']} />);
    expect(
      screen.getByText('Тяга к сладкому сегодня — это реакция мозга на расход магния, а не слабость воли.')
    ).toBeTruthy();
  });

  it('lets the user pick one equivalent option per category, highlighting the choice', () => {
    render(<PlateBuilder phase="luteal" symptoms={[]} />);
    const option = screen.getByTestId('option-turkey');
    fireEvent.press(option);
    expect(option.props.accessibilityState.selected).toBe(true);
  });

  it('renders all four categories', () => {
    render(<PlateBuilder phase="menstrual" symptoms={[]} />);
    expect(screen.getByTestId('category-protein')).toBeTruthy();
    expect(screen.getByTestId('category-carbs')).toBeTruthy();
    expect(screen.getByTestId('category-fats')).toBeTruthy();
    expect(screen.getByTestId('category-tea_spice')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/PlateBuilder.test.tsx`
Expected: FAIL with "Cannot find module '@/components/PlateBuilder'"

- [ ] **Step 3: Implement `src/components/PlateBuilder.tsx`**

```tsx
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getRecommendation } from '@/content/rulesEngine';
import type { Phase, SymptomTag } from '@/types';
import type { FoodCategoryKey } from '@/content/knowledgeBase';

interface PlateBuilderProps {
  phase: Phase;
  symptoms: SymptomTag[];
}

const CATEGORY_LABELS: Record<FoodCategoryKey, string> = {
  protein: 'Белок',
  carbs: 'Сложные углеводы',
  fats: 'Полезные жиры',
  tea_spice: 'Чай / специя',
};

export function PlateBuilder({ phase, symptoms }: PlateBuilderProps) {
  const recommendation = getRecommendation(phase, symptoms);
  const [choices, setChoices] = useState<Record<string, string>>({});

  return (
    <View className="bg-orange-50 rounded-3xl p-4 mb-4">
      <Text className="text-base font-semibold mb-1">Тарелка дня</Text>
      <Text className="text-sm text-gray-600 mb-1">{recommendation.focusNutrients.join(', ')}</Text>
      <Text className="text-sm text-gray-700 mb-3">{recommendation.explanation}</Text>

      {recommendation.symptomNotes.map((note) => (
        <Text key={note} className="text-sm text-emerald-700 mb-3">
          {note}
        </Text>
      ))}

      {recommendation.categories.map(({ key, options }) => (
        <View key={key} testID={`category-${key}`} className="mb-4">
          <Text className="text-sm font-semibold text-gray-600 mb-2">{CATEGORY_LABELS[key]}</Text>
          <View className="flex-row flex-wrap items-center gap-2">
            {options.map((opt, i) => (
              <View key={opt.id} className="flex-row items-center gap-2">
                <Pressable
                  testID={`option-${opt.id}`}
                  accessibilityState={{ selected: choices[key] === opt.id }}
                  onPress={() => setChoices((prev) => ({ ...prev, [key]: opt.id }))}
                  className={`px-3 py-2 rounded-full ${choices[key] === opt.id ? 'bg-emerald-500' : 'bg-white'}`}
                >
                  <Text className={choices[key] === opt.id ? 'text-white' : 'text-gray-700'}>
                    {opt.emoji} {opt.name}
                  </Text>
                </Pressable>
                {i < options.length - 1 && <Text className="text-gray-400">⇄</Text>}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/PlateBuilder.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Wire it into `app/dashboard.tsx`**

```tsx
// app/dashboard.tsx
import { View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { PhaseCard } from '@/components/PhaseCard';
import { SymptomCheckIn } from '@/components/SymptomCheckIn';
import { PlateBuilder } from '@/components/PlateBuilder';
import { calculatePhase } from '@/engine/phaseEngine';
import { getRepositories } from '@/db/client';
import type { SymptomTag } from '@/types';

// Uses the UTC calendar date, matching how every other stored date (cycle
// starts, symptom logs) is produced — see subtractDaysUtc in
// CycleParamsForm.tsx. Accepted simplification: someone logging a symptom
// within a few hours of local midnight could see it land on the adjacent
// UTC day; not worth extra complexity for a first version.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardScreen() {
  const repos = getRepositories();
  const profile = repos.userProfile.get()!;
  const cycleHistory = repos.cycleEntry.getAll();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomTag[]>([]);

  const phaseResult = useMemo(() => calculatePhase(profile, cycleHistory), [profile, cycleHistory]);

  function saveSymptoms() {
    repos.symptomLog.add(todayIso(), selectedSymptoms);
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <PhaseCard result={phaseResult} />
        <SymptomCheckIn selected={selectedSymptoms} onChange={setSelectedSymptoms} onSave={saveSymptoms} />
        <PlateBuilder phase={phaseResult.phase} symptoms={selectedSymptoms} />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 6: Manually verify on-device**

Run: `npm start`, open iOS Simulator.
Expected: plate builder shows focus nutrients, explanation, and tappable equivalent food/tea options with a ⇄ divider between them; selecting a symptom tag and saving updates the symptom note shown below the explanation.

- [ ] **Step 7: Commit**

```bash
git add src/components/PlateBuilder.tsx src/components/PlateBuilder.test.tsx app/dashboard.tsx
git commit -m "feat: add plate builder with equivalent food/tea choices"
```

---

## Task 12: Local Notifications

**Files:**
- Create: `src/notifications/scheduler.ts`
- Test: `src/notifications/scheduler.test.ts`

**Interfaces:**
- Consumes: `PhaseResult` (Task 5).
- Produces: `scheduleNotifications(phaseResult)` — called once from `app/dashboard.tsx` on mount.

- [ ] **Step 1: Write the failing test (mocking `expo-notifications`, no device needed)**

```typescript
// src/notifications/scheduler.test.ts
import * as Notifications from 'expo-notifications';
import { scheduleNotifications } from '@/notifications/scheduler';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

describe('scheduleNotifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('cancels previously scheduled notifications before scheduling new ones', async () => {
    await scheduleNotifications({ cycleDay: 14, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });

  it('schedules an evening symptom check-in reminder for today', async () => {
    await scheduleNotifications({ cycleDay: 14, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Как ты себя чувствуешь сегодня?' }),
      })
    );
  });

  it('schedules a phase-change reminder when the next phase is 2 days away', async () => {
    // day 14/28 with menstrual(5)/follicular(7)/ovulatory(3)->end 15, so day 14 is 1 day from luteal.
    // Use day 13 -> ovulatory ends day 15 -> 2 days out.
    await scheduleNotifications({ cycleDay: 13, phase: 'ovulatory', isApproximate: false });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: 'Скоро смена фазы' }),
      })
    );
  });

  it('does not schedule a phase-change reminder when isApproximate is true', async () => {
    await scheduleNotifications({ cycleDay: 13, phase: 'ovulatory', isApproximate: true });
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const titles = calls.map((c) => c[0].content.title);
    expect(titles).not.toContain('Скоро смена фазы');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/notifications/scheduler.test.ts`
Expected: FAIL with "Cannot find module '@/notifications/scheduler'"

- [ ] **Step 3: Implement `src/notifications/scheduler.ts`**

```typescript
import * as Notifications from 'expo-notifications';
import type { PhaseResult } from '@/engine/phaseEngine';

// Phase boundaries at the reference 28-day/5-day-period cycle used only to
// estimate "how many days until the next phase" for the reminder — the real
// phase itself always comes from phaseEngine, this is a display heuristic only.
const REFERENCE_PHASE_END_DAY: Record<PhaseResult['phase'], number> = {
  menstrual: 5,
  follicular: 12,
  ovulatory: 15,
  luteal: 28,
};

function daysUntilNextPhase(result: PhaseResult): number {
  return REFERENCE_PHASE_END_DAY[result.phase] - result.cycleDay;
}

function atHour(hour: number, daysFromNow = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export async function scheduleNotifications(result: PhaseResult): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Как ты себя чувствуешь сегодня?',
      body: 'Отметь симптомы дня — мы подстроим тарелку под них.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: atHour(20) },
  });

  if (!result.isApproximate && daysUntilNextPhase(result) === 2) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Скоро смена фазы',
        body: 'Через 2 дня начинается новая фаза — загляни, чем закупиться на неделю.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: atHour(9) },
    });
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/notifications/scheduler.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Call it from `app/dashboard.tsx` (add a `useEffect`)**

```tsx
// Add to app/dashboard.tsx, alongside the existing imports and body:
import { useEffect } from 'react';
import { scheduleNotifications } from '@/notifications/scheduler';

// Inside DashboardScreen, after phaseResult is computed:
useEffect(() => {
  scheduleNotifications(phaseResult);
}, [phaseResult.cycleDay, phaseResult.phase, phaseResult.isApproximate]);
```

- [ ] **Step 6: Manually verify on-device**

Run: `npm start`, open iOS Simulator, accept the system notification permission prompt when it appears.
Expected: no crash; check Settings → Notifications → app to confirm permission was requested.

- [ ] **Step 7: Commit**

```bash
git add src/notifications/scheduler.ts src/notifications/scheduler.test.ts app/dashboard.tsx
git commit -m "feat: add local phase-change and symptom check-in notifications"
```

---

## Task 13: Personal Pattern Recognition

**Files:**
- Create: `src/engine/patternRecognition.ts`
- Create: `src/components/PatternInsight.tsx`
- Modify: `app/dashboard.tsx`
- Test: `src/engine/patternRecognition.test.ts`
- Test: `src/components/PatternInsight.test.tsx`

**Interfaces:**
- Consumes: `SymptomLog`, `CycleEntry`, `UserProfile` types (Task 1), `calculatePhase` (Task 5).
- Produces: `findPatterns(logs, cycleHistory, profile): SymptomPattern[]` and `<PatternInsight patterns={...} />` — mounted at the bottom of `app/dashboard.tsx`.

- [ ] **Step 1: Write the failing test for `findPatterns`**

```typescript
// src/engine/patternRecognition.test.ts
import { findPatterns } from '@/engine/patternRecognition';
import type { CycleEntry, SymptomLog, UserProfile } from '@/types';

const profile: UserProfile = {
  id: 1,
  lastPeriodStart: '2026-05-01',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  dietaryRestrictions: [],
  intensity: 'medium',
  cycleLengthIsEstimate: false,
};

describe('findPatterns', () => {
  it('returns no patterns with fewer than 2 logged cycles', () => {
    const history: CycleEntry[] = [{ id: 1, startDate: '2026-05-01' }];
    const logs: SymptomLog[] = [{ id: 1, date: '2026-05-21', tags: ['bloating'] }];
    expect(findPatterns(logs, history, profile)).toEqual([]);
  });

  it('surfaces a tag that recurs on a similar cycle day across 2+ cycles', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
    ];
    // Cycle 1 (started 04-01): day 21 = 2026-04-21.
    // Cycle 2 (started 04-29): day 20 = 2026-05-18.
    const logs: SymptomLog[] = [
      { id: 1, date: '2026-04-21', tags: ['bloating'] },
      { id: 2, date: '2026-05-18', tags: ['bloating'] },
    ];
    const patterns = findPatterns(logs, history, profile);
    expect(patterns).toEqual([
      { tag: 'bloating', commonCycleDayRange: [20, 21], occurrences: 2 },
    ]);
  });

  it('correctly attributes a log to the cycle that was active at the time, not the most recent one overall', () => {
    // Log falls between the 1st and 2nd recorded period starts, so it must be
    // scored against the 1st start (04-01), even though 04-29 is later in
    // the history array and would be "most recent" for today's date.
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
      { id: 3, startDate: '2026-05-25' }, // irregular: 28-day gap, then 26-day gap
    ];
    const logs: SymptomLog[] = [
      { id: 1, date: '2026-04-10', tags: ['cramps'] }, // day 10 of cycle starting 04-01
      { id: 2, date: '2026-05-08', tags: ['cramps'] }, // day 10 of cycle starting 04-29
    ];
    const patterns = findPatterns(logs, history, profile);
    expect(patterns).toEqual([
      { tag: 'cramps', commonCycleDayRange: [10, 10], occurrences: 2 },
    ]);
  });

  it('ignores a tag that only occurred once', () => {
    const history: CycleEntry[] = [
      { id: 1, startDate: '2026-04-01' },
      { id: 2, startDate: '2026-04-29' },
    ];
    const logs: SymptomLog[] = [{ id: 1, date: '2026-04-21', tags: ['acne'] }];
    expect(findPatterns(logs, history, profile)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/engine/patternRecognition.test.ts`
Expected: FAIL with "Cannot find module '@/engine/patternRecognition'"

- [ ] **Step 3: Implement `src/engine/patternRecognition.ts`**

```typescript
import type { CycleEntry, SymptomLog, SymptomTag, UserProfile } from '@/types';

export interface SymptomPattern {
  tag: SymptomTag;
  commonCycleDayRange: [number, number];
  occurrences: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CLOSE_ENOUGH_SPAN = 2; // occurrences must fall within this many days of each other

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / DAY_MS);
}

// Unlike phaseEngine's calculatePhase (which always anchors on the single
// most recent cycle start, because it answers "what phase is it today?"),
// pattern recognition looks at *past* log dates and must anchor each one on
// whichever cycle was actually active on that date — not on a cycle that
// started later, which calculatePhase would otherwise pick.
function cycleDayFor(logDate: string, cycleHistory: CycleEntry[], profile: UserProfile): number {
  const priorStarts = cycleHistory
    .map((entry) => entry.startDate)
    .filter((start) => start <= logDate)
    .sort();
  const referenceStart = priorStarts[priorStarts.length - 1] ?? profile.lastPeriodStart;
  return daysBetween(new Date(referenceStart), new Date(logDate)) + 1;
}

export function findPatterns(
  logs: SymptomLog[],
  cycleHistory: CycleEntry[],
  profile: UserProfile
): SymptomPattern[] {
  if (cycleHistory.length < 2) return [];

  const dayByTag = new Map<SymptomTag, number[]>();
  for (const log of logs) {
    const cycleDay = cycleDayFor(log.date, cycleHistory, profile);
    for (const tag of log.tags) {
      const days = dayByTag.get(tag) ?? [];
      days.push(cycleDay);
      dayByTag.set(tag, days);
    }
  }

  const patterns: SymptomPattern[] = [];
  for (const [tag, days] of dayByTag) {
    if (days.length < 2) continue;
    const min = Math.min(...days);
    const max = Math.max(...days);
    if (max - min > CLOSE_ENOUGH_SPAN) continue;
    patterns.push({ tag, commonCycleDayRange: [min, max], occurrences: days.length });
  }
  return patterns;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/engine/patternRecognition.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write the failing test for `PatternInsight`**

```typescript
// src/components/PatternInsight.test.tsx
import { render, screen } from '@testing-library/react-native';
import { PatternInsight } from '@/components/PatternInsight';

describe('PatternInsight', () => {
  it('renders nothing when there are no patterns', () => {
    render(<PatternInsight patterns={[]} />);
    expect(screen.queryByTestId('pattern-insight')).toBeNull();
  });

  it('shows a gentle observation, not a diagnosis, for a bloating pattern', () => {
    render(
      <PatternInsight
        patterns={[{ tag: 'bloating', commonCycleDayRange: [20, 22], occurrences: 2 }]}
      />
    );
    expect(
      screen.getByText('Похоже, вздутие у тебя чаще случается на 20–22 день цикла.')
    ).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- src/components/PatternInsight.test.tsx`
Expected: FAIL with "Cannot find module '@/components/PatternInsight'"

- [ ] **Step 7: Implement `src/components/PatternInsight.tsx`**

```tsx
import { View, Text } from 'react-native';
import type { SymptomPattern } from '@/engine/patternRecognition';
import type { SymptomTag } from '@/types';

interface PatternInsightProps {
  patterns: SymptomPattern[];
}

const TAG_LABELS: Record<SymptomTag, string> = {
  bloating: 'вздутие',
  breast_tenderness: 'болезненность груди',
  cramps: 'спазмы',
  acne: 'акне',
  apathy: 'апатию',
  irritability: 'раздражительность',
  anxiety: 'тревожность',
  sugar_craving: 'тягу к сладкому',
  salt_craving: 'тягу к солёному',
};

export function PatternInsight({ patterns }: PatternInsightProps) {
  if (patterns.length === 0) return null;

  return (
    <View testID="pattern-insight" className="bg-emerald-50 rounded-3xl p-4 mb-4">
      {patterns.map((p) => (
        <Text key={p.tag} className="text-sm text-gray-700">
          Похоже, {TAG_LABELS[p.tag]} у тебя чаще случается на {p.commonCycleDayRange[0]}–
          {p.commonCycleDayRange[1]} день цикла.
        </Text>
      ))}
    </View>
  );
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- src/components/PatternInsight.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 9: Wire it into `app/dashboard.tsx`**

```tsx
// Add to app/dashboard.tsx:
import { PatternInsight } from '@/components/PatternInsight';
import { findPatterns } from '@/engine/patternRecognition';

// Inside DashboardScreen, after phaseResult:
const patterns = useMemo(
  () => findPatterns(repos.symptomLog.getAll(), cycleHistory, profile),
  [cycleHistory, profile]
);

// In the JSX, after <PlateBuilder ... />:
<PatternInsight patterns={patterns} />
```

- [ ] **Step 10: Manually verify on-device**

Run: `npm start`, open iOS Simulator, log the same symptom on two simulated cycles (adjust the device clock or manually insert two `CycleEntry`/`SymptomLog` rows for testing).
Expected: after 2 cycles with a matching symptom, the dashboard shows a "Похоже, ... чаще случается на X–Y день цикла" card; with fewer than 2 cycles nothing extra renders.

- [ ] **Step 11: Commit**

```bash
git add src/engine/patternRecognition.ts src/engine/patternRecognition.test.ts src/components/PatternInsight.tsx src/components/PatternInsight.test.tsx app/dashboard.tsx
git commit -m "feat: add on-device personal pattern recognition"
```

---

## Self-Review Notes (completed while writing this plan)

- **Spec coverage:** T1 → Tasks 2–4. T2 → Task 5. T3 → Task 8. T4 + §4.5 → Tasks 9–11. T5 → Task 6 (dietary defaults enforced in `knowledgeBase.ts` data itself — no wheat/rye/barley, no cow dairy, no added sugar in any option). T6 → Task 12. T7 → Task 7. T8 → Task 13. Free/Pro boundary (§9) → enforced by `PlateBuilder` only ever rendering names + emoji, no gram amounts, no recipes.
- **Placeholder scan:** no TBD/TODO; every step has real, runnable code.
- **Type consistency:** `PhaseResult` (Task 5) is the single shape consumed by `PhaseCard` (Task 9), `scheduler.ts` (Task 12), and `patternRecognition.ts` (Task 13) — verified field names (`cycleDay`, `phase`, `isApproximate`) match across all three. `FoodCategoryKey` (Task 6) matches the keys used in `PlateBuilder` (Task 11).
