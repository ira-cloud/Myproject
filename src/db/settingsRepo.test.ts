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
