const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKIP_FILES = ['loader.js', 'preload.js'];

function compileDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      compileDir(fullPath);
    } else if (file.endsWith('.js') && !SKIP_FILES.includes(file)) {
      console.log('Compilando:', fullPath);
      bytenode.compileFile({ filename: fullPath });
    }
  }
}

function removeJs(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      removeJs(fullPath);
    } else if (file.endsWith('.js') && !SKIP_FILES.includes(file)) {
      console.log('Removendo:', fullPath);
      fs.unlinkSync(fullPath);
    }
  }
}

function obfuscateFiles(files) {
  for (const file of files) {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`🔒 Ofuscando ${file}...`);
      execSync(
        `npx javascript-obfuscator "${filePath}" --output "${filePath}" --compact true --control-flow-flattening true`,
        { stdio: 'inherit' }
      );
      console.log(`${file} ofuscado com sucesso.`);
    } else {
      console.warn(`${file} não encontrado, pulando ofuscação.`);
    }
  }
}

const distPath = path.join(__dirname, 'dist-electron');
compileDir(distPath);
removeJs(distPath);
obfuscateFiles(['loader.js', 'preload.js']);
console.log('Compilação concluída, loader.js e preload.js preservados e ofuscados.');
process.exit(0);
