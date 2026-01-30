#!/bin/bash

# CoachBase Deployment Script
# Usage:
#   ./deploy.sh       - Deploy to develop (Vercel Preview)
#   ./deploy.sh prod  - Deploy to production (merge to main, Vercel Production)

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CoachBase Deployment Script${NC}\n"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Function to deploy to develop
deploy_develop() {
    echo -e "${YELLOW}📦 Deploying to DEVELOP (Preview)...${NC}\n"

    # Make sure we're on develop
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "develop" ]; then
        echo "Switching to develop branch..."
        git checkout develop
    fi

    # Check if there are any changes
    if git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}No changes to commit${NC}"
    else
        # Stage all changes
        git add -A

        # Get commit message from user
        echo "Enter commit message (or press Enter for auto-generated message):"
        read -r commit_msg

        if [ -z "$commit_msg" ]; then
            commit_msg="Update: $(date '+%Y-%m-%d %H:%M:%S')"
        fi

        # Commit changes
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi

    # Push to develop
    echo "Pushing to develop..."
    git push origin develop

    echo -e "\n${GREEN}✓ Successfully deployed to DEVELOP${NC}"
    echo -e "${BLUE}→ Vercel will automatically create a preview deployment${NC}"
    echo -e "${BLUE}→ Check your Vercel dashboard for the preview URL${NC}\n"
}

# Function to deploy to production
deploy_production() {
    echo -e "${YELLOW}🚨 Deploying to PRODUCTION...${NC}\n"

    # Confirm production deployment
    echo -e "${RED}WARNING: This will deploy to PRODUCTION!${NC}"
    echo "Are you sure you want to continue? (yes/no)"
    read -r confirm

    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Production deployment cancelled${NC}"
        exit 0
    fi

    # Save current branch
    current_branch=$(git branch --show-current)

    # Switch to main
    echo "Switching to main branch..."
    git checkout main

    # Pull latest main
    echo "Pulling latest main..."
    git pull origin main

    # Merge develop into main
    echo "Merging develop into main..."
    git merge develop -m "Production release: merge develop into main"

    # Push to main
    echo "Pushing to main..."
    git push origin main

    # Switch back to develop
    echo "Switching back to $current_branch..."
    git checkout "$current_branch"

    echo -e "\n${GREEN}✓ Successfully deployed to PRODUCTION${NC}"
    echo -e "${BLUE}→ Vercel will automatically deploy to production${NC}"
    echo -e "${BLUE}→ Check https://coachbase.vercel.app (or your custom domain)${NC}\n"
}

# Main logic
if [ "$1" = "prod" ]; then
    deploy_production
else
    deploy_develop
fi
