const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/bg-\[#181818\]/g, 'dark:bg-[#181818] bg-gray-50');
    content = content.replace(/bg-\[#0F0F0F\]/g, 'dark:bg-[#0F0F0F] bg-gray-100');
    content = content.replace(/border-\[#2A2A2A\]/g, 'dark:border-[#2A2A2A] border-gray-200');
    content = content.replace(/bg-\[#252525\]/g, 'dark:bg-[#252525] bg-white');
    content = content.replace(/border-\[#333\]/g, 'dark:border-[#333] border-gray-300');
    content = content.replace(/text-gray-300/g, 'dark:text-gray-300 text-gray-700');
    content = content.replace(/text-gray-400/g, 'dark:text-gray-400 text-gray-500');
    content = content.replace(/text-white/g, 'dark:text-white text-gray-900');
    fs.writeFileSync(filePath, content);
  }
});

console.log('Refactoring complete');
