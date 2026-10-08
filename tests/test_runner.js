const fs = require('fs');
const path = require('path');

const drawFilePath = path.join(__dirname, '..', 'js', 'draw.js');
const drawCode = fs.readFileSync(drawFilePath, 'utf8');

// Ejecutar draw.js obteniendo DrawEngine
const DrawEngine = new Function(drawCode + '\nreturn DrawEngine;')();

console.log('========================================');
console.log('PRUEBAS UNITARIAS Y VALIDACIONES');
console.log('========================================');

// --- PRUEBA A: RANGOS NO SOLAPADOS ---
console.log('\n[PRUEBA A] Rangos 100–150, 200–250, 400–450:');
const rangesA = [
  { from: 100, to: 150 }, // 51
  { from: 200, to: 250 }, // 51
  { from: 400, to: 450 }  // 51
];
const setA = DrawEngine.getAllUniqueBibs(rangesA);
console.log('  Total dorsales únicos calculados:', setA.size);
console.log('  Esperado: 153 dorsales (51 + 51 + 51)');
if (setA.size !== 153) {
  throw new Error('Fallo en PRUEBA A: El total debe ser 153');
}
console.log('  -> PRUEBA A: PASADA');

// --- PRUEBA B: RANGOS SOLAPADOS ---
console.log('\n[PRUEBA B] Rangos solapados 100–150 y 140–180:');
const rangesB = [
  { from: 100, to: 150 }, // 100 a 150
  { from: 140, to: 180 }  // 140 a 180
];
const setB = DrawEngine.getAllUniqueBibs(rangesB);
console.log('  Total dorsales únicos calculados:', setB.size);
console.log('  Esperado: 81 dorsales (100 a 180 sin duplicar 140-150)');
if (setB.size !== 81) {
  throw new Error('Fallo en PRUEBA B: El total debe ser 81');
}
// Verificar que 140, 145, 150 sólo están 1 vez en el set (por definición de Set en JS)
if (!setB.has(140) || !setB.has(150) || !setB.has(180)) {
  throw new Error('Fallo en PRUEBA B: Faltan números del rango');
}
console.log('  -> PRUEBA B: PASADA');

// --- PRUEBA C: MÚLTIPLES SORTEOS Y NO REPETICIÓN ---
console.log('\n[PRUEBA C] Sorteo sucesivo completo de todos los dorsales:');
let history = [];
let available = DrawEngine.getAvailableBibs(rangesB, history);
const drawnSet = new Set();
let count = 0;

while (available.length > 0) {
  const winner = DrawEngine.pickRandomBib(available);
  if (winner === null) break;
  if (drawnSet.has(winner)) {
    throw new Error('Fallo en PRUEBA C: El dorsal ' + winner + ' salió repetido');
  }
  drawnSet.add(winner);
  history.push({ dorsal: winner, timestamp: Date.now() });
  available = DrawEngine.getAvailableBibs(rangesB, history);
  count++;
}

console.log('  Total de dorsales sorteados:', count);
console.log('  Dorsales únicos premiados:', drawnSet.size);
console.log('  Dorsales restantes en el bombo:', available.length);
if (count !== 81 || drawnSet.size !== 81 || available.length !== 0) {
  throw new Error('Fallo en PRUEBA C: No se sortearon todos los dorsales correctamente');
}
console.log('  -> PRUEBA C: PASADA (Ningún dorsal se repite y todos fueron sorteados)');

// --- PRUEBA G: DESHACER ÚLTIMO SORTEO ---
console.log('\n[PRUEBA G] Deshacer último sorteo:');
const lastDorsal = history[history.length - 1].dorsal;
history.pop();
const availableAfterUndo = DrawEngine.getAvailableBibs(rangesB, history);
console.log('  Dorsal deshecho:', lastDorsal);
console.log('  Dorsales disponibles ahora:', availableAfterUndo.length);
if (availableAfterUndo.length !== 1 || availableAfterUndo[0] !== lastDorsal) {
  throw new Error('Fallo en PRUEBA G: El dorsal devuelto no está disponible de nuevo');
}
console.log('  -> PRUEBA G: PASADA');

// --- PRUEBA E: REINICIAR SORTEO ---
console.log('\n[PRUEBA E] Reiniciar sorteo (mantiene rangos, resetea historial):');
history = [];
const availableAfterReset = DrawEngine.getAvailableBibs(rangesB, history);
console.log('  Dorsales tras reiniciar sorteo:', availableAfterReset.length);
if (availableAfterReset.length !== 81) {
  throw new Error('Fallo en PRUEBA E: Tras reiniciar el sorteo deben volver los 81 dorsales');
}
console.log('  -> PRUEBA E: PASADA');

// --- PRUEBA F: RESETEAR RANGOS ---
console.log('\n[PRUEBA F] Resetear rangos (borra todo):');
const rangesReset = [];
const historyReset = [];
const availableAfterAllReset = DrawEngine.getAvailableBibs(rangesReset, historyReset);
console.log('  Dorsales tras resetear rangos:', availableAfterAllReset.length);
if (availableAfterAllReset.length !== 0) {
  throw new Error('Fallo en PRUEBA F: Deben quedar 0 dorsales');
}
console.log('  -> PRUEBA F: PASADA');

// --- PRUEBAS DE VALIDACIÓN DE ENTRADA ---
console.log('\n[PRUEBAS DE VALIDACIÓN]');
const testV1 = DrawEngine.validateRange('100', '150');
const testV2 = DrawEngine.validateRange('150', '100'); // Desde > Hasta
const testV3 = DrawEngine.validateRange('10.5', '20'); // Decimal
const testV4 = DrawEngine.validateRange('', '20'); // Vacío
const testV5 = DrawEngine.validateRange('-5', '20'); // Negativo

if (!testV1.valid || testV2.valid || testV3.valid || testV4.valid || testV5.valid) {
  throw new Error('Fallo en pruebas de validación de entradas');
}
console.log('  -> VALIDACIONES: TODAS PASADAS');

console.log('\n========================================');
console.log('TODAS LAS PRUEBAS AUTOMATIZADAS HAN SIDO SUPERADAS CON ÉXITO');
console.log('========================================');
