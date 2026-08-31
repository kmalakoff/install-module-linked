export interface CleanOptions {
  slient?: boolean;
  rmSync?: RmSyncFn;
}

export type GetScopedSpecifiedCallback = (err?: Error | null, installSpecifier?: string) => void;
export type EnsureCachedCallback = (err?: Error | null, cachedAt?: string) => void;
export type InstallCallback = (err?: Error | null, installedAt?: string) => void;

export type SpawnFn = (command: string, args: string[], options: { cwd: string }, callback: (err: Error | null) => void) => void;
export type FetchTextFn = (url: string, callback: (err: Error | null, text?: string) => void) => void;
export type RmFn = (path: string, callback: (err: Error | null) => void) => void;
export type RmSyncFn = (path: string) => void;
export type MkdirFn = (path: string, callback: (err: Error | null) => void) => void;
export type HomedirFn = () => string;
export type SyncExecFn = (workerPath: string, data: string) => string | undefined;

export interface InstallOptions {
  cachePath?: string;
  spawn?: SpawnFn;
  fetchText?: FetchTextFn;
  rm?: RmFn;
  rmSync?: RmSyncFn;
  mkdir?: MkdirFn;
  homedir?: HomedirFn;
  syncExec?: SyncExecFn;
  workerModule?: string;
}
