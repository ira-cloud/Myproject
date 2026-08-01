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
