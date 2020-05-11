import type { AxiosRequestConfig, AxiosResponse } from "axios";

export interface AxiosResponseCustomConfig<TConfig extends AxiosRequestConfig>
  extends AxiosResponse {
  config: TConfig;
}
