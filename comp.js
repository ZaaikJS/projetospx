const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');

function compileDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      compileDir(fullPath);
    } else if (file.endsWith('.js')) {
      console.log('Compilando:', fullPath);
      bytenode.compileFile({ filename: fullPath });
    }
  }
}

compileDir(path.join(__dirname, 'dist-electron'));
