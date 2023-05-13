/* eslint-disable @typescript-eslint/ban-ts-comment */

import { HttpService } from "@nestjs/axios";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AxiosError } from "axios";
import { AxiosInterceptor } from "./axios-interceptor";

// AxiosInterceptor is abstract and can not be instantiated
@Injectable()
class TestAxiosInterceptor extends AxiosInterceptor {
  constructor(httpService: HttpService) {
    super(httpService);
  }
}

describe("AxiosInterceptor", () => {
  let axiosInterceptor: AxiosInterceptor;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TestAxiosInterceptor,
        {
          provide: HttpService,
          useFactory: (): HttpService =>
            ({
              axiosRef: {},
            } as any as HttpService),
        },
      ],
    }).compile();

    axiosInterceptor =
      moduleRef.get<TestAxiosInterceptor>(TestAxiosInterceptor);
    httpService = moduleRef.get<HttpService>(HttpService);
  });

  it("should be defined", () => {
    expect(axiosInterceptor).toBeDefined();
    expect(httpService).toBeDefined();
  });

  describe("onModuleInit", () => {
    it("should call registerInterceptors", () => {
      const registerInterceptors = jest
        .spyOn(
          axiosInterceptor,
          // @ts-ignore
          "registerInterceptors"
        )
        // @ts-ignore
        .mockReturnValue(); // Typing require 1 argument, but function has return type `void`/never

      axiosInterceptor.onModuleInit();

      expect(registerInterceptors).toHaveBeenCalledTimes(1);
    });
  });

  describe("registerInterceptors", () => {
    let requestUse: jest.Mock;
    let responseUse: jest.Mock;

    beforeEach(() => {
      requestUse = jest.fn();
      responseUse = jest.fn();

      httpService.axiosRef.interceptors = {
        request: { use: requestUse } as any,
        response: { use: responseUse } as any,
      };
    });

    it("should register interceptors on the axios instance", () => {
      // @ts-ignore
      axiosInterceptor.registerInterceptors();

      expect(requestUse).toHaveBeenCalledTimes(1);
      expect(requestUse).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );

      expect(responseUse).toHaveBeenCalledTimes(1);
      expect(responseUse).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("should get the interceptors from the class methods", () => {
      const requestFulfilledReturnFunction = jest.fn();
      const requestRejectedReturnFunction = jest.fn();
      const responseFulfilledReturnFunction = jest.fn();
      const responseRejectedReturnFunction = jest.fn();

      const requestFulfilled = jest
        .spyOn(axiosInterceptor as any, "requestFulfilled")
        .mockReturnValue(requestFulfilledReturnFunction);
      const requestRejected = jest
        .spyOn(axiosInterceptor as any, "requestRejected")
        .mockReturnValue(requestRejectedReturnFunction);
      const responseFulfilled = jest
        .spyOn(axiosInterceptor as any, "responseFulfilled")
        .mockReturnValue(responseFulfilledReturnFunction);
      const responseRejected = jest
        .spyOn(axiosInterceptor as any, "responseRejected")
        .mockReturnValue(responseRejectedReturnFunction);

      // @ts-ignore
      axiosInterceptor.registerInterceptors();

      expect(requestFulfilled).toHaveBeenCalledTimes(1);
      expect(requestRejected).toHaveBeenCalledTimes(1);
      expect(responseFulfilled).toHaveBeenCalledTimes(1);
      expect(responseRejected).toHaveBeenCalledTimes(1);

      expect(requestUse).toHaveBeenCalledTimes(1);
      expect(requestUse).toHaveBeenCalledWith(
        requestFulfilledReturnFunction,
        requestRejectedReturnFunction
      );

      expect(responseUse).toHaveBeenCalledTimes(1);
      expect(responseUse).toHaveBeenCalledWith(
        responseFulfilledReturnFunction,
        responseRejectedReturnFunction
      );
    });
  });

  describe("isAxiosError", () => {
    it("should return true for AxiosError", () => {
      const axiosError: AxiosError = new Error() as AxiosError;
      axiosError.toJSON = jest.fn();
      axiosError.isAxiosError = true;
      axiosError.config = {} as any;

      // @ts-ignore
      expect(axiosInterceptor.isAxiosError(axiosError)).toBe(true);
    });

    it("should return false for normal Error", () => {
      const normalError: Error = new Error();

      // @ts-ignore
      expect(axiosInterceptor.isAxiosError(normalError)).toBe(false);
    });
  });
});
