#!/bin/bash
#
# Quick Git Reference Script
# Provides shortcuts for common git operations
#

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}Git Quick Reference${NC}"
    echo ""
    echo -e "${YELLOW}Branch Operations:${NC}"
    echo "  ./git-help.sh new <branch-name>     - Create and switch to new branch"
    echo "  ./git-help.sh switch <branch>       - Switch to branch"
    echo "  ./git-help.sh list                  - List all branches"
    echo "  ./git-help.sh delete <branch>       - Delete branch"
    echo ""
    echo -e "${YELLOW}Commit Operations:${NC}"
    echo "  ./git-help.sh save <message>        - Stage all and commit"
    echo "  ./git-help.sh push                  - Push current branch"
    echo "  ./git-help.sh sync                  - Pull latest from origin"
    echo ""
    echo -e "${YELLOW}Status & Info:${NC}"
    echo "  ./git-help.sh status                - Show git status"
    echo "  ./git-help.sh log                   - Show commit log"
    echo "  ./git-help.sh diff                  - Show unstaged changes"
    echo ""
    echo -e "${YELLOW}Feature Workflow:${NC}"
    echo "  ./git-help.sh feature <name>        - Create feature branch and switch"
    echo "  ./git-help.sh finish                - Merge current branch to main"
    echo ""
}

case "$1" in
    new)
        if [ -z "$2" ]; then
            echo "Usage: ./git-help.sh new <branch-name>"
            exit 1
        fi
        git checkout -b "$2"
        ;;
    switch)
        if [ -z "$2" ]; then
            echo "Usage: ./git-help.sh switch <branch-name>"
            exit 1
        fi
        git checkout "$2"
        ;;
    list)
        echo -e "${BLUE}Local branches:${NC}"
        git branch
        echo -e "${BLUE}Remote branches:${NC}"
        git branch -r
        ;;
    delete)
        if [ -z "$2" ]; then
            echo "Usage: ./git-help.sh delete <branch-name>"
            exit 1
        fi
        read -p "Delete branch '$2'? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -d "$2"
        fi
        ;;
    save)
        if [ -z "$2" ]; then
            echo "Usage: ./git-help.sh save \"commit message\""
            exit 1
        fi
        git add .
        git commit -m "$2"
        ;;
    push)
        current_branch=$(git branch --show-current)
        echo -e "${YELLOW}Pushing $current_branch to origin...${NC}"
        git push origin "$current_branch"
        ;;
    sync)
        current_branch=$(git branch --show-current)
        echo -e "${YELLOW}Syncing $current_branch with origin...${NC}"
        git pull origin "$current_branch"
        ;;
    status)
        git status
        ;;
    log)
        git log --oneline --graph --all --decorate -20
        ;;
    diff)
        git diff
        ;;
    feature)
        if [ -z "$2" ]; then
            echo "Usage: ./git-help.sh feature <feature-name>"
            exit 1
        fi
        branch_name="feature/$2"
        echo -e "${YELLOW}Creating feature branch: $branch_name${NC}"
        git checkout -b "$branch_name"
        ;;
    finish)
        current_branch=$(git branch --show-current)
        if [ "$current_branch" = "main" ]; then
            echo -e "${RED}Error: Cannot finish on main branch${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Finishing feature: $current_branch${NC}"
        echo -e "${YELLOW}Switching to main...${NC}"
        git checkout main
        echo -e "${YELLOW}Merging $current_branch...${NC}"
        git merge "$current_branch"
        echo -e "${YELLOW}Pushing to origin...${NC}"
        git push origin main
        read -p "Delete branch '$current_branch'? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git branch -d "$current_branch"
            git push origin --delete "$current_branch" 2>/dev/null
        fi
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run './git-help.sh help' for usage"
        exit 1
        ;;
esac

