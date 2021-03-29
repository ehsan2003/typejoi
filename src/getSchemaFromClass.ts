import Joi, * as joi from "joi";
import { getMeta, SchemaModifier } from "./MetaKeys";
import { isTypeJoi } from "./isTypeJoi";

/**
 *
 * @param target target class ( the target class must decorated with @TypeJoi(...) )
 * @returns
 */
export function getSchemaFromClass<T extends { new(...args: any[]): {}; }>(
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
