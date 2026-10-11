# Changelog

All notable changes to install-module-linked are documented here.

## [2.1.0] - 2026-10-11

### Added

- Install strings may name a semver range (`is-number@^7.0.0`, `resolve-once@1.x`) or a dist-tag
  (`pkg@next`). Each resolves against the npm registry to the version npm itself would install,
  and the cache entry is keyed by that exact version.

### Fixed

- A range or dist-tag no longer becomes a cache entry named after the literal text, which kept the
  first resolution forever and could not be created on Windows for ranges containing `<`, `>` or `|`.
