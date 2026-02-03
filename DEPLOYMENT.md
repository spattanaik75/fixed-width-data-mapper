# 🚀 GitLab Pages Deployment Guide

## Automated Deployment (Recommended)

### Setup (One-time)

1. **Update the base path in `vite.config.ts`** to match your project name:
   ```typescript
   base: '/your-project-name/'
   ```
   - If your repo is `gitlab.com/username/my-project`, use `base: '/my-project/'`
   - If deploying to `username.gitlab.io` (user/group page), use `base: '/'`

2. **Commit and push** the `.gitlab-ci.yml` file to your repository:
   ```bash
   git add .gitlab-ci.yml vite.config.ts
   git commit -m "Add GitLab CI/CD for Pages deployment"
   git push origin main
   ```

3. **That's it!** GitLab will automatically:
   - Detect the `.gitlab-ci.yml` file
   - Run the build pipeline
   - Deploy to GitLab Pages

### How It Works

The `.gitlab-ci.yml` pipeline automatically:
1. Installs dependencies (`npm ci`)
2. Builds the production site (`npm run build`)
3. Deploys to GitLab Pages (moves `dist/` to `public/`)

Every push to your default branch (main/master) triggers a new deployment.

### Monitoring Deployments

1. Go to your GitLab project
2. Navigate to **CI/CD → Pipelines**
3. Click on the latest pipeline to see build progress
4. Once complete (green ✓), go to **Settings → Pages** to see your site URL

### Accessing Your Site

Your site will be available at:
- **Project pages:** `https://username.gitlab.io/project-name/`
- **User/Group pages:** `https://username.gitlab.io/`

The URL appears in **Settings → Pages** after the first successful deployment.

## Manual Deployment (Alternative)

If you prefer to deploy manually without CI/CD:

```bash
# Build locally
npm run build

# Create deployment branch
git checkout -b gl-pages
git rm -rf .
git checkout HEAD -- dist/
mv dist/* .
rmdir dist

# Deploy
git add .
git commit -m "Deploy to GitLab Pages"
git push origin gl-pages --force
git checkout main
```

Then configure **Settings → Pages** to use the `gl-pages` branch.

## Troubleshooting

### Pipeline fails with "npm: command not found"
- The `.gitlab-ci.yml` uses Node.js 20 image, which is up-to-date
- No action needed

### Assets not loading (404 errors)
- Verify the `base` path in `vite.config.ts` matches your project name exactly
- Ensure it starts and ends with `/`

### Page shows blank
- Check **CI/CD → Pipelines** for build errors
- Open browser DevTools → Console for JavaScript errors
- Verify the base path is correct

### GitLab Pages not enabled
- Go to **Settings → General → Visibility, project features, permissions**
- Ensure "Pages" is enabled
- For private repos, you may need GitLab Premium

## Testing Locally

Before pushing, test the production build locally:
```bash
npm run build
npm run preview
```

This simulates the production environment at `http://localhost:4173`.
