export interface CleanOptions {
  slient?: boolean;
}

export type GetScopedSpecifiedCallback = (err?: Error | null, installSpecifier?: string) => void;
export type EnsureCachedCallback = (err?: Error | null, cachedAt?: string) => void;
export type InstallCallback = (err?: Error | null, installedAt?: string) => void;

export interface InstallOptions {
  cachePath?: string;
}
