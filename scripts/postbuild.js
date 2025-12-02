const fs = require('fs');
const path = require('path');

// This script runs after the @cloudflare/next-on-pages adapter
// It cleans up files that exceed Cloudflare's 25 MiB size limit

console.log('Running postbuild cleanup for Cloudflare Pages...');

// The adapter outputs to .vercel/output/static
const outputDir = path.join(process.cwd(), '.vercel', 'output', 'static');

if (fs.existsSync(outputDir)) {
  console.log('Found adapter output at .vercel/output/static');
  cleanupLargeFiles(outputDir);
  console.log('✓ Postbuild cleanup complete');
} else {
  console.log('Warning: Adapter output directory not found at .vercel/output/static');
  console.log('The @cloudflare/next-on-pages adapter may not have run successfully');
}

// Clean up files that exceed Cloudflare's 25 MiB limit
function cleanupLargeFiles(dir) {
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MiB in bytes
  
  // Directories to remove entirely (cache directories not needed for deployment)
  const dirsToRemove = [
    '.next/cache',
    'cache',
  ];
  
  for (const relPath of dirsToRemove) {
    const fullPath = path.join(dir, relPath);
    if (fs.existsSync(fullPath)) {
      console.log(`Removing cache directory: ${relPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
  
  // Scan for any remaining large files
  scanAndRemoveLargeFiles(dir, MAX_FILE_SIZE);
  
  console.log('✓ Cleaned up large files for Cloudflare Pages deployment');
}

function scanAndRemoveLargeFiles(dir, maxSize, basePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      scanAndRemoveLargeFiles(fullPath, maxSize, relativePath);
    } else if (entry.isFile()) {
      try {
        const stats = fs.statSync(fullPath);
        if (stats.size > maxSize) {
          console.log(`Removing large file (${(stats.size / 1024 / 1024).toFixed(2)} MiB): ${relativePath}`);
          fs.unlinkSync(fullPath);
        }
      } catch (e) {
        // Ignore errors for files that can't be read
      }
    }
  }
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
