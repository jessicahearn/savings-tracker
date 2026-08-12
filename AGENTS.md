# Agent/Automation Access Guide

## GitHub

**Repository:** https://github.com/jessicahearn/savings-tracker (private)

**Authentication:**
- Method: SSH via GitHub CLI (`gh` CLI)
- User account: `jessicahearn`
- Verify access: `gh auth status`
- Expected scopes: `repo` (and others)

**Key workflows:**
- Create a private repo: `gh repo create savings-tracker --private --source=. --remote=origin --push`
- Push to main: `git push origin main`
- Create a PR: `gh pr create --title "..." --body "..."`
- List PRs: `gh pr list`

**Git configuration:**
- SSH protocol is configured
- SSH key is stored in system keyring
- No additional setup needed — `gh` CLI is the primary interface

**Notes for future sessions:**
- If `gh auth status` fails, run `gh auth login` and select "Authenticate with GitHub using SSH"
- The repo is private; ensure any pushes include meaningful commit messages with co-author line:
  ```
  Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
  ```
- Before major work, pull latest: `git pull origin main`
