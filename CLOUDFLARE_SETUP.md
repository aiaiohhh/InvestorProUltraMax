# Cloudflare Pages Deployment Setup

## Current Issue
The build succeeds but returns 404 errors because Cloudflare Pages needs the Next.js adapter to properly serve the application.

## Solution Options

### Option 1: Use Cloudflare Pages Framework Preset (Recommended)
1. Go to your Cloudflare Pages dashboard
2. Navigate to your project settings
3. Go to "Builds & deployments" → "Build configuration"
4. Set **Framework preset** to: `Next.js (Static HTML Export)` or `Next.js`
5. Set **Build command** to: `npm run build`
6. Set **Build output directory** to: `.next` (if using Next.js preset) or `dist` (if using custom)

### Option 2: Use the Cloudflare Adapter (Current Setup)
The build script attempts to use `@cloudflare/next-on-pages` adapter via npx. If it fails, it falls back to manual setup.

**To fix the adapter:**
1. The adapter should run automatically during build via `npx`
2. If it fails, you may need to configure it in Cloudflare Pages dashboard:
   - Set **Build output directory** to: `dist`
   - Ensure the adapter creates the proper `_worker.js` file

### Option 3: Manual Configuration
If the adapter continues to fail:

1. **In Cloudflare Pages Dashboard:**
   - Framework preset: `None` or `Next.js`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (or leave empty)

2. **Environment Variables:**
   Add any required environment variables in Cloudflare Pages dashboard:
   - `NODE_VERSION`: `18` or `20`
   - Any API keys your app needs

3. **Verify Build Output:**
   After deployment, check that `dist/` contains:
   - `.next/` directory
   - `public/` directory  
   - `_worker.js` file (created by adapter)

## Troubleshooting

### 404 Errors
- Verify the build output directory is set correctly
- Check that `_worker.js` exists in dist/
- Ensure the adapter ran successfully during build

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check build logs in Cloudflare Pages dashboard

### Adapter Not Running
- The adapter runs via `npx` during build
- If it fails, check the build logs
- You may need to install it locally: `npm install --save-dev @cloudflare/next-on-pages`

## Next Steps
1. Configure Cloudflare Pages dashboard with the settings above
2. Redeploy the application
3. Check the deployment logs for any errors
4. Verify the `dist/` directory structure after build

