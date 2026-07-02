# Tools

## Browser Tools

Published site: [`https://benhunter.github.io/tools/`](https://benhunter.github.io/tools/)

- [`file-manager.html`](file-manager.html) - Standalone browser file vault that stores, downloads, and deletes files using IndexedDB.
- [`csv-explorer.html`](csv-explorer.html) - Browser-based CSV explorer for loading local CSV files, searching and sorting rows, and calculating per-column statistics. Because it imports [`csv-explorer-core.js`](csv-explorer-core.js) as a native ES module, open it through a local HTTP server instead of a `file://` URL during local development: run `pnpm install`, then `pnpm start`, then open the Vite localhost landing page and choose CSV Explorer. For offline local use, run `pnpm build:csv-explorer:offline` and open `offline/csv-explorer.html` directly from disk.
- [`json-explorer.html`](json-explorer.html) - Browser-based JSON explorer for inspecting JSON with searchable tree and table views.

## CSV Explorer

### CSV Explorer offline build

Run `pnpm build:csv-explorer:offline` to generate a single-page offline build at
`offline/csv-explorer.html`. The generated file inlines the shared CSV
Explorer core code, so it can be opened directly with a `file://` URL without
starting the Vite server. The offline build is committed; rerun the build
command after changing CSV Explorer source files.

### CSV Explorer filter semantics

The CSV Explorer core helpers apply table operations in this order: global search,
column filters, sorting, then row limit. Global search performs a
case-insensitive substring match across the provided headers.

Column filters also use case-insensitive substring matching. Empty filters are
ignored. On a single column, include filters are ORed together, exclude filters
supersede include filters, and a row is rejected if any exclude filter matches.
Across different columns, filters are ANDed together, so every filtered column
must pass. Missing or unknown cell values are treated as empty strings.

### CSV Explorer roadmap

| Feature | Status | Notes |
| --- | --- | --- |
| Copy visible table as Markdown | Complete | Copies the table headers and currently visible rows as a Markdown table. |
| Copy visible table as CSV | Complete | Copies the table headers and currently visible rows as CSV. |
| Copy visible table as JSON | Complete | Copies the table headers and currently visible rows as JSON. |
| Save visible table as CSV file | Planned | Saves the table headers and currently visible rows as a CSV file. |

### CSV Explorer manual QA checklist

Automated coverage for the core parser/filter helpers and the main browser
journey lives in [`tests/csv-explorer-core.test.js`](tests/csv-explorer-core.test.js)
and [`tests/e2e/csv-explorer.spec.js`](tests/e2e/csv-explorer.spec.js). Keep this
manual checklist focused on visual checks and interactions that are not covered
by those automated tests.

Sample CSV: [`csv-explorer-sample.csv`](csv-explorer-sample.csv)

1. Start the local server with `pnpm start`, open the landing page, and choose
   **CSV Explorer**.
2. Load [`csv-explorer-sample.csv`](csv-explorer-sample.csv). Confirm the rows,
   detected delimiter, column list, all-column statistics, profile selector, and
   entire table appear.
3. Use global search for `Data`; confirm only Cora and Drew remain visible and
   the shown row count updates to `2`.
4. Sort the entire table by `Score`; confirm the sort label updates and scores
   sort numerically rather than lexicographically.
5. Set the row limit to `1,000`; confirm the displayed row count still reflects
   the current search result because the sample has fewer than 1,000 rows.
6. Click **Copy Markdown** and **Copy CSV**; paste each result into a text
   editor and confirm both include the headers and currently visible rows only.
7. Click a column name in the all-column statistics table; confirm the column
   profile section scrolls into view and shows top values plus KPIs for that
   column.
8. Change null tokens to include `Pending`, recompute stats, and confirm the
   `Status` column null count changes.
9. Clear search and reload the sample or load a different CSV file; confirm
   search text, sort order, row limit, selected profile, statistics, and row
   data reset for the new load.

## Roadmap

| Feature | Status | Notes |
| --- | --- | --- |
| Offline CSV Explorer | Completed | Build and commit a self-contained html version of CSV Explorer for offline use.
| Deploy to GitHub Pages | Completed | Deploys `main` to `https://benhunter.github.io/tools/` with GitHub Actions.

## Deployment

GitHub Pages deploys from `main` using the workflow in
`.github/workflows/pages.yml`. The workflow installs dependencies, regenerates
the committed offline CSV Explorer build, runs the Node test suite, verifies
`offline/csv-explorer.html` is in sync, and publishes the repository root.
