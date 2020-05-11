export const identityFulfilled = <T>(value: T): T => value;

export const identityRejected = (err: any): Promise<void> =>
  Promise.reject(err);
