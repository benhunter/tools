# Tools

Published site: [`https://benhunter.github.io/tools/`](https://benhunter.github.io/tools/)

## Browser Tools

- [`file-manager.html`](file-manager.html) - Standalone browser file vault that stores, downloads, and deletes files using IndexedDB.
- [`csv-explorer.html`](csv-explorer.html) - Browser-based CSV explorer for loading local CSV files, searching and sorting rows, and calculating per-column statistics. Because it imports [`csv-explorer-core.js`](csv-explorer-core.js) as a native ES module, open it through a local HTTP server instead of a `file://` URL during local development: run `pnpm install`, then `pnpm start`, then open the Vite localhost landing page and choose CSV Explorer. For offline local use, run `pnpm build:csv-explorer:offline` and open `offline/csv-explorer.html` directly from disk.
- [`json-explorer.html`](json-explorer.html) - Browser-based JSON explorer for inspecting JSON with searchable tree and table views.

# CSV Explorer

## CSV Explorer Offline Build

Run `pnpm build:csv-explorer:offline` to generate a single-page offline build at
`offline/csv-explorer.html`. The generated file inlines the shared CSV
Explorer core code, so it can be opened directly with a `file://` URL without
starting the Vite server. This build is deterministic and does not change the
CSV Explorer version.

Use `pnpm bump` or `pnpm bump:patch` to increment the patch version, `pnpm
bump:minor` to increment the minor version, and `pnpm bump:major` to increment
the major version. Bump commands update `csv-explorer-version.js` and regenerate
`offline/csv-explorer.html`. The offline build is committed; rerun the
deterministic build command after source-only changes, or a bump command for a
versioned release.

## CSV Explorer Filter Semantics

The CSV Explorer core helpers apply table operations in this order: global search,
column filters, sorting, then row limit. Global search performs a
case-insensitive substring match across the provided headers.

Column filters also use case-insensitive substring matching. Empty filters are
ignored. On a single column, include filters are ORed together, exclude filters
supersede include filters, and a row is rejected if any exclude filter matches.
Across different columns, filters are ANDed together, so every filtered column
must pass. Missing or unknown cell values are treated as empty strings.

## CSV Explorer Roadmap

| Feature | Status | Notes |
| --- | --- | --- |
| Copy visible table as Markdown | Complete | Copies the table headers and currently visible rows as a Markdown table. |
| Copy visible table as CSV | Complete | Copies the table headers and currently visible rows as CSV. |
| Copy visible table as JSON | Complete | Copies the table headers and currently visible rows as JSON. |
| Save visible table as CSV file | Planned | Download the current visible table, using the active search, filters, sort order, and row limit, as a CSV file with the table headers included. |
| Filter shortcut buttons beside Column Values | Complete | Add include/exclude filter buttons beside each value in the "Column Profile - Top Values" table. The filter should be added to the current set of filters. |
| Paste from CSV | Planned | Replace the current data set with CSV content from the clipboard instead of requiring a file picker. Use the first row as headers and import the pasted rows as-is. |
| Paste from Markdown table | Planned | Replace the current data set with a Markdown table from the clipboard instead of requiring a file picker. Parse the first table in the pasted text and use its header row. |
| Paste from JSON | Planned | Replace the current data set with JSON content from the clipboard instead of requiring a file picker. Accept arrays of objects or a single object, add new columns as keys appear, and fill missing values with empty strings. |
| URL encode settings | Planned | Serialize the current search, filters, sort, row limit, and selected profile into the URL hash so the page can be bookmarked or shared and later restored. |
| Global table searches go into filters | Planned | Add a control that turns the current global search term into include filters for every visible column, rather than leaving it as a separate search-only state. |
| Global filters and column filters are displayed together | Planned | Show search-derived filters and column filters in the same active-filter list so the user sees one combined filter state. |
| Global table search excludes | Planned | Add a control that turns the current global search term into exclude filters for every visible column. |
| Filters manually ordered | Planned | Let the user reorder column filters explicitly, and apply filters in that user-defined order instead of an implicit sort order. |
| Filtered column values are sorted by frequency | Planned | Sort the "Column Profile - Top Values" table by frequency instead of lexicographically. |
| Filtered column values are paginated | Planned | Add pagination controls to the "Column Profile - Top Values" table so the user can see more than the top 10 values. |
| Filtered column values are searchable | Planned | Add a search box to the "Column Profile - Top Values" table so the user can find a specific value in a filtered column. |
| Hide empty columns | Planned | Add a control to hide columns that have no non-empty values in the current filtered data set. |
| Hide empty rows | Planned | Add a control to hide rows that have no non-empty values in the current filtered data set. |
| Show/hide columns | Planned | Add a control to show or hide specific columns in the current filtered data set. |

## CSV Explorer Manual QA checklist

> TODO: review this list against the journey tests.

Automated coverage for the core parser/filter helpers and the main browser
journey lives in [`tests/csv-explorer-core.test.js`](tests/csv-explorer-core.test.js)
and [`tests/e2e/csv-explorer.spec.js`](tests/e2e/csv-explorer.spec.js). Keep this
manual checklist focused on visual checks and interactions that are not covered
by those automated tests.

> Sample CSV: [`csv-explorer-sample.csv`](csv-explorer-sample.csv)

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

# Roadmap

| Feature | Status | Notes |
| --- | --- | --- |
| Offline CSV Explorer | Completed | Build and commit a self-contained html version of CSV Explorer for offline use.
| Deploy to GitHub Pages | Completed | Deploys `main` to `https://benhunter.github.io/tools/` with GitHub Actions.

# Deployment

GitHub Pages deploys from `main` using the workflow in
`.github/workflows/pages.yml`. The workflow installs dependencies, regenerates
the committed offline CSV Explorer build, runs the Node test suite, verifies
`offline/csv-explorer.html` is in sync, and publishes the repository root.
