import Module from 'module';
import path from 'path';
import * as compat from '../compat.ts';
import type { FetchTextFn, HomedirFn, InstallOptions, MkdirFn, RmFn, RmSyncFn, SpawnFn, SyncExecFn } from '../types.ts';

// Tier 2 deferral: workerModule is data, resolved once per call.
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;

export interface ResolvedOptions {
  cachePath: string;
  workerModule?: string;
  spawn: SpawnFn;
  fetchText: FetchTextFn;
  rm: RmFn;
  rmSync: RmSyncFn;
  mkdir: MkdirFn;
  homedir: HomedirFn;
  syncExec: SyncExecFn;
}

// Per-call resolution, zero module state: the caller's options first, then
// the workerModule's exports (the compat layer's shims in the sync child),
// then the floor built-in defaults.
export default function resolveOptions(options: InstallOptions): ResolvedOptions {
  const injected = options.workerModule ? _require(options.workerModule) : undefined;
  const homedir = options.homedir ?? injected?.homedir ?? compat.homedir;
  return {
    cachePath: options.cachePath ?? path.join(homedir(), '.iml'),
    workerModule: options.workerModule,
    spawn: options.spawn ?? injected?.spawn ?? compat.spawn,
    fetchText: options.fetchText ?? injected?.fetchText ?? compat.fetchText,
    rm: options.rm ?? injected?.rm ?? compat.rm,
    rmSync: options.rmSync ?? injected?.rmSync ?? compat.rmSync,
    mkdir: options.mkdir ?? injected?.mkdir ?? compat.mkdir,
    homedir,
    syncExec: options.syncExec ?? injected?.syncExec ?? compat.syncExec,
  };
}
