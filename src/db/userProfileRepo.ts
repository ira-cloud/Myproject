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
