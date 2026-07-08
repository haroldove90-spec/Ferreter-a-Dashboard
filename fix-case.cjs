const fs = require('fs');
const path = require('path');

console.log('--- Iniciando fix-case para Vercel ---');

try {
  // 1. Corregir capitalización de la carpeta "src" en la raíz
  const rootFiles = fs.readdirSync('.');
  const srcDirName = rootFiles.find(f => f.toLowerCase() === 'src');
  
  if (srcDirName && srcDirName !== 'src') {
    console.log(`[FIX] Detectada carpeta "${srcDirName}". Renombrando a "src" para compatibilidad con sistemas Linux...`);
    fs.renameSync(srcDirName, 'temp-src-dir');
    fs.renameSync('temp-src-dir', 'src');
    console.log('[FIX] Carpeta "src" renombrada con éxito.');
  } else if (!srcDirName) {
    console.warn('[WARN] No se encontró ninguna carpeta "src" o similar en la raíz.');
  } else {
    console.log('[OK] La carpeta "src" ya está en minúsculas.');
  }

  // 2. Corregir capitalización de "main.tsx" dentro de la carpeta "src"
  const targetSrc = srcDirName && srcDirName !== 'src' ? 'src' : (srcDirName || 'src');
  if (fs.existsSync(targetSrc)) {
    const srcFiles = fs.readdirSync(targetSrc);
    const mainFile = srcFiles.find(f => f.toLowerCase() === 'main.tsx');
    if (mainFile && mainFile !== 'main.tsx') {
      console.log(`[FIX] Detectado archivo "${mainFile}" dentro de "${targetSrc}". Renombrando a "main.tsx"...`);
      fs.renameSync(path.join(targetSrc, mainFile), path.join(targetSrc, 'temp-main-file'));
      fs.renameSync(path.join(targetSrc, 'temp-main-file'), path.join(targetSrc, 'main.tsx'));
      console.log('[FIX] Archivo "main.tsx" renombrado con éxito.');
    } else if (mainFile) {
      console.log('[OK] El archivo "main.tsx" ya está en minúsculas.');
    } else {
      console.warn(`[WARN] No se encontró "main.tsx" en "${targetSrc}".`);
    }
  }
} catch (error) {
  console.error('[ERROR] Error durante la corrección de capitalización:', error);
}

console.log('--- Finalizado fix-case ---');
