import type { Store } from '@/db/types';
import type { Intensity, UserProfile } from '@/types';

// SQLite columns are snake_case (see schema.ts's USER_PROFILE_COLUMNS);
// UserProfile's fields are camelCase. This row shape matches the real table
// columns exactly, so the Store<T> passed in here writes/reads the actual
// column names — mapping to/from the camelCase domain type happens only in
// this file. dietaryRestrictions has no array column, so it's JSON-encoded;
// cycleLengthIsEstimate has no boolean column, so it's 0/1.
export interface ProfileRow {
  id: number;
  last_period_start: string;
  avg_cycle_length: number;
  avg_period_length: number;
  dietary_restrictions: string;
  intensity: string;
  cycle_length_is_estimate: number;
}

function toRow(data: Omit<UserProfile, 'id'>): Omit<ProfileRow, 'id'> {
  return {
    last_period_start: data.lastPeriodStart,
    avg_cycle_length: data.avgCycleLength,
    avg_period_length: data.avgPeriodLength,
    dietary_restrictions: JSON.stringify(data.dietaryRestrictions),
    intensity: data.intensity,
    cycle_length_is_estimate: data.cycleLengthIsEstimate ? 1 : 0,
  };
}

function fromRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    lastPeriodStart: row.last_period_start,
    avgCycleLength: row.avg_cycle_length,
    avgPeriodLength: row.avg_period_length,
    dietaryRestrictions: JSON.parse(row.dietary_restrictions),
    intensity: row.intensity as Intensity,
    cycleLengthIsEstimate: Boolean(row.cycle_length_is_estimate),
  };
}

export function createUserProfileRepo(store: Store<ProfileRow>) {
  return {
    get(): UserProfile | undefined {
      const [row] = store.getAll();
      if (!row) return undefined;
      return fromRow(row);
    },
    save(data: Omit<UserProfile, 'id'>): UserProfile {
      const existing = store.getAll()[0];
      const row = toRow(data);
      if (existing) {
        store.update(existing.id, row);
        return { ...data, id: existing.id };
      }
      return fromRow(store.insert(row));
    },
  };
}
