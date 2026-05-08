#!/usr/bin/env python3
import os
import re
import argparse

EXTS = ['.ts', '.tsx', '.js', '.jsx']
IMPORT_RE = re.compile(r"(?:from|import)\s+['\"]([^'\"]+)['\"]")
DYN_IMPORT_RE = re.compile(r"import\(['\"]([^'\"]+)['\"]\)")


def collect_files(src):
    files = []
    for root, dirs, filenames in os.walk(src):
        for f in filenames:
            if any(f.endswith(e) for e in EXTS):
                files.append(os.path.join(root, f))
    return files


def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            return fh.read()
    except Exception:
        return ''


def resolve_spec(spec, importer_dir, src_root):
    # Handle relative imports and @/ alias imports.
    cand = None
    if spec.startswith('.'):
        cand = os.path.normpath(os.path.join(importer_dir, spec))
    elif spec.startswith('@/'):
        cand = os.path.normpath(os.path.join(src_root, spec[2:]))
    else:
        return None
    # try file with extensions
    for ext in EXTS:
        p = cand + ext
        if os.path.isfile(p) and p.startswith(src_root):
            return os.path.normpath(p)
    # try index files
    for ext in EXTS:
        p = os.path.join(cand, 'index' + ext)
        if os.path.isfile(p) and p.startswith(src_root):
            return os.path.normpath(p)
    return None


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--src', required=True)
    p.add_argument('--out', required=True)
    args = p.parse_args()
    src = os.path.normpath(args.src)
    files = collect_files(src)
    files_set = set(map(os.path.normpath, files))

    referenced = set()

    for f in files:
        txt = read_file(f)
        importer_dir = os.path.dirname(f)
        for m in IMPORT_RE.findall(txt) + DYN_IMPORT_RE.findall(txt):
            resolved = resolve_spec(m, importer_dir, src)
            if resolved:
                referenced.add(os.path.normpath(resolved))

    # Exempt common entrypoints and obvious files
    exemptions = set()
    for name in ('main.tsx','main.ts','App.tsx','App.ts','index.tsx','index.ts'):
        for root in (src,):
            pth = os.path.join(root, name)
            if os.path.isfile(pth):
                exemptions.add(os.path.normpath(pth))

    candidates = sorted(list(files_set - referenced - exemptions))

    with open(args.out, 'w', encoding='utf-8') as out:
        for c in candidates:
            out.write(os.path.relpath(c, start=os.path.dirname(args.out)) + '\n')

    print(f"Found {len(candidates)} candidate unused files. Written to {args.out}")

if __name__ == '__main__':
    main()
