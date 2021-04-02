import { tj } from "./tj";
import "reflect-metadata";
import Joi from "joi";
import { MetaKeys } from "./MetaKeys";
describe("tj decorator", () => {
    it("should throw error for invalid input schema", () => {
        const invalidSchema = { property: "value" };
        expect(() => tj(invalidSchema as any)).toThrow("invalid input schema");
    });
    it("should throw error if no schema specified and type is not TypeJoi", () => {
        class TestClass {}
        const testingObject = new TestClass();
        const key = "hello";
        Reflect.defineMetadata("design:type", String, testingObject, key);
        expect(() => tj()(testingObject, key)).toThrow(
            `could not generate schema. if no argument specified for tj the property type must be a class decorated with @TypeJoi(...)`
        );
    });

    it("should attach key with schema to metadata", () => {
        class TestClass {}
        const testingObject = new TestClass();
        const key = "test";
        Reflect.defineMetadata("design:type", String, testingObject, key);
        Reflect.defineMetadata(
            MetaKeys.joiKeys,
            ["test"],
            testingObject.constructor
        );
        const schema = Joi.object();
        tj(schema)(testingObject, key);
        const keysMeta = Reflect.getMetadata(
            MetaKeys.joiKeys,
            testingObject.constructor
        );
        expect(keysMeta.length).toBe(2);
        expect(keysMeta[1].key).toBe(key);
        expect(keysMeta[1].schema).toBe(schema);
    });
    it("it should convert to joi schema if array passed", () => {
        class TestClass {}
        const testingObject = new TestClass();
        console.log(testingObject.constructor);

        const key = "testingkey2";
        Reflect.defineMetadata("design:type", String, testingObject, key);
        class T1 {}
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, T1);
        Reflect.defineMetadata(MetaKeys.JoiModifier, Joi.string(), T1);
        class T2 {}
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, T2);
        Reflect.defineMetadata(MetaKeys.JoiModifier, Joi.number(), T2);

        tj([T1, T2])(testingObject, key);
        const generatedSchema = Reflect.getMetadata(
            MetaKeys.joiKeys,
            testingObject.constructor
        );
        console.log(generatedSchema);

        expect(generatedSchema.length).toBe(1);
        expect(generatedSchema[0].schema.describe()).toEqual(
            Joi.alternatives().try(Joi.string(), Joi.number()).describe()
        );
    });
});
