## typejoi

joi full featured typescript integration ( easy to learn + joi full power )

## why typejoi

-   really easy to learn
-   can do any
-   full power of joi ( you cannot use some thing like joi.alternatives on [joi-typescript-validator](https://www.npmjs.com/package/joi-typescript-validator))
-   easy to implement with nestjs

## installation

this package needs joi on a separate installation for better compatibility

```bash
npm install typejoi joi
```

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

#Examples
validation using joi.alternatives:

```typescript
@TypeJoi()
abstract class Job {
    @tj(joi.number().min(1).max(100))
    experience: number;
}

// you could also use inheritance for validation
class Worker extends Job {
    @tj(joi.valid("worker"))
    jobName: "worker";

    @tj(joi.valid("hard"))
    level: "hard";
}

class Teacher extends Job {
    @tj(joi.valid("teacher"))
    jobName: "teacher";

    @tj(joi.valid("very-hard"))
    level: "very-hard";
}

const createAlternatives = (...alternatives: Function) => {
    return alternatives.map((alternative) => getSchemaFromClass(alternative));
};

@TypeJoi()
class Person {
    @tj(joi.string())
    name: string;

    @tj(createAlternatives(Teacher, Worker))
    job: Teacher | Worker; // it is not possible to get type from an union instead you can pass it like this
}

//valid persons are like :
const valid = {
    name: "a hardworking worker",
    job: {
        name: "worker",
        level: "hard",
        experience: 10,
    },
};
const valid2 = {
    name: "a kind teacher",
    job: {
        name: "teacher",
        level: "very-hard",
        experience: 15,
    },
};
// some invalid examples :
const invalid = {
    name: "test",
    job: {
        name: "teacher",
        level: "hard", // because of mismatching name and level the validation will fail
        experience: 109,
    },
};
const invalid2 = {
    name: "test",
    job: {
        name: "teacher",
        level: "very-hard",
        // invalid because experience field is missing
    },
};
```

## nestjs

```typescript
// typejoi.pipe.ts

import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from "@nestjs/common";
import { getSchemaFromClass, isTypeJoi } from "typejoi";

@Injectable()
export class TypejoiPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (isTypeJoi(metadata.metatype)) {
            // get schema from type
            const schema = getSchemaFromClass(metadata.metatype);
            // validate the input
            const result = schema.validate(value);

            if (result.error) {
                // throwing error
                throw new BadRequestException({
                    errCode: 400,
                    msg: "invalid input",
                    error: result.error,
                });
            }
            // return transformed value ( joi can also transforms value )
            return result.value;
        } else {
            // return value if type is not a typejoi
            return value;
        }
    }
}

// app.controller.ts
import {
    Body,
    Controller,
    ParseBoolPipe,
    Post,
    UsePipes,
} from "@nestjs/common";
import * as Joi from "joi";
import { tj, TypeJoi } from "typejoi";
import { AppService } from "./app.service";
import { TypejoiPipe } from "./typejoi.pipe";

// the class needs this decorator
@TypeJoi((schema) => schema.options({ presence: "required" }))
class Test {
    @tj(Joi.string())
    prop: string;
}

@UsePipes(TypejoiPipe) // you can also pass pipe to module level and application level.
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    // pipe will not affect this
    @Post("/test")
    getText(@Body("boolean", ParseBoolPipe) boolean: boolean) {
        return boolean;
    }

    // working :)
    @Post()
    getHello(@Body() body: Test): any {
        return body;
    }
}
```

# Api

# getSchemaFromClass

returns a schema from a class decorated with @TypeJoi(...) with or without caching
arguments: - target : the class - useCache?: boolean - if true it will use cache if exists ( default true ) - setCache?: boolean - if true it will set cache when generating schema ( default true)

# TypeJoi

the class decorator to indicate this is a schema class
arguments: - modifierOrSchema?: schema modifier or an alternative schema - schema modifier: a function which accepts a joi schema and return another one useful for adding options to schema or modify keys for some reasons - alternative schema : if input is a joi schema all props are ignored and schema will return when getSchemaFromClass used

# isTypeJoi

verifies a class is a typejoi class or not
arguments : - target:class

# tj

attach validator to a property of a class decorated with @TypeJoi if no value passed it tries to get validator from the type ( it should be a class with TypeJoi decorator) other wise it will throw error
arguments:

-   schema?: joiSchema
