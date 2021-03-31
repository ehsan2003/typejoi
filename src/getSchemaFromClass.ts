import Joi, * as joi from "joi";
import { getMeta, MetaKeys, SchemaModifier } from "./MetaKeys";
import { isTypeJoi } from "./isTypeJoi";

/**
 *
 * @param target target class ( the target class must decorated with @TypeJoi(...) )
 * @returns
 */
export function getSchemaFromClass<T extends { new (...args: any[]): {} }>(
    target: T,
    useCache = true,
    setCache = true
): Joi.Schema {
    if (!isTypeJoi(target)) {
        throw new Error("the class must be decorated with @TypeJoi(...)");
    }

    if (useCache) {
        const cache = getMeta("cacheSchema", target);
        if (cache) {
            return cache;
        }
    }

    const JoiModifier = getMeta("JoiModifier", target);
    if (joi.isSchema(JoiModifier)) {
        return JoiModifier as joi.Schema;
    }

    const keysMap = getMeta("joiKeys", target) || [];
    // generating schema
    let schema = Joi.object().keys(
        Object.fromEntries(keysMap.map(({ key, schema }) => [key, schema]))
    );
    if (JoiModifier) {
        schema = (JoiModifier as SchemaModifier)(schema);
    }

    // setting cache
    if (setCache) {
        Reflect.defineMetadata(MetaKeys.cacheSchema, schema, target);
    }
    return schema;
}
