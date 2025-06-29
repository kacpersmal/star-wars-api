export interface ReadRepository<T> {
  getAll(limit?: number, offset?: number, search?: string): Promise<T[]>;
  getById(id: string): Promise<T | null>;
}
