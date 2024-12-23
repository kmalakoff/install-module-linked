export type EnsureCachedCallback = (err?: Error, installedAt?: string) => void;
export type InstallCallback = (err?: Error, installedAt?: string) => void;

export interface InstallOptions {
  cacheDirectory?: string;
}
