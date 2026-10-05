# Roadmap

Preserve the project's lightweight, local-first design and standalone HTML tools. These recommendations come from the project review; checked items are complete.

## 1. Security and data integrity

### Safe File Vault rendering

- [x] Replace filename interpolation into `innerHTML` in `file-manager.html` with DOM APIs.
- [x] Set filenames through `textContent` and the download link's `download` property.
- [x] Add regression tests for filenames containing HTML and attribute-special characters.

### Correct CSV column handling

- [ ] Preserve column positions when headers are blank. Currently, `a,,c` with `1,2,3` incorrectly assigns `2` to `c`.
- [ ] Generate unique names for blank/duplicate headers, or reject ambiguous headers with a clear error rather than silently overwriting values.
- [x] Use prototype-safe property creation and dictionaries for CSV rows, exports, and filters, including headers such as `__proto__` and `constructor`.
- [x] Harden JSON array-table rows against prototype mutation and inherited cell values.
- [x] Add regression tests for special-property headers and JSON keys.
- [ ] Add regression tests for blank and duplicate headers.

### Valid JSON root values

- [ ] Separate loaded state from the JSON value so a valid `null` document renders correctly.
- [ ] Reset controls and state consistently after failed imports.
- [ ] Test valid primitive roots and transitions between successful and failed imports.

## 2. Tests and continuous integration

### Update landing-page tests

- [x] Update `tests/e2e/csv-explorer.spec.js` to expect the current `Tools` heading and linked tool titles rather than the old `Open` links.
- [x] Cover all five tool cards and their destinations.

### Broaden automated validation

- [ ] Run browser tests in CI alongside the Node suite.
- [ ] Add pull-request validation; keep deployment restricted to the appropriate branch.
- [x] Add browser coverage for File Vault storage, downloads, and deletion, including persistence across reloads and hostile filenames.
- [ ] Add JSON Explorer import, search, sorting, and export coverage.
- [ ] Test word-generator category and length filters.
- [ ] Test toolkit draft saving, restoration, and clearing.
- [x] Cover special-property column names in CSV imports, filters, and exports, plus JSON array-table keys.
- [ ] Cover malformed files, denied clipboard access, and unavailable browser storage.
- [ ] Make local-link validation a permanent automated check, particularly for directory reorganizations.

## 3. Storage and browser API reliability

### Toolkit drafts and clipboard

- [ ] Catch storage write/removal failures and present actionable save status.
- [ ] Handle clipboard unavailability and permission failures without unhandled errors.
- [ ] Flush pending draft changes on page exit where possible, rather than relying solely on the 400 ms debounce.
- [ ] Cancel pending save timers when clearing a draft.

### File Vault lifecycle

- [ ] Disable uploads until IndexedDB is ready.
- [ ] Report successful saves only after transaction completion, not just request success.
- [ ] Handle transaction failures for saving, reading, and deletion.
- [ ] Revoke obsolete blob URLs when refreshing the file list.
- [ ] Explain that browser storage can be cleared or evicted and is not a backup.

## 4. Large-file performance

### JSON Explorer

- [ ] Debounce search input.
- [ ] Render only the active view rather than rebuilding the full tree, tables, and raw JSON on every keystroke.
- [ ] Add pagination or bounded rendering for large result sets.
- [ ] Show file-size warnings before expensive processing.

### CSV Explorer

- [ ] Add pagination or bounded rendering to limit DOM growth beyond the existing chunked rendering.
- [ ] Show file-size warnings before expensive processing.
- [ ] Evaluate Web Workers for CSV parsing/statistics and expensive JSON processing to keep the interface responsive.

## 5. Maintainability

### Shared toolkit source, standalone output

- [ ] Maintain one readable template/runtime plus exercise metadata instead of 33 duplicated implementations.
- [ ] Generate self-contained HTML pages so downloadable and offline use remain supported.
- [ ] Add a deterministic build and committed-output consistency check, following CSV Explorer's existing pattern.

## 6. Accessibility and navigation

- [ ] Replace click-only CSV and JSON sorting headers with buttons inside table headers.
- [ ] Expose sorting state through `aria-sort`.
- [ ] Give JSON Explorer tabs appropriate tab semantics and keyboard navigation.
- [ ] Add accessible control labels and live status announcements where missing.
- [ ] Add consistent “All tools” navigation without compromising standalone use.

## 7. Documentation and deployment

- [ ] Add Random Word Generator and Creative Thinker's Toolkit to the main `README.md` tool list.
- [ ] Reconcile the CSV roadmap with the implementation: top values are already frequency-sorted and capped at 25, contrary to the existing description.
- [ ] Publish an explicit static-site output directory rather than the entire repository root.

## Recommended implementation order

1. Remaining CSV data-integrity fixes and JSON root-value correctness.
2. Broader test coverage and CI validation.
3. Storage and clipboard reliability.
4. Accessibility, performance, maintainability, and documentation improvements.

## Review baseline

At review time, all 45 Node tests passed and local HTML links resolved. Browser tests were not run because dependencies were not installed.

## Latest verification

- All 48 Node tests passed after the security fixes, including offline-build consistency checks.
- All 16 end-to-end tests passed after updating the landing-page test; no tests were excluded.
- Security regression coverage includes hostile filenames, File Vault downloads/deletion, prototype-sensitive CSV headers in both regular and offline builds, and JSON array-table keys.

Passing existing tests does not cover the remaining gaps listed above.
