export interface IDao<T> {
    getOne: (id: string) => Promise<T | null>;
    getAll: () => Promise<T[]>;
    add: (record: T) => Promise<void>;
    update: (record: T) => Promise<void>;
    delete: (id: string) => Promise<void>;
}
