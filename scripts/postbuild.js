const fs = require('fs');
const path = require('path');

// For Cloudflare Pages, create a dist directory with .next output
// Cloudflare Pages expects the output in 'dist' directory
const distDir = path.join(process.cwd(), 'dist');
const nextDir = path.join(process.cwd(), '.next');

// Remove existing dist if it exists
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist directory
fs.mkdirSync(distDir, { recursive: true });

// Copy entire .next directory to dist/.next
const distNextDir = path.join(distDir, '.next');
copyRecursiveSync(nextDir, distNextDir);

// Copy public directory to dist/public
const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const distPublicDir = path.join(distDir, 'public');
  copyRecursiveSync(publicDir, distPublicDir);
}

// Copy package.json to dist (needed for Cloudflare)
const packageJson = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJson)) {
  fs.copyFileSync(packageJson, path.join(distDir, 'package.json'));
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

console.log('✓ Build output prepared for Cloudflare Pages in dist/');

