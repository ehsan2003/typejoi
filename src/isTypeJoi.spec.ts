import "reflect-metadata";
import { isTypeJoi } from "./isTypeJoi";
import { MetaKeys } from "./MetaKeys";

describe("isTypeJoi function", () => {
    it("should return false for normal objects", () => {
        const testingObject = {};
        expect(isTypeJoi(testingObject)).toBeFalsy();
    });
    it("should return true when isTypeJoi is true", () => {
        const testingObject = {};
        Reflect.defineMetadata(MetaKeys.isTypeJoi, true, testingObject);
        expect(isTypeJoi(testingObject)).toBeTruthy();
    });
});
