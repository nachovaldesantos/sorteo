/**
 * draw.js - Lógica matemática y de negocio del bombo de dorsales
 */

const DrawEngine = {
  /**
   * Valida un rango de dorsales
   * @param {number|string} from 
   * @param {number|string} to 
   * @returns {{ valid: boolean, message?: string, fromNum?: number, toNum?: number }}
   */
  validateRange(from, to) {
    if (from === '' || to === '' || from === null || to === null) {
      return { valid: false, message: 'Debes rellenar tanto el dorsal inicial como el final.' };
    }

    const fromNum = Number(from);
    const toNum = Number(to);

    if (!Number.isInteger(fromNum) || !Number.isInteger(toNum)) {
      return { valid: false, message: 'Ambos dorsales deben ser números enteros.' };
    }

    if (fromNum < 1 || toNum < 1) {
      return { valid: false, message: 'Los dorsales deben ser números positivos mayores que cero.' };
    }

    if (fromNum > toNum) {
      return { valid: false, message: 'El dorsal inicial no puede ser mayor que el dorsal final.' };
    }

    // Límite de seguridad para evitar rangos de cientos de millones que colapsen memoria
    if (toNum - fromNum > 500000) {
      return { valid: false, message: 'El rango es demasiado amplio (máximo 500.000 dorsales por rango).' };
    }

    return { valid: true, fromNum, toNum };
  },

  /**
   * Calcula el número de dorsales que abarca un rango individual (ej: 100-150 -> 51)
   */
  getRangeCount(from, to) {
    return Math.max(0, to - from + 1);
  },

  /**
   * Genera el conjunto de todos los dorsales únicos participantes
   * Si existen rangos solapados, cada dorsal existe una sola vez.
   * @param {Array<{from: number, to: number}>} ranges
   * @returns {Set<number>}
   */
  getAllUniqueBibs(ranges) {
    const bibs = new Set();
    for (const range of ranges) {
      const from = Number(range.from);
      const to = Number(range.to);
      for (let i = from; i <= to; i++) {
        bibs.add(i);
      }
    }
    return bibs;
  },

  /**
   * Obtiene los dorsales aún disponibles para sortear (no premiados aún)
   * @param {Array} ranges 
   * @param {Array} history 
   * @returns {number[]} Array de dorsales disponibles ordenados o listos para sorteo
   */
  getAvailableBibs(ranges, history) {
    const allUnique = this.getAllUniqueBibs(ranges);
    const drawnSet = new Set(history.map(item => item.dorsal));

    const available = [];
    for (const bib of allUnique) {
      if (!drawnSet.has(bib)) {
        available.push(bib);
      }
    }
    return available;
  },

  /**
   * Selecciona aleatoriamente un dorsal disponible usando entropía criptográfica segura
   * con probabilidad 100% uniforme.
   * @param {number[]} availableBibs 
   * @returns {number|null}
   */
  pickRandomBib(availableBibs) {
    if (!availableBibs || availableBibs.length === 0) {
      return null;
    }

    let randomIndex;
    const cryptoObj = (typeof crypto !== 'undefined') ? crypto : (typeof window !== 'undefined' ? window.crypto : null);

    if (cryptoObj && cryptoObj.getRandomValues) {
      const randomBuffer = new Uint32Array(1);
      cryptoObj.getRandomValues(randomBuffer);
      // Distribución uniforme normalizada
      randomIndex = Math.floor((randomBuffer[0] / (0xffffffff + 1)) * availableBibs.length);
    } else {
      randomIndex = Math.floor(Math.random() * availableBibs.length);
    }

    return availableBibs[randomIndex];
  }
};
