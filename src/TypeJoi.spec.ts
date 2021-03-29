import "reflect-metadata";
import { TypeJoi } from "./TypeJoi";
import { MetaKeys } from "./MetaKeys";
import Joi from "joi";
describe("TypeJoi decorator", () => {
    it("should attach metadata", () => {
        const modifierObject = (schema) => schema;
        class Test {}
        TypeJoi(modifierObject)(Test);
        expect(Reflect.getMetadata(MetaKeys.isTypeJoi, Test)).toBeTruthy();
        expect(Reflect.getMetadata(MetaKeys.JoiModifier, Test)).toBe(
            modifierObject
        );
    });
    it("should throw error for invalid input", () => {
        expect(() => TypeJoi("invalid input" as any)).toThrow();
    });
});
