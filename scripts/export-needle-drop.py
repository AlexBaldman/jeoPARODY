#!/usr/bin/env python3
"""One-time, non-destructive Needle Drop extraction from committed Git objects."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--ref", default="HEAD", help="reviewed source commit; ignores uncommitted files")
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.exists() or destination == ROOT or ROOT in destination.parents:
        parser.error("destination must be new and outside the source repository")
    sha = git("rev-parse", "--verify", f"{args.ref}^{{commit}}").decode().strip()
    paths = git("ls-tree", "-rz", "--name-only", sha).decode().split("\0")
    prefixes = ("src/modes/needle-drop/", "tests/needle-drop/")
    required = {
        "needle-drop.html", "babel.config.cjs",
        "scripts/needle-drop-runtime-check.mjs",
        "scripts/validate-needle-drop-content.mjs",
        "docs/NEEDLE_DROP_ARCHITECTURE.md",
    }
    if not required.issubset(paths):
        parser.error("source commit does not contain the complete extraction inputs")
    selected = sorted(p for p in paths if p.startswith(prefixes) or p in required)
    contents = {p: git("show", f"{sha}:{p}") for p in selected}
    lock = json.loads(git("show", f"{sha}:package-lock.json"))
    dependencies = {
        name: lock["packages"][f"node_modules/{name}"]["version"]
        for name in ("vite", "jest", "jest-environment-jsdom", "babel-jest", "@babel/preset-env")
    }
    # Match the existing browser proof's known working Playwright version.
    dependencies["playwright"] = "1.55.0"
    destination.mkdir(parents=True)
    for relative, data in contents.items():
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    def write(relative, text):
        (destination / relative).write_text(text)

    write("index.html", contents["needle-drop.html"].decode())
    write("package.json", json.dumps({
        "name": "needle-drop", "version": "0.1.0", "private": True, "type": "module",
        "engines": {"node": ">=24 <25"},
        "scripts": {
            "dev": "vite", "build": "vite build", "preview": "vite preview",
            "test": "jest --runInBand",
            "validate": "node scripts/validate-needle-drop-content.mjs",
            "runtime:check": "node scripts/needle-drop-runtime-check.mjs",
        },
        "devDependencies": dependencies,
    }, indent=2) + "\n")
    write("vite.config.js", "import { defineConfig } from 'vite';\n"
          "export default defineConfig({ base: './', build: { rollupOptions: { "
          "input: { main: 'index.html', compatibility: 'needle-drop.html' } } } });\n")
    write("jest.config.js", "export default { testEnvironment: 'jsdom', "
          "testMatch: ['**/tests/needle-drop/*.test.js'], "
          "transform: { '^.+\\\\.jsx?$': 'babel-jest' } };\n")
    write(".gitignore", "node_modules/\ndist/\nscreenshots/\n")
    write("EXTRACTION.json", json.dumps({
        "sourceRepository": "AlexBaldman/jeoPARODY", "sourceCommit": sha,
        "copiedFiles": {p: hashlib.sha256(b).hexdigest() for p, b in contents.items()},
        "generatedFiles": ["index.html", "package.json", "vite.config.js", "jest.config.js", ".gitignore", "README.md"],
        "note": "Copied source is byte-preserved. Generated packaging requires destination lockfile and release proof.",
    }, indent=2) + "\n")
    write("README.md", "# Needle Drop\n\nIndependent music-recognition game.\n\n"
          f"Extracted from AlexBaldman/jeoPARODY commit `{sha}`; see EXTRACTION.json for source hashes.\n\n"
          "Run `npm install --package-lock-only`, review and commit the lockfile, then `npm ci`, "
          "`npm test`, `npm run validate`, and `npm run build`. Install Chromium with "
          "`npx playwright install chromium`, start `npm run preview -- --host 127.0.0.1`, "
          "then run `npm run runtime:check` in another terminal.\n\n"
          "This is an extraction candidate, not a deployed release. Add a destination-owned CI workflow "
          "with these gates and accessibility proof before cutover. Preserve content provenance, "
          "personal-best storage behavior and existing URLs; see docs/NEEDLE_DROP_ARCHITECTURE.md.\n")
    print(f"Exported {len(contents)} source files from {sha} to {destination}")
    print("Source repository unchanged. Review packaging, generate the lockfile and run destination proof.")


if __name__ == "__main__":
    main()
