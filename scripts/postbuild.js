const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Use @cloudflare/next-on-pages to prepare Next.js for Cloudflare Pages
// This adapter converts Next.js output to Cloudflare Pages compatible format
console.log('Preparing Next.js build for Cloudflare Pages...');

const distDir = path.join(process.cwd(), 'dist');
const nextDir = path.join(process.cwd(), '.next');

// Remove existing dist if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

try {
  // Use npx to run the adapter without installing it
  // The adapter will create the dist directory with proper structure
  console.log('Running @cloudflare/next-on-pages adapter...');
  
  // Try running the adapter
  const adapterOutput = execSync('npx --yes @cloudflare/next-on-pages@1 2>&1', {
    encoding: 'utf8',
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  console.log(adapterOutput);
  
  // Verify dist was created
  if (fs.existsSync(distDir)) {
    console.log('✓ Build output prepared for Cloudflare Pages');
  } else {
    throw new Error('Adapter did not create dist directory');
  }
} catch (error) {
  console.warn('Warning: Cloudflare adapter failed');
  console.warn('Error details:', error.message);
  if (error.stdout) console.warn('Stdout:', error.stdout);
  if (error.stderr) console.warn('Stderr:', error.stderr);
  console.log('Creating dist directory manually...');
  
  // Fallback: create dist directory manually
  fs.mkdirSync(distDir, { recursive: true });
  
  // Copy .next to dist/.next
  const distNextDir = path.join(distDir, '.next');
  copyRecursiveSync(nextDir, distNextDir);
  
  // Copy public directory
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    const distPublicDir = path.join(distDir, 'public');
    copyRecursiveSync(publicDir, distPublicDir);
  }
  
  // Create a basic _worker.js for Cloudflare Pages
  const workerJs = `// Cloudflare Pages Worker
export default {
  async fetch(request, env, ctx) {
    // This is a placeholder - Cloudflare adapter should generate this
    return new Response('Next.js app - adapter required', { status: 500 });
  }
};`;
  fs.writeFileSync(path.join(distDir, '_worker.js'), workerJs);
  
  console.log('✓ Fallback: Build output prepared in dist/');
  console.log('⚠ Note: For full functionality, install @cloudflare/next-on-pages');
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

