import { env } from "$env/dynamic/public";
import { Capacitor } from "@capacitor/core";

export const API_URL = env.PUBLIC_API_URL.replace(
  env.PUBLIC_API_ORIGIN_WEB,
  Capacitor.getPlatform() === 'web' ? env.PUBLIC_API_ORIGIN_WEB : env.PUBLIC_API_ORIGIN_ANDROID,
);
