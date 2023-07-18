# vite-plugin-svelte-purgecss

## 0.2.0

### Minor Changes

- 2a87412: Parses and walks the ASTs of the generated chunks, only extracting selectors for string literals and identifiers.

## 0.1.2

### Patch Changes

- 0cc5c82: Removed redundant reading of source files

## 0.1.1

### Patch Changes

- dbca34c: Fixed README

## 0.1.0

### Minor Changes

- 48cc086: Overhauled the extractors and simplified it down to just use Tailwind's default extractor

## 0.0.3

### Patch Changes

- 0599d7a: Added html parser for entry html file (app.html)
- 0599d7a: Added JS parser for emitted chunks

## 0.0.2

### Patch Changes

- fix: scans for tailwind classes in `app.html`
