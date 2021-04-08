import Joi, * as joi from "joi";
import { getMeta, MetaKeys } from "./MetaKeys";
import { isTypeJoi } from "./isTypeJoi";
import { getSchemaFromClass } from "./getSchemaFromClass";

/**
 * field decorator for classes decorated with @TypeJoi(...)
 * @param JoiSchema input schema for a field if not specified the schema will extract from type ( in this case the type should also be class decorated with @TypeJoi(...))
 * @returns PropertyDecorator
 */
export function tj(JoiSchema?: joi.Schema | Function[]): PropertyDecorator {
    if (Array.isArray(JoiSchema)) {
        if (!JoiSchema.length) {
            throw new Error(
                "when passing function JoiSchema must have at least one item"
            );
        }

        JoiSchema = Joi.alternatives().try(
            ...JoiSchema.map((typeJoiClass, index) => {
                if (!isTypeJoi(typeJoiClass)) {
                    throw new Error(
                        `class in index ${index} is not decorated with @TypeJoi (${typeJoiClass.toString()})`
                    );
                }
                return getSchemaFromClass(typeJoiClass);
            })
        );
    }
    if (JoiSchema && !Joi.isSchema(JoiSchema)) {
        throw new Error("invalid input schema");
    }

    return (target: any, key: string | symbol) => {
        const type = Reflect.getMetadata("design:type", target, key);

        let schema: Joi.Schema | undefined;

        if (isTypeJoi(type)) {
            schema = getSchemaFromClass(type);
        }

        schema = (JoiSchema as Joi.Schema) || schema;

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
