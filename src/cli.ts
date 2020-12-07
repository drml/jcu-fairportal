import Vorpal = require('vorpal');
import * as fs from "fs";
import parse from "csv-parse/lib/sync";
import {Entity, EntityAttributes} from "@entities/Entity";
import YAML from 'yaml';
import jsonfile from "jsonfile";
import EntityDao from "@daos/Entity/EntityDao.mock";
import {SemanticMappingDefinition} from "@entities/SemanticMappingTypes";

const vorpal = new Vorpal();

vorpal
    .command(
        'import [csv] [semantics]',
        'Imports data from CSV according to given JSON or YAML semantic description'
    )
    .option('-g <column>', "Use GUID from column of data")
    .action(async (action) => {

        const csvFile: string = action.csv
        const semanticsFile: string = action.semantics

        // load CSV data
        const csvContents: string = fs.readFileSync(csvFile, 'utf8');

        if (!csvContents) {
            // eslint-disable-next-line no-console
            return console.log("CSV content is undefined");
        }

        const csvRecords: Array<EntityAttributes> = parse(csvContents.trimStart().trimEnd(), {
            columns: true,
            columns_duplicates_to_array: true,
            delimiter: ";",
            cast: true,
            cast_date: false,
        }) as Array<EntityAttributes>;

        // eslint-disable-next-line no-console
        console.log(csvRecords);

        // load JSON or YAML semantics

        let semantics: SemanticMappingDefinition;

        if (semanticsFile.endsWith(".json")) {
            semantics = jsonfile.readFileSync(semanticsFile) as SemanticMappingDefinition;
        } else if (semanticsFile.endsWith(".yaml")) {
            const yamlContents: string = fs.readFileSync(semanticsFile, 'utf8');
            semantics = YAML.parse(yamlContents) as SemanticMappingDefinition;
        } else {
            // eslint-disable-next-line no-console
            console.error("Unrecognized file type of semantics, JSON and YAML are supported.");
            return;
        }

        // eslint-disable-next-line no-console
        console.log(semantics);

        // persist to the DB
        const dao = new EntityDao();

        for (let i = 0; i < csvRecords.length; i++) {
            const attributes = csvRecords[i];
            const entity = new Entity(
                (action.options.g && attributes[action.options.g] ? attributes[action.options.g] + '' : null),
                attributes,
                semantics
            );
            await dao.upsert(entity);
        }

    });

if (process.argv.length > 2) {
    vorpal.parse(process.argv);
} else {
    vorpal.delimiter('app-cli$').show();
}
