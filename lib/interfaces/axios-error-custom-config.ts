import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface AxiosErrorCustomConfig<
  TConfig extends InternalAxiosRequestConfig
> extends AxiosError {
  config: TConfig;
}
