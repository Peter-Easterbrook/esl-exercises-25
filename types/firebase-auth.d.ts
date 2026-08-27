import type { Persistence } from 'firebase/auth';

/**
 * `getReactNativePersistence` exists at runtime but is missing from the types.
 *
 * The `firebase` wrapper package's `./auth` export map has no `react-native`
 * condition — only `types`, `node`, `browser` and `default` — so TypeScript
 * always resolves to the web type definitions, which do not declare it. Metro
 * has no such problem: it follows the export map into `@firebase/auth`, which
 * *does* have a `react-native` condition, and the function is really there.
 *
 * So this is a types-only gap, not a missing implementation. Re-check it on
 * firebase upgrades — currently firebase 12.17.1 / @firebase/auth 1.13.4 — and
 * delete this file once the wrapper package ships the declaration.
 */
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
