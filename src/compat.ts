import * as childProcess from 'child_process';
import fs from 'fs';
import os from 'os';

// Floor-native defaults (engines >= 18). install-module-linked-compat
// feature-detects at load time and overrides any of these whose built-in the
// running Node lacks.

export function homedir(): string {
  return os.homedir();
}

export function spawn(command: string, args: string[], options: { cwd: string }, callback: (err: Error | null) => void): void {
  // On Windows `npm` is `npm.cmd`, which plain spawn cannot launch; the shell
  // lets cmd.exe resolve it the way a terminal would.
  const child = childProcess.spawn(command, args, { ...options, shell: process.platform === 'win32' });
  let stderr = '';
  let done = false;
  const finish = (err: Error | null): void => {
    if (done) return;
    done = true;
    callback(err);
  };
  child.stderr?.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
  });
  child.on('error', (err: Error) => finish(err));
  child.on('close', (code: number | null) => {
    if (code === 0) return finish(null);
    const err = new Error(`${command} ${args.join(' ')} exited with code ${code}${stderr ? `:\n${stderr.trim()}` : ''}`);
    finish(err);
  });
}

export function fetchText(url: string, callback: (err: Error | null, text?: string) => void): void {
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed with status ${res.status}: ${url}`);
      return res.text();
    })
    .then((text) => callback(null, text))
    .catch((err: unknown) => callback(err instanceof Error ? err : new Error(String(err))));
}

export function rm(path: string, callback: (err: Error | null) => void): void {
  fs.rm(path, { recursive: true, force: true }, (err) => callback(err ?? null));
}

export function rmSync(path: string): void {
  fs.rmSync(path, { recursive: true, force: true });
}

export function mkdir(path: string, callback: (err: Error | null) => void): void {
  fs.mkdir(path, { recursive: true }, (err) => callback(err ?? null));
}

export function syncExec(workerPath: string, data: string): string | undefined {
  const stdout = childProcess.execFileSync(process.execPath, [workerPath, data], { encoding: 'utf8' });
  return stdout?.trim() || undefined;
}
