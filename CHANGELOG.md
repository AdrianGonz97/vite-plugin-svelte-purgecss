# vite-plugin-svelte-purgecss

## 0.2.6

### Patch Changes

- a2ee4bd: Updated README to notify that this package has been moved to [`vite-plugin-tailwind-purge`](https://github.com/AdrianGonz97/vite-plugin-tailwind-purge)

## 0.2.5

### Patch Changes

- f1855f5: Added `estree-walker` to dependencies

## 0.2.4

### Patch Changes

- 7c86cbf: `PurgeOptions` shouldn't allow `css` property to be modified

## 0.2.3

### Patch Changes

- 376491b: All purge options are now extendable

## 0.2.2

### Patch Changes

- 35b93c8: Fixed types for purge options

## 0.2.1

### Patch Changes

- d20431a: Removed leftover log

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
