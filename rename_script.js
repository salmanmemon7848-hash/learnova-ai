const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['.git', 'node_modules', '.next', 'public', '.claude'];
const IGNORE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf'];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        processDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (!IGNORE_EXTS.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace variations
  content = content.replace(/Learnova AI/g, 'Learnova AI');
  content = content.replace(/Learnova/g, 'Learnova');
  content = content.replace(/learnova-ai/g, 'learnova-ai');
  content = content.replace(/learnova/g, 'learnova');
  content = content.replace(/LEARNOVA/g, 'LEARNOVA');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

processDirectory(__dirname);
