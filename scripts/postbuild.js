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

let adapterSuccess = false;

try {
  // Use npx to run adapter - it will use locally installed version if available
  // Otherwise it will download it (with --yes flag)
  console.log('Running @cloudflare/next-on-pages adapter...');
  
  // Check if adapter is installed locally
  const adapterPath = path.join(process.cwd(), 'node_modules', '@cloudflare', 'next-on-pages');
  if (fs.existsSync(adapterPath)) {
    console.log('Using locally installed adapter...');
  } else {
    console.log('Adapter not found locally, npx will download it...');
  }
  
  // Try running the adapter - first try local install, then npx
  let adapterCommand = null;
  
  // Check if adapter CLI exists locally
  const adapterCliPath = path.join(process.cwd(), 'node_modules', '@cloudflare', 'next-on-pages', 'dist', 'cli', 'index.js');
  if (fs.existsSync(adapterCliPath)) {
    adapterCommand = `node "${adapterCliPath}"`;
    console.log('Using locally installed adapter CLI...');
  } else {
    // Try to find the binary
    const adapterBinPath = path.join(process.cwd(), 'node_modules', '.bin', 'next-on-pages');
    if (fs.existsSync(adapterBinPath)) {
      adapterCommand = adapterBinPath;
      console.log('Using locally installed adapter binary...');
    } else {
      // Fall back to npx
      adapterCommand = 'npx --yes @cloudflare/next-on-pages@1.13.16';
      console.log('Using npx to run adapter...');
    }
  }
  
  try {
    // Run adapter with output capture to see what's happening
    console.log(`Executing: ${adapterCommand}`);
    const adapterOutput = execSync(adapterCommand, {
      encoding: 'utf8',
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
      timeout: 300000 // 5 minute timeout
    });
    
    if (adapterOutput) {
      console.log('Adapter output:', adapterOutput);
    }
    
    // Verify dist was created and has required files
    if (fs.existsSync(distDir)) {
      const workerFile = path.join(distDir, '_worker.js');
      const functionsDir = path.join(distDir, 'functions');
      
      if (fs.existsSync(workerFile) || fs.existsSync(functionsDir)) {
        adapterSuccess = true;
        console.log('✓ Build output prepared for Cloudflare Pages by adapter');
      } else {
        console.warn('Adapter ran but did not create _worker.js or functions/');
        console.warn('Dist directory contents:', fs.readdirSync(distDir));
      }
    } else {
      console.warn('Adapter ran but did not create dist directory');
    }
  } catch (adapterError) {
    console.warn('Adapter execution failed');
    console.warn('Error:', adapterError.message);
    if (adapterError.stdout) console.warn('Stdout:', adapterError.stdout);
    if (adapterError.stderr) console.warn('Stderr:', adapterError.stderr);
  }
} catch (error) {
  console.warn('Adapter setup failed:', error.message);
}

// If adapter didn't succeed, use fallback
if (!adapterSuccess) {
  console.log('Using fallback: Creating dist directory manually...');
  
  // Remove dist if it exists (might be partial from failed adapter)
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  
  // Create dist directory manually
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
  
  // Create a basic _worker.js that serves static files
  // Note: This is a minimal fallback - full Next.js routing requires the adapter
  const workerJs = `// Cloudflare Pages Worker - Fallback
// For full Next.js functionality, the @cloudflare/next-on-pages adapter is required
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Try to serve static files from public directory
    if (url.pathname.startsWith('/_next/static/')) {
      // Serve Next.js static assets
      const assetPath = url.pathname.replace('/_next/static/', '.next/static/');
      // Cloudflare Pages will handle static file serving automatically
    }
    
    // For now, return a message indicating adapter is needed
    return new Response(
      JSON.stringify({
        error: 'Next.js adapter required',
        message: 'Please ensure @cloudflare/next-on-pages adapter runs during build',
        path: url.pathname
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};`;
  fs.writeFileSync(path.join(distDir, '_worker.js'), workerJs);
  
  console.log('✓ Fallback: Build output prepared in dist/');
  console.log('⚠ WARNING: Full Next.js functionality requires @cloudflare/next-on-pages adapter');
  console.log('⚠ The adapter should run automatically via npx during Cloudflare build');
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

