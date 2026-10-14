# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `benhunter/tools`.
Use the `gh` CLI.

- Publish a spec: `gh issue create --title "..." --body-file <file>`.
- Read a ticket: `gh issue view <number> --json number,title,body,labels,comments`.
- List tickets: `gh issue list --state open`.
- Comment: `gh issue comment <number> --body-file <file>`.
- Apply/remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number> --comment "..."`.

Use the label mapping in `docs/agents/triage-labels.md`.

## Pull requests as a triage surface

PRs as a request surface: no.
