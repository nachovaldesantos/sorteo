/**
 * storage.js - Gestión de persistencia local mediante localStorage
 */

const STORAGE_KEYS = {
  RANGES: 'sorteo_pwa_ranges',
  HISTORY: 'sorteo_pwa_history',
  CURRENT_DISPLAY: 'sorteo_pwa_current_display'
};

const StorageManager = {
  getRanges() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RANGES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer rangos de localStorage:', e);
      return [];
    }
  },

  saveRanges(ranges) {
    try {
      localStorage.setItem(STORAGE_KEYS.RANGES, JSON.stringify(ranges));
    } catch (e) {
      console.error('Error al guardar rangos en localStorage:', e);
    }
  },

  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer historial de localStorage:', e);
      return [];
    }
  },

  saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Error al guardar historial en localStorage:', e);
    }
  },

  getCurrentDisplay() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_DISPLAY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveCurrentDisplay(dorsal) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DISPLAY, JSON.stringify(dorsal));
    } catch (e) {
      console.error('Error al guardar dorsal actual:', e);
    }
  },

  /**
   * Reiniciar Sorteo: Conserva rangos, borra historial y pantalla actual
   */
  resetDraw() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DISPLAY);
    } catch (e) {
      console.error('Error al reiniciar sorteo en localStorage:', e);
    }
  },

  /**
   * Resetear Rangos: Elimina rangos, historial y pantalla actual
   */
  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RANGES);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DISPLAY);
    } catch (e) {
      console.error('Error al resetear todo en localStorage:', e);
    }
  }
};
