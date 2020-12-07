import {SemanticMappingDefinition} from "@entities/SemanticMappingTypes";

export type Attribute = string | number | string[] | number[];

export type EntityAttributes = { [key: string]: Attribute }

export type EntityMeta = {
    created: string,
    updated: string,
}

export interface IEntity {
    // structural
    id: string | null,

    // raw data layer
    attributes: EntityAttributes,

    // semantic layer
    semantics: SemanticMappingDefinition

    // metadata layer
    meta: EntityMeta
}

export class Entity implements IEntity {
    id: string | null;
    attributes: EntityAttributes;
    semantics: SemanticMappingDefinition;
    meta: EntityMeta;

    constructor(id: string | null, attributes: EntityAttributes, semantics: SemanticMappingDefinition) {
        this.id = id;
        this.attributes = attributes;
        this.semantics = semantics;
        this.meta = {
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
    }

}
