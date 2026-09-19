"""Create a source-only release archive without credentials or Git history."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist" / "ruma-studio-source.zip"
EXCLUDED_DIRS = {".git", "node_modules", ".next", "__pycache__", ".pytest_cache", ".venv", "venv", "uploads", "dist", "out"}
SOURCE_ROOTS = {"frontend", "backend", ".github", "scripts"}
ROOT_FILES = {"README.md", "CONTRIBUTING.md", "SECURITY.md", "LICENSE", "USER_GUIDE.html", ".gitignore", ".gitattributes", ".env.example"}


def release_files():
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if any(part in EXCLUDED_DIRS for part in relative.parts):
            continue
        if len(relative.parts) == 1 and path.name not in ROOT_FILES:
            continue
        if len(relative.parts) > 1 and relative.parts[0] not in SOURCE_ROOTS:
            continue
        if path.name.startswith(".env") and path.name != ".env.example":
            continue
        if path.suffix in {".pyc", ".log", ".tsbuildinfo"} or path.name == "proposals.json":
            continue
        yield path, relative


if __name__ == "__main__":
    OUTPUT.parent.mkdir(exist_ok=True)
    files = list(release_files())
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as archive:
        for path, relative in files:
            archive.write(path, Path("ruma-studio") / relative)
    print(f"Created {OUTPUT} ({len(files)} source files)")
