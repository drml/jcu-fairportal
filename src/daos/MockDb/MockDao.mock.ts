import jsonfile from 'jsonfile';
import {IEntity} from "@entities/Entity";
import * as fs from "fs";


interface IDatabase {
    entities: IEntity[];
}


class MockDaoMock {

    private readonly dbFilePath = process.env.DB_FILE_PATH ?? 'data/MockDb.json' + '';


    protected openDb(): IDatabase {

        if (!fs.existsSync(this.dbFilePath)) {
            this.saveDb({
                entities: []
            })
        }

        return jsonfile.readFileSync(this.dbFilePath) as IDatabase;
    }


    protected saveDb(db: IDatabase): void {
        return jsonfile.writeFileSync(this.dbFilePath, db);
    }
}

export default MockDaoMock;
