import type { AxiosError, AxiosRequestConfig } from "axios";

export interface AxiosErrorCustomConfig<TConfig extends AxiosRequestConfig>
  extends AxiosError {
  config: TConfig;
}
