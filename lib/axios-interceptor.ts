import type { OnModuleInit } from "@nestjs/common";
import type { HttpService } from "@nestjs/axios";
import type {
  AxiosError,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { identityFulfilled, identityRejected } from "./identity-functions";
import { AxiosErrorCustomConfig } from "./interfaces/axios-error-custom-config";
import { AxiosFulfilledInterceptor } from "./interfaces/axios-fulfilled-interceptor";
import { AxiosRejectedInterceptor } from "./interfaces/axios-rejected-interceptor";
import { AxiosResponseCustomConfig } from "./interfaces/axios-response-custom-config";

export abstract class AxiosInterceptor<
  TRequestConfig extends AxiosRequestConfig = AxiosRequestConfig,
  TResponse extends AxiosResponse = AxiosResponseCustomConfig<TRequestConfig>,
  TAxiosError extends AxiosError = AxiosErrorCustomConfig<TRequestConfig>
> implements OnModuleInit
{
  protected readonly httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  public onModuleInit(): void {
    this.registerInterceptors();
  }

  private registerInterceptors(): void {
    const { axiosRef: axios } = this.httpService;

    type RequestManager = AxiosInterceptorManager<TRequestConfig>;
    type ResponseManager = AxiosInterceptorManager<TResponse>;

    (axios.interceptors.request as RequestManager).use(
      this.requestFulfilled(),
      this.requestRejected()
    );

    (axios.interceptors.response as ResponseManager).use(
      this.responseFulfilled(),
      this.responseRejected()
    );
  }

  /**
   * Implement this function to do something before request is sent.
   */
  protected requestFulfilled(): AxiosFulfilledInterceptor<TRequestConfig> {
    // Noop by default
    return identityFulfilled;
  }

  /**
   * Implement this function to do something with request error.
   */
  protected requestRejected(): AxiosRejectedInterceptor {
    // Noop by default
    return identityRejected;
  }

  /**
   * Implement this function to do something with response data.
   */
  protected responseFulfilled(): AxiosFulfilledInterceptor<TResponse> {
    // Noop by default
    return identityFulfilled;
  }

  /**
   * Implement this function to do something with response error.
   */
  protected responseRejected(): AxiosRejectedInterceptor {
    // Noop by default
    return identityRejected;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected isAxiosError(err: any): err is TAxiosError {
    return !!(err.isAxiosError && err.isAxiosError === true);
  }
}
