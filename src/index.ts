import Joi, * as joi from "joi";
import "reflect-metadata";
const MetaKeys = {
    isTypeJoi: "TypeJoiDecorate:isTypeJoi",
    joiKeys: "TypeJoiDecorate:joiKeys",
    JoiModifier: "TypeJoiDecorate:JoiModifier",
};

export type SchemaModifier = (schema: Joi.ObjectSchema) => Joi.ObjectSchema;
type ModifierOrSchema = SchemaModifier | Joi.Schema;

type MetaTypes = {
    isTypeJoi: boolean;
    joiKeys: { key: string; schema: Joi.Schema }[];
    JoiModifier: ModifierOrSchema;
};

function getMeta<K extends keyof MetaTypes, T extends MetaTypes[K]>(
    key: K,
    target: any
): T {
    return Reflect.getMetadata(MetaKeys[key], target);
}

/**
 * field decorator for classes decorated with @TypeJoi(...)
 * @param JoiSchema input schema for a field if not specified the schema will extract from type ( in this case the type should also be class decorated with @TypeJoi(...))
 * @returns PropertyDecorator
 */
export function tj(JoiSchema?: joi.Schema): PropertyDecorator {
    if (JoiSchema && !Joi.isSchema(JoiSchema)) {
        throw new Error("invalid input schema");
    }

    return (target: any, key: string | symbol) => {
        const type = Reflect.getMetadata("design:type", target, key);

        let schema: Joi.Schema | undefined;

        if (isTypeJoi(type)) {
            schema = getSchemaFromClass(type);
        }

        schema = JoiSchema || schema;

        if (!schema) {
            throw new Error(
                `could not generate schema. if no argument specified for tj the property type must be a class decorated with @TypeJoi(...)`
            );
        }

        const previousMeta = getMeta("joiKeys", target.constructor);

        // attack each key to the joiKeys meta
        Reflect.defineMetadata(
            MetaKeys.joiKeys,
            [...(previousMeta || []), { key, schema }],
            target.constructor
        );
    };
}
/**
 * typeJoi main class decorator
 * @param modifierOrSchema joiSchema modifier or alternative joi schema
 * if this parameter is a joi schema it will be used as the schema and all class properties are ignored.
 * otherwise it should be a function which gets a joi schema and returns another
 * this is useful when you want to add options and ... to an schema
 * @returns ClassDecorator
 */
export function TypeJoi<T extends { new (...args: any[]): {} }>(
    modifierOrSchema?: ModifierOrSchema
): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, target);
        Reflect.defineMetadata(MetaKeys.JoiModifier, modifierOrSchema, target);
    };
}

/**
 *
 * @param target target class ( the target class must decorated with @TypeJoi(...) )
 * @returns
 */
export function getSchemaFromClass<T extends { new (...args: any[]): {} }>(
    target: T
): Joi.Schema {
    if (!isTypeJoi(target)) {
        throw new Error("the class must be decorated with @TypeJoi(...)");
    }
    const JoiModifier = getMeta("JoiModifier", target);
    if (joi.isSchema(JoiModifier)) {
        return JoiModifier as joi.Schema;
    }

    const keysMap = getMeta("joiKeys", target);
    const schema = Joi.object(
        Object.fromEntries(keysMap.map(({ key, schema }) => [key, schema]))
    );
    if (JoiModifier) {
        return (JoiModifier as SchemaModifier)(schema);
    }
    return schema;
}

/**
 * indicates a class is joi schema or not
 * @param targetClass target class
 * @returns
 */
function isTypeJoi(targetClass: Function) {
    return !!getMeta("isTypeJoi", targetClass);
}
