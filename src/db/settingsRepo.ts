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
