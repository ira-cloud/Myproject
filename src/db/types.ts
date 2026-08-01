export interface Store<T extends { id: number }> {
  insert(row: Omit<T, 'id'>): T;
  getAll(): T[];
  getById(id: number): T | undefined;
  update(id: number, patch: Partial<Omit<T, 'id'>>): void;
}
