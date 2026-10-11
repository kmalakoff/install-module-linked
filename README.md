# install-module-linked

Installs and symlinks a module into node_modules

Requires Node.js 18 or newer.

```sh
npm install install-module-linked
```

```js
import path from 'path';
import installModule from 'install-module-linked';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const installedAt = await installModule('is-number@7.0.0', nodeModulesPath);

console.log(installedAt);
```

The install string can name an exact version, a semver range (`is-number@^7.0.0`) or a dist-tag (`is-number@latest`). A range or tag resolves to the version npm itself would install, and that exact version is cached in `~/.iml` and linked into `nodeModulesPath`. If `nodeModulesPath` already contains the package, the existing link is returned whatever its version.

### Documentation

[API Docs](https://kmalakoff.github.io/install-module-linked/)
