import { getMeta } from "./MetaKeys";

/**
 * indicates a class is joi schema or not
 * @param targetClass target class
 * @returns
 */
export function isTypeJoi(
    targetClass: any
): targetClass is { new (...args: any[]): any } {
    return !!getMeta("isTypeJoi", targetClass);
}
