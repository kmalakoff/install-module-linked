export interface CleanOptions {
  slient?: boolean;
}

export type GetScopedSpecifiedCallback = (err?: Error, installSpecifier?: string) => void;
export type EnsureCachedCallback = (err?: Error, cachedAt?: string) => void;
export type InstallCallback = (err?: Error, installedAt?: string) => void;

export interface InstallOptions {
  cachePath?: string;
}
