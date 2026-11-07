// Keeps the dev server (kit/tools/serve.mjs) running all the time on macOS, as a launchd
// agent: it starts at login and is restarted if it stops.
//
//   npm run service:install     install (or reinstall, e.g. after changing serve.mjs) and start it
//   npm run service:uninstall   stop it and remove it
//   npm run service:status      whether it's running
//
// Output goes to ~/Library/Logs/<package name>.log.
import { writeFile, rm, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(kit); // the project: package.json, game/, kit/
// Named after the project's package.json, so each project gets its own service.
const NAME = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).name.replace(/[^\w.-]/g, '-');
const LABEL = `local.${NAME}.server`;
const plist = path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);
const log = path.join(os.homedir(), 'Library', 'Logs', `${NAME}.log`);
const domain = `gui/${process.getuid()}`;
// The `node` on PATH (e.g. Homebrew's /opt/homebrew/bin/node), not process.execPath, which
// points into a versioned folder that goes away when node is upgraded.
const node = (() => {
  try {
    return execFileSync('/bin/sh', ['-c', 'command -v node'], { encoding: 'utf8' }).trim() || process.execPath;
  } catch {
    return process.execPath;
  }
})();

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const launchctl = (...args) => {
  try {
    return execFileSync('launchctl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return null;
  }
};

async function install() {
  await mkdir(path.dirname(plist), { recursive: true });
  await mkdir(path.dirname(log), { recursive: true });
  await writeFile(plist, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${esc(node)}</string>
    <string>${esc(path.join(kit, 'tools', 'serve.mjs'))}</string>
  </array>
  <key>WorkingDirectory</key><string>${esc(root)}</string>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>5</integer>
  <key>StandardOutPath</key><string>${esc(log)}</string>
  <key>StandardErrorPath</key><string>${esc(log)}</string>
</dict>
</plist>
`);
  launchctl('bootout', `${domain}/${LABEL}`);
  if (launchctl('bootstrap', domain, plist) === null) throw new Error(`launchctl couldn't load ${plist}`);
  console.log(`Installed. The server starts at login and restarts if it stops.\nLog: ${log}`);
}

async function uninstall() {
  launchctl('bootout', `${domain}/${LABEL}`);
  await rm(plist, { force: true });
  console.log('Removed. Use npm start to run the server by hand.');
}

function status() {
  const out = launchctl('print', `${domain}/${LABEL}`);
  if (!out) return console.log('Not installed. Run npm run service:install.');
  const state = out.match(/^\s*state = (.*)$/m)?.[1] ?? 'unknown';
  const pid = out.match(/^\s*pid = (\d+)/m)?.[1];
  console.log(`${LABEL}: ${state}${pid ? ` (pid ${pid})` : ''}\nLog: ${log}`);
}

const cmd = process.argv[2];
if (cmd === 'install') await install();
else if (cmd === 'uninstall') await uninstall();
else if (cmd === 'status') status();
else {
  console.error('Usage: node kit/tools/service.mjs install|uninstall|status');
  process.exit(1);
}
