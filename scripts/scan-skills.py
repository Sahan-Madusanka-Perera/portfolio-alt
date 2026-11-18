#!/usr/bin/env python3
"""Scan the sibling project folders (../) for skills evidence.

For every top-level project folder it records:
  * lines of code by language (vendored, build and dependency folders skipped)
  * dependencies named in package.json, requirements*.txt, pyproject.toml,
    pom.xml, build.gradle(.kts), pubspec.yaml, Package.swift
  * infrastructure files (Dockerfile, compose, Terraform, Ansible, workflows)
  * git commits split into "mine" and "others" for every repo in the folder

Usage:  python3 scripts/scan-skills.py ../ > docs/skills-scan.json
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

SKIP_DIRS = {
    "node_modules", ".next", "dist", "build", "out", ".git", "venv", ".venv", "env",
    "__pycache__", "Pods", "DerivedData", ".gradle", ".expo", ".turbo", ".vercel",
    "coverage", "vendor", "site-packages", ".terraform", "target", ".idea", ".svelte-kit",
    ".astro", "playwright-report", "test-results", ".dart_tool", "ios/Pods", ".cache",
    "lib64", "bin", "obj", ".build", "public/vendor", "static/vendor", ".claude", ".agents",
}
# Project folders that are not mine or that the brief excludes.
EXCLUDED = {"GymLeveling", "Emotion_detector", "Sluice_UniversalDownloader", "AppSMS", "backup"}

LANG_BY_EXT = {
    ".ts": "TypeScript", ".tsx": "TypeScript", ".mts": "TypeScript",
    ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".py": "Python", ".ipynb": "Jupyter", ".swift": "Swift", ".kt": "Kotlin", ".kts": "Kotlin",
    ".java": "Java", ".php": "PHP", ".dart": "Dart", ".go": "Go", ".rs": "Rust",
    ".c": "C", ".h": "C", ".cpp": "C++", ".cc": "C++", ".hpp": "C++", ".cs": "C#", ".r": "R", ".R": "R",
    ".tf": "Terraform", ".sql": "SQL", ".sh": "Shell", ".bash": "Shell",
    ".css": "CSS", ".scss": "CSS", ".html": "HTML", ".astro": "Astro", ".vue": "Vue", ".svelte": "Svelte",
    ".pas": "Pascal", ".glsl": "GLSL", ".frag": "GLSL", ".vert": "GLSL",
}
MAX_FILE_BYTES = 1_500_000  # skip generated bundles / data dumps

MY_IDENTITIES = ("sahanpereraperera@gmail.com", "Sahan-Madusanka-Perera", "sahanperera@Sahans-MacBook-Pro.local")


def walk(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        rel = Path(dirpath).relative_to(root)
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIRS and not d.startswith(".venv") and str(rel / d) not in SKIP_DIRS
        ]
        for f in filenames:
            yield Path(dirpath) / f


def count_lines(path: Path) -> int:
    try:
        if path.stat().st_size > MAX_FILE_BYTES:
            return 0
        if path.suffix == ".ipynb":
            nb = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
            return sum(
                len(cell.get("source", [])) if isinstance(cell.get("source"), list) else str(cell.get("source", "")).count("\n") + 1
                for cell in nb.get("cells", []) if cell.get("cell_type") == "code"
            )
        with path.open("rb") as fh:
            return sum(1 for line in fh if line.strip())
    except Exception:
        return 0


def deps_from_package_json(path: Path) -> list[str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []
    out = []
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        out += list((data.get(key) or {}).keys())
    return out


def deps_from_requirements(path: Path) -> list[str]:
    out = []
    for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.split("#")[0].strip()
        if not line or line.startswith("-"):
            continue
        name = re.split(r"[<>=!~\[; ]", line, maxsplit=1)[0]
        if name:
            out.append(name.lower())
    return out


def deps_from_text(path: Path, pattern: str) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return re.findall(pattern, text)


def git_authorship(project: Path) -> dict:
    mine = others = 0
    other_names: Counter[str] = Counter()
    repos = []
    for dirpath, dirnames, _ in os.walk(project):
        if ".git" in dirnames:
            repos.append(Path(dirpath))
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for repo in repos:
        try:
            log = subprocess.run(
                ["git", "-C", str(repo), "log", "--format=%ae|%an"],
                capture_output=True, text=True, timeout=30,
            ).stdout.splitlines()
        except Exception:
            continue
        for row in log:
            if any(identity in row for identity in MY_IDENTITIES) or "Sahan Perera" in row:
                mine += 1
            elif "noreply@anthropic.com" in row or "[bot]" in row:
                continue  # AI pair / bots: not someone else's authorship
            else:
                others += 1
                other_names[row.split("|")[-1]] += 1
    return {
        "repos": [str(r.relative_to(project)) or "." for r in repos],
        "mine": mine,
        "others": others,
        "other_authors": dict(other_names.most_common(5)),
    }


def scan_project(project: Path) -> dict:
    lines: Counter[str] = Counter()
    deps: set[str] = set()
    infra: Counter[str] = Counter()
    manifests: list[str] = []
    for f in walk(project):
        name = f.name
        rel = str(f.relative_to(project))
        lang = LANG_BY_EXT.get(f.suffix)
        if lang:
            lines[lang] += count_lines(f)
        if name == "package.json":
            manifests.append(rel)
            deps.update(deps_from_package_json(f))
        elif re.match(r"requirements.*\.txt$", name):
            manifests.append(rel)
            deps.update(deps_from_requirements(f))
        elif name == "pyproject.toml":
            manifests.append(rel)
            deps.update(d.lower() for d in deps_from_text(f, r'^\s*"([A-Za-z0-9_.\-]+)'))
            deps.update(d.lower() for d in deps_from_text(f, r'\n([A-Za-z0-9_\-]+)\s*='))
        elif name == "pom.xml":
            manifests.append(rel)
            deps.update(deps_from_text(f, r"<artifactId>([^<]+)</artifactId>"))
        elif name in ("build.gradle", "build.gradle.kts"):
            manifests.append(rel)
            deps.update(deps_from_text(f, r'["\']([a-zA-Z0-9_.\-]+:[a-zA-Z0-9_.\-]+)'))
            deps.update(deps_from_text(f, r"libs\.([a-zA-Z0-9_.]+)"))
        elif name == "libs.versions.toml":
            deps.update(deps_from_text(f, r'module\s*=\s*"([^"]+)"'))
        elif name == "pubspec.yaml":
            manifests.append(rel)
            deps.add("flutter")
            deps.update(deps_from_text(f, r"^\s{2}([a-z_]+):"))
        elif name == "Package.swift":
            manifests.append(rel)
            deps.add("swiftpm")
        if name.startswith("Dockerfile"):
            infra["Dockerfile"] += 1
        elif re.match(r"(docker-)?compose.*\.ya?ml$", name):
            infra["Compose"] += 1
        elif f.suffix == ".tf":
            infra["Terraform"] += 1
        elif "/.github/workflows/" in "/" + rel and f.suffix in (".yml", ".yaml"):
            infra["GitHub Actions"] += 1
        elif "ansible" in rel.lower() and f.suffix in (".yml", ".yaml"):
            infra["Ansible"] += 1
        elif name == "vercel.json":
            infra["Vercel"] += 1
        elif name.endswith(".xcodeproj") or f.suffix == ".pbxproj":
            infra["Xcode"] += 1
        elif f.suffix == ".js" and "k6" in rel.lower():
            infra["k6"] += 1
    return {
        "lines": dict(lines.most_common()),
        "deps": sorted(deps),
        "infra": dict(infra),
        "manifests": manifests[:30],
        "git": git_authorship(project),
    }


def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "..").resolve()
    report = {}
    for project in sorted(p for p in root.iterdir() if p.is_dir() and not p.name.startswith(".")):
        if project.name in EXCLUDED:
            continue
        report[project.name] = scan_project(project)
    totals: dict[str, int] = defaultdict(int)
    for data in report.values():
        for lang, n in data["lines"].items():
            totals[lang] += n
    json.dump({"projects": report, "totals": dict(sorted(totals.items(), key=lambda kv: -kv[1]))}, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
