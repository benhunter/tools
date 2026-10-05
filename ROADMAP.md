# Roadmap

Preserve the project's lightweight, local-first design and standalone HTML tools. These recommendations come from the project review; all items below are pending.

## 1. Security and data integrity

### Safe File Vault rendering

- [ ] Replace filename interpolation into `innerHTML` in `file-manager.html` with DOM APIs.
- [ ] Set filenames through `textContent` and the download link's `download` property.
- [ ] Add regression tests for filenames containing HTML and attribute-special characters.

### Correct CSV column handling

- [ ] Preserve column positions when headers are blank. Currently, `a,,c` with `1,2,3` incorrectly assigns `2` to `c`.
- [ ] Generate unique names for blank/duplicate headers, or reject ambiguous headers with a clear error rather than silently overwriting values.
- [ ] Use prototype-safe dictionaries for rows and filters, including headers such as `__proto__` and `constructor`.
- [ ] Add regression tests for blank, duplicate, and special-property headers.

### Valid JSON root values

- [ ] Separate loaded state from the JSON value so a valid `null` document renders correctly.
- [ ] Reset controls and state consistently after failed imports.
- [ ] Test valid primitive roots and transitions between successful and failed imports.

## 2. Tests and continuous integration

### Update landing-page tests

- [ ] Update `tests/e2e/csv-explorer.spec.js` to expect the current `Tools` heading and linked tool titles rather than the old `Open` links.
- [ ] Cover all five tool cards and their destinations.

### Broaden automated validation

- [ ] Run browser tests in CI alongside the Node suite.
- [ ] Add pull-request validation; keep deployment restricted to the appropriate branch.
- [ ] Add browser coverage for File Vault storage, downloads, and deletion.
- [ ] Add JSON Explorer import, search, sorting, and export coverage.
- [ ] Test word-generator category and length filters.
- [ ] Test toolkit draft saving, restoration, and clearing.
- [ ] Cover malformed files, unusual column names, denied clipboard access, and unavailable browser storage.
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

1. Filename injection protection.
2. CSV data-integrity fixes and JSON root-value correctness.
3. Updated tests and CI coverage.
4. Storage and clipboard reliability.
5. Accessibility, performance, maintainability, and documentation improvements.

## Review baseline

At review time, all 45 Node tests passed and local HTML links resolved. Browser tests were not run because dependencies were not installed. Passing existing tests does not cover the gaps listed above.
