# @narando/nest-axios-interceptor

<p align="center">
    Easily build and configure <a href="https://github.com/axios/axios#interceptors" target="blank">axios interceptors</a> for the NestJS <a href="https://docs.nestjs.com/techniques/http-module" target="blank">HttpModule/HttpService</a>.
<p align="center">

<p align="center">
    <a href="https://www.npmjs.com/package/@narando/nest-axios-interceptor" target="_blank"><img src="https://img.shields.io/npm/v/@narando/nest-axios-interceptor.svg" alt="NPM Version"/></a>
    <a href="https://www.npmjs.com/package/@narando/nest-axios-interceptor" target="_blank"><img src="https://img.shields.io/npm/l/@narando/nest-axios-interceptor.svg" alt="Package License"/></a>
    <a href="https://www.npmjs.com/package/@narando/nest-axios-interceptor" target="_blank"><img src="https://img.shields.io/npm/dm/@narando/nest-axios-interceptor.svg" alt="NPM Downloads"/></a>
    <a href="https://github.com/narando/nest-axios-interceptor/actions?query=workflow%3A%22CI%22" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/narando/nest-axios-interceptor/ci.yaml?branch=main" alt="CI Status"/></a>
</p>

## Features

- Define axios interceptors
- Register interceptor on `HttpService.axiosRef`
- Type-safe handling of custom options in request config

## Usage

### Installation

Install this module:

```shell
$ npm i @narando/nest-axios-interceptor
```

### Creating an `AxiosInterceptor`

Create a new module and import the `HttpModule`:

```typescript
// cats.module.ts
import { HttpModule, HttpService } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

Bootstrap your new interceptor with this boilerplate:

```typescript
// logging.axios-interceptor.ts
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  AxiosInterceptor,
  AxiosFulfilledInterceptor,
  AxiosRejectedInterceptor,
} from "@narando/nest-axios-interceptor";

@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  // requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {}
  // requestRejected(): AxiosRejectedInterceptor {}
  // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}
  // responseRejected(): AxiosRejectedInterceptor {}
}
```

By default, the interceptor uses identity functions (no-op) for all 4 possible events.

To add your behaviour, override the class methods for the events you want to handle and return a function that will be used in the interceptor.

```typescript
// logging.axios-interceptor.ts
@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {
    return (config) => {
      // Log outgoing request
      console.log(`Request: ${config.method} ${config.path}`);

      return config;
    };
  }

  // requestRejected(): AxiosRejectedInterceptor {}
  // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}
  // responseRejected(): AxiosRejectedInterceptor {}
}
```

### Setting custom options to the request config

If you want to pass-through data from on interceptor function to another, add it to the request config object.

First, define your new request config type. To avoid conflicts with other interceptors, we will define a Symbol and use it as the object key:

```typescript
// logging.axios-interceptor.ts
const LOGGING_CONFIG_KEY = Symbol("kLoggingAxiosInterceptor");

// Merging our custom properties with the base config
interface LoggingConfig extends InternalAxiosRequestConfig {
  [LOGGING_CONFIG_KEY]: {
    id: number;
  };
}
```

Now we have to update the interceptor to use this new config:

```diff
  // logging.axios-interceptor.ts
  @Injectable()
- export class LoggingAxiosInterceptor extends AxiosInterceptor {
+ export class LoggingAxiosInterceptor extends AxiosInterceptor<LoggingConfig> {
    constructor(httpService: HttpService) {
      super(httpService);
    }

-   requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {
+   requestFulfilled(): AxiosFulfilledInterceptor<LoggingConfig> {
      return (config) => {
        // Log outgoing request
        console.log(`Request: ${config.method} ${config.path}`);

        return config;
      };
    }

    // requestRejected(): AxiosRejectedInterceptor {}
-   // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}
+   // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponseCustomConfig<LoggingConfig>> {}
    // responseRejected(): AxiosRejectedInterceptor {}
  }
```

With the updated typing, you can now use the extend configuration:

```typescript
// logging.axios-interceptor.ts
const LOGGING_CONFIG_KEY = Symbol("kLoggingAxiosInterceptor");

@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor<LoggingConfig> {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  requestFulfilled(): AxiosFulfilledInterceptor<LoggingConfig> {
    return (config) => {
      const requestId = 1234;

      config[LOGGING_CONFIG_KEY] = {
        id: requestId,
      };
      // Log outgoing request
      console.log(`Request(ID=${requestId}): ${config.method} ${config.path}`);

      return config;
    };
  }

  // requestRejected(): AxiosRejectedInterceptor {}

  responseFulfilled(): AxiosFulfilledInterceptor<
    AxiosResponseCustomConfig<LoggingConfig>
  > {
    return (response) => {
      const requestId = response.config[LOGGING_CONFIG_KEY].id;
      // Log response
      console.log(`Response(ID=${requestId}): ${response.status}`);

      return response;
    };
  }

  // responseRejected(): AxiosRejectedInterceptor {}
}
```

### Handling Errors

By default, the axios error (rejected) interceptors pass the error with type `any`. This is not really helpful as we can't do anything with it.

Internally, axios wraps all errors in a custom object `AxiosError`. We can use the class method `isAxiosError` to assert that the passed error is indeed of type `AxiosError`, and then process it how we want:

```typescript
// logging.axios-interceptor.ts

@Injectable()
export class LoggingAxiosInterceptor extends AxiosInterceptor {
  constructor(httpService: HttpService) {
    super(httpService);
  }

  // requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {}
  // requestRejected(): AxiosRejectedInterceptor {}
  // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}

  responseRejected(): AxiosRejectedInterceptor {
    return (err) => {
      if (this.isAxiosError(err)) {
        const { config, response } = err;

        console.log(
          `Error ${response.status} in request "${config.method} ${config.path}`
        );
      } else {
        console.error("Unexpected generic error", err);
      }

      throw err;
    };
  }
}
```

## Upgrading

### Version Compatibility

| nest-axios-interceptor | @nestjs/axios | @nestjs    |
| ---------------------- |---------------|------------|
| 3.x                    | 2.x & 3.x     | 9.x & 10.x |
| 2.x                    | 1.x           | 8.x        |
| 1.x                    | 0.x           | 7.x        |

### v2 to v3

Version 3 requires:

- @nestjs/axios > 2.0.0
- @nestjs > 9.0.0

The axios internal types for request configs changed (`AxiosRequestConfig` -> `InternalAxiosRequestConfig`), and you need to update your types to match.

If you do not use custom configs, you can use this diff:

```diff
 // logging.axios-interceptor.ts
 import { Injectable } from "@nestjs/common";
 import { HttpService } from "@nestjs/axios";
-import type { AxiosResponse, AxiosRequestConfig } from "axios";
+import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
 import {
   AxiosInterceptor,
   AxiosFulfilledInterceptor,
   AxiosRejectedInterceptor,
 } from "@narando/nest-axios-interceptor";

 @Injectable()
 export class LoggingAxiosInterceptor extends AxiosInterceptor {
   constructor(httpService: HttpService) {
     super(httpService);
   }

-  // requestFulfilled(): AxiosFulfilledInterceptor<AxiosRequestConfig> {}
+  // requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {}
   // requestRejected(): AxiosRejectedInterceptor {}
   // responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {}
   // responseRejected(): AxiosRejectedInterceptor {}
 }
```

If you use custom configs, you also need to change the custom config:

```diff
 // logging.axios-interceptor.ts
 const LOGGING_CONFIG_KEY = Symbol("kLoggingAxiosInterceptor");

 // Merging our custom properties with the base config
-interface LoggingConfig extends AxiosRequestConfig {
+interface LoggingConfig extends InternalAxiosRequestConfig {
   [LOGGING_CONFIG_KEY]: {
     id: number;
   };
 }
```

## License

This repository is published under the [MIT License](./LICENSE).
