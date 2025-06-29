export interface WriteRepository<T> {
  create(data: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
}
