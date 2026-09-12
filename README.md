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

### Documentation

[API Docs](https://kmalakoff.github.io/install-module-linked/)
