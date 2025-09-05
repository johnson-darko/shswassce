#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building PWA for GitHub Pages deployment...\n');

try {
  // Build the client
  console.log('📦 Building client...');
  execSync('npm run build', { stdio: 'inherit' });

  // Copy static assets
  console.log('📋 Copying static assets...');
  
  const distDir = path.join(process.cwd(), 'dist', 'public');
  const staticFiles = [
    'client/public/manifest.json',
    'client/public/sw.js',
    'client/public/data',
    'client/public/icon-192x192.png',
    'client/public/icon-512x512.png'
  ];

  staticFiles.forEach(file => {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(distDir, path.basename(file));
    
    if (fs.existsSync(sourcePath)) {
      if (fs.statSync(sourcePath).isDirectory()) {
        execSync(`cp -r "${sourcePath}" "${distDir}"`);
      } else {
        execSync(`cp "${sourcePath}" "${targetPath}"`);
      }
      console.log(`  ✓ Copied ${file}`);
    } else {
      console.log(`  ⚠️  ${file} not found, skipping...`);
    }
  });

  // Create CNAME file if needed (uncomment and modify for custom domain)
  // fs.writeFileSync(path.join(distDir, 'CNAME'), 'your-domain.com');

  // Create .nojekyll file for GitHub Pages
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  console.log('  ✓ Created .nojekyll file');

  // Create a simple index.html fallback for routing
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    // Ensure the app works with GitHub Pages routing
    const updatedContent = content.replace(
      '<base href="/">',
      '<base href="/ghana-university-guide/">'
    );
    fs.writeFileSync(indexPath, updatedContent);
    console.log('  ✓ Updated base href for GitHub Pages');
  }

  console.log('\n✅ Build complete! Deploy the "dist/public" folder to GitHub Pages.');
  console.log('\n📝 Deployment instructions:');
  console.log('1. Push the contents of "dist/public" to your gh-pages branch');
  console.log('2. Enable GitHub Pages in repository settings');
  console.log('3. Your PWA will be available at: https://yourusername.github.io/ghana-university-guide/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}