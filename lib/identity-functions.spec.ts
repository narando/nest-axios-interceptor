import { identityFulfilled, identityRejected } from "./identity-functions";

describe("Identity Functions", () => {
  describe("identityFulfilled", () => {
    it("should return the value", () => {
      const complicatedValue = {
        key: "foo",
        bar: 2,
        baz: {
          hello: "world",
        },
      };

      expect(identityFulfilled(complicatedValue)).toBe(complicatedValue);
      expect(identityFulfilled(complicatedValue)).toEqual({
        key: "foo",
        bar: 2,
        baz: {
          hello: "world",
        },
      });
    });
  });

  describe("identityRejected", () => {
    it("should throw the value", () => {
      const err = new Error();
      expect(identityRejected(err)).rejects.toThrow(err);
    });
  });
});
