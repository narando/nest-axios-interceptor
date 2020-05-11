export type AxiosFulfilledInterceptor<T> = (value: T) => T | Promise<T>;
