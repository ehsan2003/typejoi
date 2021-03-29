import { getMeta, MetaKeys } from "./MetaKeys";
import "reflect-metadata";

describe("getMeta function", () => {
    it("should return metadata", () => {
        const testMeta = { meta: true };
        const testTarget = { target: true };
        const key = "joiKeys";
        Reflect.defineMetadata(MetaKeys[key], testMeta, testTarget);
        expect(getMeta(key, testTarget)).toBe(testMeta);
    });
});
