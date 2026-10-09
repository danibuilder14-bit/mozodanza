const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const audio = html.match(/<audio\b[^>]*\bid="bgMusic"[^>]*>/);
assert.ok(audio, 'La música debe estar activa en el HTML, fuera de los comentarios.');
const source = audio[0].match(/\bsrc="([^"]+)"/);
assert.ok(source, 'Falta la ruta del archivo de música.');
assert.ok(/\bloop\b/.test(audio[0]), 'La música debe repetirse.');
const file = path.resolve(root, source[1]);
assert.ok(file.startsWith(root + path.sep), 'La música debe ser un archivo del sitio.');
assert.ok(fs.existsSync(file), 'No existe el archivo de música: ' + source[1]);
const data = fs.readFileSync(file);
assert.ok(data.length > 1024 && data.subarray(4, 8).toString() === 'ftyp' && data.includes(Buffer.from('mdat')), 'El archivo debe contener audio M4A.');
assert.ok(/<button\b[^>]*\bid="musicPill"/.test(html) && /id="musicPillText"/.test(html), 'Falta el control de música.');
console.log('Música verificada: reproductor activo, audio incluido, bucle y control disponibles.');
