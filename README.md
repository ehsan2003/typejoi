## typejoi

joi full featured typescript integration ( easy to learn + total power of joi )

## why typejoi

with typejoi you can do everything you can do with pure joi. the main benefit of typejoi against something like [joi-typescript-validator](https://www.npmjs.com/package/ joi-typescript-validator) is that you can also use joi.alternatives for union validation

-   and learn how to use this package is really easy just read the following codes and get started :).

## Usage

### decorate a class

you can create a joi schema by the following steps:

```typescript
import { TypeJoi, getSchemaFromClass } from "typejoi";
@TypeJoi()
class JoiSchemaClass {}

const joiSchema = getSchemaFromClass(JoiSchemaClass); // a valid joi schema
```

#### adding properties

```typescript
import { TypeJoi, getSchemaFromClass, tj } from "typejoi";
import * as joi from "joi";

@TypeJoi()
class JoiSchemaClass {
    @tj(joi.string())
    property: string;
}

const joiSchema = getSchemaFromClass(JoiSchemaClass);
// ^- equals to : const joiSchema = joi.object({property:joi.string()})

console.log(joiSchema.validate({ property: "hello world" })); // validation successful : {value:{property:'hello world'}}
```

you can modify the schema (e.g. add options to schema) by passing argument to TypeJoi:

```typescript
import { TypeJoi, getSchemaFromClass, tj } from "typejoi";
import * as joi from "joi";

@TypeJoi((schema) => schema.options({ presence: "required" }))
class JoiSchemaClass {
    @tj(joi.string())
    property: string;
}

const joiSchema = getSchemaFromClass(JoiSchemaClass);
// ^- equals to : const joiSchema = joi.object({property:joi.string()}).options({presence:'required'})

console.log(joiSchema.validate({})); // validation failed because properties are now required
```

it is also possible to use nested schema like this :

```typescript
const schema = joi.object({
    nested: joi.object({
        property: joi.string(),
    }),
});
// the same code in typejoi:
@TypeJoi()
class NestedObject {
    @tj(joi.string())
    property: string;
}
@TypeJoi()
class Test {
    @tj() // you can also pass an alternative joi schema for validating this part if no argument passed then typejoi tries to generate schema from nested class
    nested: NestedObject;
    // Note that if no argument passed and nested class is not a typejoi ( not decorated with @TypeJoi(...)) then you will get an error
}
```
