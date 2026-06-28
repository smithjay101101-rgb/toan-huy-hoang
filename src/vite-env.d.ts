/// <reference types="vite/client" />

/** Live origin, replaced at build time by Vite `define` from SITE_URL. */
declare const __SITE_URL__: string

declare module '*.json' {
  const value: unknown
  export default value
}
