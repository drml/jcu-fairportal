import {Attribute, IEntity} from "@entities/Entity";
import {buildDataUrl, buildIri, buildMetaUrl, safelyMerge} from "@shared/functions";
import {AttributeMapping, NestedMapping} from "@entities/SemanticMappingTypes";


export const mapDataToJsonLd = (entity: IEntity): { [key: string]: any } => {

    let context: { [key: string]: any } = {
        "sorg": "http://schema.org/",
        "sio": "https://semanticscience.org/resource/",
        "dwc": "http://rs.tdwg.org/dwc/terms/",
    };
    let data: { [key: string]: any } = {
        "@id": buildDataUrl(entity),
        "sorg:identifier": buildDataUrl(entity),
        "sio:SIO_000629": buildMetaUrl(entity),     // is subject of
        "sorg:mainEntityOfPage": buildIri(buildMetaUrl(entity)),
    };

    // merge namespace aliases
    context = {...context, ...entity.semantics.namespaceAliases};

    // add static data, if defined
    if (entity.semantics.staticIdentities) {

        const staticData = entity.semantics.staticIdentities.reduce((map: { [key: string]: any }, i) => {
            map[i.identity] = i.value;
            return map;
        }, {});

        data = safelyMerge(data, staticData);
    }

    const additionalProperties: { [key: string]: any } = {};

    // map individual attributes
    for (const attrKey of Object.keys(entity.attributes)) {

        const attributeValue: Attribute = entity.attributes[attrKey];

        // try-get mapping for attribute
        const mapping = entity.semantics.mappings[attrKey];

        // if no mapping is defined, add to additional attributes as-is
        if (!mapping) {
            additionalProperties[attrKey] = attributeValue;
            continue;
        }

        // apply mappings
        const mappingsToApply = Array.isArray(mapping) ? mapping : [mapping];

        for (const m of mappingsToApply) {

            data = safelyMerge(data, mapAttribute(attributeValue, m));
        }
    }

    // add additional properties
    data = {...data, "dwc:dynamicProperties": JSON.stringify(additionalProperties)}

    // add types
    data = {...data, "@type": [entity.semantics.baseType, ...entity.semantics.additionalTypes]}

    // merge data and context toggether
    return {
        "@context": context,
        ...data,
    };
}


export const mapMetadataToJsonLd = (entity: IEntity, name: string | null = null): { [key: string]: any } => {

    let context: { [key: string]: any } = {
        "sorg": "http://schema.org/",
        "sio": "https://semanticscience.org/resource/",
    };
    let data: { [key: string]: any } = {
        // identifiers and data<>metadata binding
        "@id": buildMetaUrl(entity),
        "@type": "sorg:CreativeWork",
        "sorg:name": "Metadata for " + name ?? entity.id,
        "sorg:identifier": buildMetaUrl(entity),
        "sorg:mainEntity": buildIri(buildDataUrl(entity)),
        "sio:SIO_000332": buildDataUrl(entity),     // is about,

        // auto-generated metadata
        "sorg:dateCreated": entity.meta.created,
        "sorg:dateModified": entity.meta.updated,

        // persistence policy of service
        "http://www.w3.org/2000/10/swap/pim/doc#persistencePolicy": buildIri((process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/persistence-policy")
    };

    // merge namespace aliases
    context = {...context, ...entity.semantics.namespaceAliases};

    // add additional metadata, if defined
    if (entity.semantics.additionalMetadata) {

        const staticData = entity.semantics.additionalMetadata.reduce((map: { [key: string]: any }, i) => {
            map[i.identity] = i.value;
            return map;
        }, {});

        data = safelyMerge(data, staticData);
    }

    // merge data and context toggether
    return {
        "@context": context,
        ...data,
    };
}


const isNestedMapping = (variableToCheck: any): variableToCheck is NestedMapping =>
    (variableToCheck as NestedMapping).relationIdentity !== undefined;

const mapAttribute = (attribute: Attribute, mapping: AttributeMapping): { [key: string]: any } => {

    const out: { [key: string]: any } = {}

    // simple identity -> value
    if (typeof mapping === "string") {

        out[mapping] = attribute;
        return out

        // complex identity -> object of type
    } else if (isNestedMapping(mapping)) {

        const attributeArray = Array.isArray(attribute) ? attribute : [attribute];

        const mappedArray = attributeArray.map(attributeValue => {
            // TODO: properly type
            let mapped: { [key: string]: any } = {
                "@type": mapping.relationType,
            };

            // add value with defined identities
            for (const valueIdentity of Array.isArray(mapping.valueIdentity) ? mapping.valueIdentity : [mapping.valueIdentity]) {

                // project value attributeValue if projection exists
                if (mapping.valueProjection && mapping.valueProjection[attributeValue] !== undefined) {
                    mapped[valueIdentity] = mapping.valueProjection[attributeValue];
                } else {
                    mapped[valueIdentity] = attributeValue;
                }
            }

            // add static values, if defined
            if (mapping.staticIdentities) {

                const staticData = mapping.staticIdentities.reduce((map: { [key: string]: any }, i) => {
                    map[i.identity] = i.value;
                    return map;
                }, {});

                mapped = safelyMerge(mapped, staticData);
            }

            return mapped
        })

        out[mapping.relationIdentity] = mappedArray.length === 1 ? mappedArray[0] : mappedArray;
        return out

        // primitive mapping
    } else {

        // add value with defined identities
        for (const valueIdentity of Array.isArray(mapping.valueIdentity) ? mapping.valueIdentity : [mapping.valueIdentity]) {

            // apply projections if defined
            if (mapping.valueProjection) {

                // normalize to array
                const attributeArray = Array.isArray(attribute) ? attribute : [attribute];

                // project value attributeValue if projection exists
                const p = mapping.valueProjection;
                const projectionArray = attributeArray.map(a => (p[a] !== undefined) ? p[a] : a)

                // de-normalize to array or single value
                out[valueIdentity] = projectionArray.length === 1 ? projectionArray[0] : projectionArray;

            } else {
                out[valueIdentity] = attribute;
            }
        }

        return out
    }

}
