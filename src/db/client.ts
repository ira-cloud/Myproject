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
import { createCycleEntryRepo, type CycleEntryRow } from '@/db/cycleEntryRepo';
import { createSymptomLogRepo, type LogRow } from '@/db/symptomLogRepo';
import { createSettingsRepo, type SettingRow } from '@/db/settingsRepo';

let cached: ReturnType<typeof buildRepositories> | null = null;

function buildRepositories() {
  const db = SQLite.openDatabaseSync('cyclesync.db');
  db.execSync(CREATE_TABLES_SQL);

  return {
    userProfile: createUserProfileRepo(createSqliteStore<ProfileRow>(db, 'user_profile', USER_PROFILE_COLUMNS)),
    cycleEntry: createCycleEntryRepo(createSqliteStore<CycleEntryRow>(db, 'cycle_entry', CYCLE_ENTRY_COLUMNS)),
    symptomLog: createSymptomLogRepo(createSqliteStore<LogRow>(db, 'symptom_log', SYMPTOM_LOG_COLUMNS)),
    settings: createSettingsRepo(createSqliteStore<SettingRow>(db, 'settings', SETTINGS_COLUMNS)),
  };
}

export function getRepositories() {
  if (!cached) cached = buildRepositories();
  return cached;
}
