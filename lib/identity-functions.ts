export const identityFulfilled = <T>(value: T): T => value;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const identityRejected = (err: any): Promise<void> =>
  Promise.reject(err);
