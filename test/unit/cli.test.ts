import assert from 'assert';
import cp from 'child_process';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, '..', '..', 'bin', 'cli.js');

type CliResult = { stdout: string; stderr: string; code: number | null };
type CliCallback = (err: Error | null, result?: CliResult) => void;

function runCli(args: string[], callback: CliCallback): void {
  const proc = cp.spawn(process.execPath, [CLI_PATH].concat(args), {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  proc.stderr.on('data', (data) => {
    stderr += data.toString();
  });
  proc.on('close', (code) => {
    callback(null, { stdout: stdout.trim(), stderr: stderr.trim(), code: code });
  });
  proc.on('error', (err) => {
    callback(err);
  });
}

describe('cli', () => {
  describe('--version', () => {
    it('prints version with --version flag', (done) => {
      runCli(['--version'], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.match(/^\d+\.\d+\.\d+$/), 'Version should be semver format');
        assert.equal(result.code, 0);
        done();
      });
    });

    it('prints version with -v flag', (done) => {
      runCli(['-v'], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.match(/^\d+\.\d+\.\d+$/), 'Version should be semver format');
        assert.equal(result.code, 0);
        done();
      });
    });
  });

  describe('--help', () => {
    it('prints help with --help flag', (done) => {
      runCli(['--help'], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.indexOf('Usage:') >= 0, 'Help should include usage');
        assert.ok(result.stdout.indexOf('Commands:') >= 0, 'Help should include commands');
        assert.ok(result.stdout.indexOf('Options:') >= 0, 'Help should include options');
        assert.ok(result.stdout.indexOf('--version') >= 0, 'Help should mention --version');
        assert.ok(result.stdout.indexOf('--help') >= 0, 'Help should mention --help');
        assert.ok(result.stdout.indexOf('clear') >= 0, 'Help should mention clear command');
        assert.equal(result.code, 0);
        done();
      });
    });

    it('prints help with -h flag', (done) => {
      runCli(['-h'], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.indexOf('Usage:') >= 0, 'Help should include usage');
        assert.equal(result.code, 0);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('shows error for missing command', (done) => {
      runCli([], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.indexOf('Missing command') >= 0, 'Should mention missing command');
        assert.ok(result.stdout.indexOf('--help') >= 0, 'Should suggest --help');
        assert.notEqual(result.code, 0);
        done();
      });
    });

    it('shows error for unrecognized command', (done) => {
      runCli(['unknown'], (err, result) => {
        if (err) return done(err);
        assert.ok(result.stdout.indexOf('Unrecognized command') >= 0, 'Should mention unrecognized command');
        assert.ok(result.stdout.indexOf('--help') >= 0, 'Should suggest --help');
        assert.notEqual(result.code, 0);
        done();
      });
    });
  });
});
