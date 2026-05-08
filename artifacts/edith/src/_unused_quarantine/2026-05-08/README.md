# Unused File Quarantine (2026-05-08)

These files were moved from active source paths into this quarantine folder after static usage analysis.

## Why quarantine instead of delete
- Prevent accidental functional regressions.
- Keep rollback trivial.
- Allow post-cleanup soak testing before permanent deletion.

## Included list
See `moved_files_manifest.txt` for the exact set moved in this cleanup.

## Restore procedure
From `artifacts/edith`:

```bash
while IFS= read -r rel; do
  src="src/_unused_quarantine/2026-05-08/${rel#src/}"
  dest="$rel"
  mkdir -p "$(dirname "$dest")"
  mv "$src" "$dest"
done < src/_unused_quarantine/2026-05-08/moved_files_manifest.txt
```

## Permanent delete procedure (after soak)
After sufficient validation in staging/production:

```bash
rm -rf src/_unused_quarantine/2026-05-08
```
