# Agent/Automation Access Guide

## GitHub

**Repository:** https://github.com/jessicahearn/savings-tracker (public)

**Authentication:**
- Method: SSH via GitHub CLI (`gh` CLI)
- User account: `jessicahearn`
- Verify access: `gh auth status`
- Expected scopes: `repo` (and others)

**Key workflows:**
- Push to main: `git push origin main`
- Create a PR: `gh pr create --title "..." --body "..."`
- List PRs: `gh pr list`

**Git configuration:**
- SSH protocol is configured
- SSH key is stored in system keyring
- No additional setup needed — `gh` CLI is the primary interface

**Notes for future sessions:**
- If `gh auth status` fails, run `gh auth login` and select "Authenticate with GitHub using SSH"
- **The repo is public.** Never commit real credentials, connection strings, hostnames or
  LAN addresses. Secrets belong in the gitignored `.env` / `.env.prod`; `.env.example`
  holds placeholders only.
- Include meaningful commit messages with a co-author line:
  ```
  Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
  ```
- Before major work, pull latest: `git pull origin main`
