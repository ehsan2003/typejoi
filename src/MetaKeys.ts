import Joi from "joi";

export const MetaKeys = {
    cacheSchema:'TypeJoiDecorate:cacheSchema',
    isTypeJoi: "TypeJoiDecorate:isTypeJoi",
    joiKeys: "TypeJoiDecorate:joiKeys",
    JoiModifier: "TypeJoiDecorate:JoiModifier",
};

export type SchemaModifier = (schema: Joi.ObjectSchema) => Joi.ObjectSchema;
export type ModifierOrSchema = SchemaModifier | Joi.Schema;
type MetaTypes = {
    cacheSchema: Joi.AnySchema;
    isTypeJoi: boolean;
    joiKeys: { key: string; schema: Joi.Schema }[];
    JoiModifier: ModifierOrSchema;
};
export function getMeta<K extends keyof MetaTypes, T extends MetaTypes[K]>(
    key: K,
    target: any
): T {
    return Reflect.getMetadata(MetaKeys[key], target);
}
