import MockDaoMock from '@daos/MockDb/MockDao.mock';
import {IDao} from "@daos/MockDb/IDao";
import {IEntity} from "@entities/Entity";

import short from 'short-uuid';

class EntityDao extends MockDaoMock implements IDao<IEntity> {


    public async getOne(id: string): Promise<IEntity | null> {
        const db = await super.openDb();
        for (const entity of db.entities) {
            if (entity.id === id) {
                return entity;
            }
        }
        return null;
    }

    public async getAll(): Promise<IEntity[]> {
        const db = await super.openDb();
        return db.entities;
    }

    public async upsert(entity: IEntity): Promise<void> {

        if (entity.id && await this.exists(entity.id)) {
            return this.update(entity);
        } else {
            return this.add(entity);
        }
    }

    public async add(entity: IEntity): Promise<void> {
        const db = await super.openDb();
        if (!entity.id) {
            entity.id = short.generate();
        }
        db.entities.push(entity);
        await super.saveDb(db);
    }


    public async exists(id: string): Promise<boolean> {
        const db = await super.openDb();
        return !!db.entities.find(e => id === e.id);
    }

    public async update(entity: IEntity): Promise<void> {
        const db = await super.openDb();
        for (let i = 0; i < db.entities.length; i++) {
            if (db.entities[i].id === entity.id) {
                db.entities[i] = entity;
                db.entities[i].meta.updated = new Date().toISOString();
                await super.saveDb(db);
                return;
            }
        }
        throw new Error('Entity not found');
    }


    public async delete(id: string): Promise<void> {
        const db = await super.openDb();
        for (let i = 0; i < db.entities.length; i++) {
            if (db.entities[i].id === id) {
                db.entities.splice(i, 1);
                await super.saveDb(db);
                return;
            }
        }
        throw new Error('Record not found');
    }

    public getAllBaseTypes(): string[] {
        const db = super.openDb();

        return [...new Set(db.entities.map(e => e.semantics.baseType))];
    }

}

export default EntityDao;
