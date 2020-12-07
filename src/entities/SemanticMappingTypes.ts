export type ExpandedIri = { [key: string]: string } & {
    "@id": string
}

export type RawValue = string | number | ExpandedIri

export type NamespaceAliases = {
    [key: string]: string
}

export type StaticIdentity = {
    identity: string,
    value: RawValue | RawValue[]
}

export type PrimitiveMapping = {
    valueIdentity: string | string[],
    valueProjection?: { [key: string]: RawValue | RawValue[] }
}

export type NestedMapping = PrimitiveMapping & {
    relationIdentity: string,
    relationType: string | string[],
    staticIdentities?: StaticIdentity[]
}

export type AttributeMapping = string | PrimitiveMapping | NestedMapping

export type SemanticMappingDefinition = {
    namespaceAliases: NamespaceAliases,
    baseType: string,
    additionalTypes: string[],
    mappings: {
        [key: string]: AttributeMapping | AttributeMapping[]
    },
    staticIdentities?: StaticIdentity[],
    additionalMetadata?: StaticIdentity[]
}
