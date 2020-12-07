import {IEntity} from "@entities/Entity";
import {ExpandedIri} from "@entities/SemanticMappingTypes";
import stringify from "csv-stringify/lib/sync";
import jsonld from "jsonld";

/**
 * Safely merge two dictionary key-by-key. If key is already present in A,
 * make it an array and append same key from B to it.
 *
 * @param a
 * @param b
 */
export const safelyMerge = (a: { [key: string]: any }, b: { [key: string]: any }): { [key: string]: any } => {
    for (const key of Object.keys(b)) {
        if (a[key] === undefined) {
            a[key] = b[key];
        } else {
            if (!Array.isArray(a[key])) {
                a[key] = [a[key]];
            } else {
                a[key].push(b[key]);
            }
        }
    }
    return a;
}

export const buildMetaUrl = (entity: IEntity) => (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost")+ "/entity/" + entity.id;

export const buildDataUrl = (entity: IEntity) => buildMetaUrl(entity) + "/data";

export const buildIri = (link: string): ExpandedIri => ({"@id": link});


export const findDocumentTitleOrName = async (jsonLdData: { [key: string]: any }): Promise<string> => {
    const jsonLdFlattened : {[key: string]: any} = await jsonld.flatten(jsonLdData, {});

    const mainDocument = jsonLdFlattened["@graph"] &&
        Array.isArray(jsonLdFlattened["@graph"]) &&
        jsonLdFlattened["@graph"].find(d => d["@id"] && typeof d["@id"] === 'string' && !d["@id"].startsWith("_:"));

    if (!mainDocument) return ""

    return mainDocument["http://schema.org/name"]
        ?? mainDocument["http://purl.org/dc/terms/title"]
        ?? mainDocument["@id"];
}

export const convertToCsv = (entities: IEntity[]): string => {

    // extract column names to support serialization of multiple types
    const columns: Set<string> = new Set();

    // expand array attributes to individual columns
    const backMapping: { [key: string]: string } = {};

    const flattenedEntities = entities.map(e => {
        const flattened: { [key: string]: any } = {};

        for (const key of Object.keys(e.attributes)) {
            if (Array.isArray(e.attributes[key])) {
                (e.attributes[key] as any[]).forEach((i, index) => {
                    // artificial key with indexer
                    const generatedKey = key + "__" + index;

                    backMapping[generatedKey] = key;
                    flattened[generatedKey] = i;
                    columns.add(generatedKey);
                });
            } else {
                flattened[key] = e.attributes[key];
                columns.add(key);
            }
        }
        return flattened;
    });

    // UTF BOM added to support MS Excel
    const csvString = stringify(flattenedEntities, {
        header: true,
        bom: true,
        delimiter: ';',
        columns: [...columns]
    });

    // back-map expanded columns' generated names to original names
    const lines = csvString.split("\n")

    for (const [generated, original] of Object.entries(backMapping)) {
        lines[0] = lines[0].replace(generated, original);
    }

    return lines.join("\n");
};
