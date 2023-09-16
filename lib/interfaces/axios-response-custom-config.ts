import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export interface AxiosResponseCustomConfig<
  TConfig extends InternalAxiosRequestConfig,
> extends AxiosResponse {
  config: TConfig;
}
