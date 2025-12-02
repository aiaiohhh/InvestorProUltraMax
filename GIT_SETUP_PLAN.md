# Git Version Control Setup Plan

## Current State Assessment

✅ **Already Configured:**
- Git repository initialized
- Remote repository connected: `https://github.com/aiaiohhh/InvestorProUltraMax.git`
- Branch: `main` (tracking `origin/main`)
- `.gitignore` file exists
- Initial commit present
- Working tree is clean

## 1. Git Configuration Setup

### 1.1 User Identity Configuration
If not already set globally, configure your git identity:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.2 Local Repository Configuration (Optional)
For project-specific settings:
```bash
git config --local user.name "Your Name"  # Override for this repo only
git config --local user.email "your.email@example.com"
```

### 1.3 Useful Git Aliases (Optional)
Add helpful shortcuts:
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

## 2. Enhanced .gitignore Configuration

### Current .gitignore includes:
- `node_modules/`
- `.next/`
- `.DS_Store`
- `*.log`
- `.env*.local`

### Recommended Additions:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env*.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Vercel
.vercel

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## 3. Branching Strategy

### 3.1 Recommended Workflow: Git Flow (Simplified)

**Main Branches:**
- `main` - Production-ready code (always deployable)
- `develop` - Integration branch for features (optional)

**Supporting Branches:**
- `feature/*` - New features (e.g., `feature/user-authentication`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/portfolio-calculation`)
- `hotfix/*` - Critical production fixes (e.g., `hotfix/security-patch`)
- `release/*` - Preparing new releases (e.g., `release/v1.1.0`)

### 3.2 Branch Naming Conventions
```
feature/description-of-feature
bugfix/description-of-bug
hotfix/description-of-fix
release/version-number
chore/description-of-task
refactor/description-of-refactor
```

## 4. Commit Message Conventions

### 4.1 Conventional Commits Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 4.2 Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### 4.3 Examples
```
feat(auth): add user authentication modal
fix(portfolio): correct calculation for total value
docs(readme): update installation instructions
refactor(charts): simplify chart component structure
style(ui): format code with prettier
```

## 5. Daily Git Workflow

### 5.1 Starting Work on a Feature
```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat(scope): description of changes"
```

### 5.2 Regular Commits
```bash
# Check status
git status

# Stage changes
git add <file>              # Specific file
git add .                   # All changes

# Commit with message
git commit -m "type(scope): clear description"

# Push to remote
git push origin feature/your-feature-name
```

### 5.3 Syncing with Remote
```bash
# Fetch latest changes
git fetch origin

# Merge remote changes
git pull origin main

# Or rebase (cleaner history)
git pull --rebase origin main
```

### 5.4 Completing a Feature
```bash
# 1. Ensure all changes are committed
git status

# 2. Push feature branch
git push origin feature/your-feature-name

# 3. Create Pull Request on GitHub (recommended)
# OR merge locally:
git checkout main
git merge feature/your-feature-name
git push origin main

# 4. Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 6. Git Hooks (Optional but Recommended)

### 6.1 Pre-commit Hook
Create `.git/hooks/pre-commit` to:
- Run linter
- Run tests
- Check commit message format

### 6.2 Commit-msg Hook
Validate commit message format

### 6.3 Pre-push Hook
Run full test suite before pushing

## 7. Best Practices

### 7.1 Commit Guidelines
- ✅ Make small, focused commits
- ✅ Write clear, descriptive commit messages
- ✅ Commit related changes together
- ✅ Don't commit broken code
- ❌ Don't commit sensitive data (API keys, passwords)
- ❌ Don't commit generated files
- ❌ Don't commit large binary files

### 7.2 Branch Management
- ✅ Keep branches short-lived
- ✅ Delete merged branches
- ✅ Keep main branch stable
- ✅ Use descriptive branch names

### 7.3 Pull Requests (if using GitHub)
- ✅ Write clear PR descriptions
- ✅ Request code reviews
- ✅ Link related issues
- ✅ Keep PRs focused and small

## 8. Troubleshooting Common Issues

### 8.1 Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### 8.2 Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### 8.3 Unstage Files
```bash
git reset HEAD <file>
```

### 8.4 Discard Local Changes
```bash
git checkout -- <file>
```

### 8.5 View Commit History
```bash
git log --oneline --graph --all
```

### 8.6 Find Lost Commits
```bash
git reflog
```

## 9. Next Steps

1. **Review and enhance .gitignore** - Add any project-specific ignores
2. **Set up user identity** - Configure git config if not done
3. **Create develop branch** (optional) - For feature integration
4. **Set up Git hooks** (optional) - For automated checks
5. **Document team workflow** - Share this plan with team members
6. **Set up branch protection** (on GitHub) - Protect main branch

## 10. Useful Commands Reference

```bash
# Status and information
git status
git log --oneline --graph --all
git diff
git show <commit-hash>

# Branching
git branch
git branch -a
git checkout -b <branch-name>
git branch -d <branch-name>

# Staging and committing
git add <file>
git add .
git commit -m "message"
git commit --amend

# Remote operations
git fetch
git pull
git push
git push -u origin <branch-name>

# Merging
git merge <branch-name>
git merge --no-ff <branch-name>  # Preserve branch history

# Rebasing
git rebase <branch-name>
git rebase -i HEAD~3  # Interactive rebase

# Stashing (temporary save)
git stash
git stash list
git stash pop
git stash apply
```

---

**Note:** This plan assumes you're working with a Next.js/React TypeScript project. Adjust as needed for your specific requirements.

