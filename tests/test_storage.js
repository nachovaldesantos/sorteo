const fs = require('fs');
const path = require('path');

// Simular localStorage
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); }
};

const storageFilePath = path.join(__dirname, '..', 'js', 'storage.js');
const storageCode = fs.readFileSync(storageFilePath, 'utf8');
const StorageManager = new Function(storageCode + '\nreturn StorageManager;')();

console.log('--- TEST STORAGE: Persistencia ---');

// Guardar rangos
const testRanges = [{ id: '1', from: 100, to: 150 }];
StorageManager.saveRanges(testRanges);
const loadedRanges = StorageManager.getRanges();
if (loadedRanges.length !== 1 || loadedRanges[0].from !== 100) {
  throw new Error('Fallo al guardar o recuperar rangos');
}
console.log('1. Guardar y recuperar rangos: OK');

// Guardar historial
const testHistory = [{ dorsal: 125, timestamp: 123456 }];
StorageManager.saveHistory(testHistory);
const loadedHistory = StorageManager.getHistory();
if (loadedHistory.length !== 1 || loadedHistory[0].dorsal !== 125) {
  throw new Error('Fallo al guardar o recuperar historial');
}
console.log('2. Guardar y recuperar historial: OK');

// Reiniciar sorteo (mantiene rangos, borra historial)
StorageManager.resetDraw();
if (StorageManager.getHistory().length !== 0) {
  throw new Error('El historial debió quedar vacío');
}
if (StorageManager.getRanges().length !== 1) {
  throw new Error('Los rangos debieron mantenerse');
}
console.log('3. Reiniciar sorteo (conserva rangos): OK');

// Resetear todo (borra rangos e historial)
StorageManager.resetAll();
if (StorageManager.getRanges().length !== 0 || StorageManager.getHistory().length !== 0) {
  throw new Error('Debió eliminarse todo');
}
console.log('4. Resetear todo: OK');

console.log('--- TEST STORAGE SUPERADO EXITOSAMENTE ---');
