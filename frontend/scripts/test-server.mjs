// Isolated browser-test servers. Never reads the presenter's backend .env or database.
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const backend = resolve("../backend");
const python = join(
  backend,
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python",
);
const root = await mkdtemp(join(tmpdir(), "gstshield-browser-"));
const program = `import os
from pathlib import Path
import app.config as config
from app.config import Settings
from app.storage.local import LocalStore
from app.services.access import AccessService
from app.main import create_app
import uvicorn
for key in list(os.environ):
 if key.lower() in Settings.model_fields: del os.environ[key]
config.BACKEND_DIR=Path(os.environ["GSTSHIELD_TEST_ROOT"])
settings=Settings(_env_file=None,app_env="test",port=8027,public_api_url="http://127.0.0.1:8027",public_web_url="http://127.0.0.1:3000",read_requests_per_minute=5000,mutation_requests_per_minute=1000,import_requests_per_minute=100,max_imports_per_workspace=40)
store=LocalStore(settings)
store.acquire()
store.initialize()
access=AccessService(store)
user,ws=access.provision("alice","synthetic-passphrase-only","Synthetic demonstration")
access.add_registration(ws,"27ABCDE1234F1Z5","Synthetic company")
access.add_registration(ws,"29ABCDE1234F1Z5","Second registration")
other,second=access.provision("bob","synthetic-passphrase-only","Other workspace")
access.add_registration(second,"27ABCDE1234F1Z5","Other company")
access.grant("alice",second,"VIEWER")
store.close()
uvicorn.run(create_app(settings),host="127.0.0.1",port=8027,log_level="warning")`;
const api = spawn(python, ["-c", program], {
  cwd: backend,
  env: { ...process.env, GSTSHIELD_TEST_ROOT: root, PYTHONUTF8: "1" },
  stdio: "inherit",
  windowsHide: true,
});
const website = spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
  env: { ...process.env, VITE_API_BASE_URL: "http://127.0.0.1:8027" },
  stdio: "inherit",
  windowsHide: true,
});
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of [website, api]) {
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    else child.kill("SIGTERM");
  }
  await Promise.all(
    [website, api].map((child) =>
      child.exitCode === null && child.signalCode === null
        ? new Promise((resolve) => child.once("exit", resolve))
        : Promise.resolve(),
    ),
  );
  await rm(root, { recursive: true, force: true });
  process.exit();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
api.on("exit", () => {
  if (!stopping) void stop();
});
website.on("exit", () => {
  if (!stopping) void stop();
});
