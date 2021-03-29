import Joi from "joi";
import { MetaKeys, ModifierOrSchema } from "./MetaKeys";

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
    if (
        modifierOrSchema &&
        !Joi.isSchema(modifierOrSchema) &&
        typeof modifierOrSchema !== "function"
    ) {
        throw new Error(
            "invalid modifier: property modifierOrSchema must be a joi schema or a function"
        );
    }
    return (target: Function) => {
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, target);
        Reflect.defineMetadata(MetaKeys.JoiModifier, modifierOrSchema, target);
    };
}
