import Joi from "joi";
import "reflect-metadata";
import { getSchemaFromClass } from "./getSchemaFromClass";
import { MetaKeys } from "./MetaKeys";
import { fromPairs } from "lodash";

describe("getSchemaFromClass function", () => {
    it("should throw error when target is not TypeJoi", () => {
        class TestClass {}
        expect(() => getSchemaFromClass(TestClass)).toThrow(
            "the class must be decorated with @TypeJoi(...)"
        );
    });
    it("should return input schema if schema passed to @TypeJoi(...)", () => {
        const schema = Joi.object().keys({
            test: Joi.string(),
        });
        class TestClass {}
        Reflect.defineMetadata(MetaKeys.JoiModifier, schema, TestClass);
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, TestClass);
        expect(getSchemaFromClass(TestClass)).toBe(schema);
    });
    it("should return a joi schema with specified keys on metadata", () => {
        const keys: { key: string; schema: Joi.Schema }[] = [
            {
                key: "test",
                schema: Joi.string(),
            },
            {
                key: "test2",
                schema: Joi.number(),
            },
        ];
        const schema = Joi.object().keys(
            fromPairs(keys.map(({ key, schema }) => [key, schema]))
        );
        class TestClass {}
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, TestClass);
        Reflect.defineMetadata(MetaKeys.joiKeys, keys, TestClass);
        const outputSchema = getSchemaFromClass(TestClass);
        expect(outputSchema.describe()).toEqual(schema.describe());
    });
});
