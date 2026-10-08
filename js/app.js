/**
 * app.js - Controlador principal de la PWA Sorteo de Dorsales
 */

(function () {
  'use strict';

  // --- ESTADO DE LA APLICACIÓN ---
  let ranges = [];
  let history = [];
  let currentDisplay = null;
  let isDrawing = false;
  let editingId = null;

  // --- ELEMENTOS DEL DOM ---
  // Pestañas y vistas
  const tabDrawBtn = document.getElementById('tabDrawBtn');
  const tabConfigBtn = document.getElementById('tabConfigBtn');
  const viewDraw = document.getElementById('viewDraw');
  const viewConfig = document.getElementById('viewConfig');

  // Vista de Sorteo
  const statAvailable = document.getElementById('statAvailable');
  const statDrawn = document.getElementById('statDrawn');
  const noRangesAlert = document.getElementById('noRangesAlert');
  const allDrawnAlert = document.getElementById('allDrawnAlert');
  const goToConfigBtn = document.getElementById('goToConfigBtn');
  const winnerCard = document.getElementById('winnerCard');
  const winnerNumber = document.getElementById('winnerNumber');
  const winnerStatusSubtitle = document.getElementById('winnerStatusSubtitle');
  const drawBtn = document.getElementById('drawBtn');
  const undoBtn = document.getElementById('undoBtn');
  const resetDrawBtn = document.getElementById('resetDrawBtn');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyListContainer = document.getElementById('historyListContainer');
  const historyList = document.getElementById('historyList');
  const historyCountBadge = document.getElementById('historyCountBadge');

  // Vista de Configuración
  const totalBibsBadge = document.getElementById('totalBibsBadge');
  const totalBibsLabel = document.getElementById('totalBibsLabel');
  const rangeForm = document.getElementById('rangeForm');
  const editRangeIdInput = document.getElementById('editRangeId');
  const rangeFromInput = document.getElementById('rangeFrom');
  const rangeToInput = document.getElementById('rangeTo');
  const formError = document.getElementById('formError');
  const formTitle = document.getElementById('formTitle');
  const editingIndicator = document.getElementById('editingIndicator');
  const submitRangeText = document.getElementById('submitRangeText');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const rangesList = document.getElementById('rangesList');
  const rangesEmpty = document.getElementById('rangesEmpty');
  const rangesCountTag = document.getElementById('rangesCountTag');
  const resetRangesBtn = document.getElementById('resetRangesBtn');

  // Modal de confirmación
  const confirmModal = document.getElementById('confirmModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  let pendingModalAction = null;

  // Canvas de confeti
  const confettiCanvas = document.getElementById('confettiCanvas');

  // --- INICIALIZACIÓN ---
  function init() {
    loadData();
    setupEventListeners();
    setupConfettiCanvas();
    registerServiceWorker();
    renderAll();
  }

  function loadData() {
    ranges = StorageManager.getRanges();
    history = StorageManager.getHistory();
    currentDisplay = StorageManager.getCurrentDisplay();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
          .then((reg) => {
            console.log('Service Worker registrado correctamente con scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('Fallo al registrar Service Worker:', err);
          });
      });
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Navegación entre vistas
    tabDrawBtn.addEventListener('click', () => switchTab('draw'));
    tabConfigBtn.addEventListener('click', () => switchTab('config'));
    goToConfigBtn.addEventListener('click', () => switchTab('config'));

    // Acciones de sorteo
    drawBtn.addEventListener('click', handleDraw);
    undoBtn.addEventListener('click', handleUndoRequest);
    resetDrawBtn.addEventListener('click', handleResetDrawRequest);

    // Formulario de rangos
    rangeForm.addEventListener('submit', handleRangeSubmit);
    cancelEditBtn.addEventListener('click', cancelRangeEdit);
    resetRangesBtn.addEventListener('click', handleResetRangesRequest);

    // Modal
    modalCancelBtn.addEventListener('click', closeModal);
    modalConfirmBtn.addEventListener('click', () => {
      if (typeof pendingModalAction === 'function') {
        const action = pendingModalAction;
        closeModal();
        action();
      } else {
        closeModal();
      }
    });

    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeModal();
      }
    });

    // Accesibilidad teclado escape modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // --- NAVEGACIÓN ---
  function switchTab(tab) {
    if (isDrawing) return; // Bloquear cambio durante animación

    if (tab === 'draw') {
      tabDrawBtn.classList.add('active');
      tabDrawBtn.setAttribute('aria-selected', 'true');
      tabConfigBtn.classList.remove('active');
      tabConfigBtn.setAttribute('aria-selected', 'false');

      viewDraw.classList.add('active');
      viewDraw.hidden = false;
      viewConfig.classList.remove('active');
      viewConfig.hidden = true;
    } else {
      tabConfigBtn.classList.add('active');
      tabConfigBtn.setAttribute('aria-selected', 'true');
      tabDrawBtn.classList.remove('active');
      tabDrawBtn.setAttribute('aria-selected', 'false');

      viewConfig.classList.add('active');
      viewConfig.hidden = false;
      viewDraw.classList.remove('active');
      viewDraw.hidden = true;
    }
    renderAll();
  }

  // --- RENDERIZADO GLOBAL ---
  function renderAll() {
    renderConfigView();
    renderDrawView();
  }

  // --- RENDERIZADO VISTA DE CONFIGURACIÓN ---
  function renderConfigView() {
    // Total dorsales únicos participantes
    const uniqueBibs = DrawEngine.getAllUniqueBibs(ranges);
    const totalCount = uniqueBibs.size;
    totalBibsBadge.textContent = totalCount;
    totalBibsLabel.textContent = `Dorsales participantes: ${totalCount}`;
    rangesCountTag.textContent = ranges.length;

    // Lista de rangos
    rangesList.innerHTML = '';
    if (ranges.length === 0) {
      rangesEmpty.classList.remove('hidden');
    } else {
      rangesEmpty.classList.add('hidden');
      ranges.forEach((range) => {
        const count = DrawEngine.getRangeCount(range.from, range.to);
        const item = document.createElement('div');
        item.className = 'range-item';
        if (editingId === range.id) {
          item.classList.add('editing');
        }

        item.innerHTML = `
          <div class="range-info">
            <span class="range-span">${range.from}–${range.to}</span>
            <span class="range-count">${count} dorsal${count === 1 ? '' : 'es'}</span>
          </div>
          <div class="range-actions">
            <button type="button" class="btn-icon-action edit" data-id="${range.id}">Editar</button>
            <button type="button" class="btn-icon-action delete" data-id="${range.id}">Eliminar</button>
          </div>
        `;

        item.querySelector('.edit').addEventListener('click', () => startRangeEdit(range));
        item.querySelector('.delete').addEventListener('click', () => handleRangeDelete(range));

        rangesList.appendChild(item);
      });
    }
  }

  // --- GESTIÓN DE RANGOS ---
  function handleRangeSubmit(e) {
    e.preventDefault();
    hideFormError();

    const fromVal = rangeFromInput.value.trim();
    const toVal = rangeToInput.value.trim();

    const validation = DrawEngine.validateRange(fromVal, toVal);
    if (!validation.valid) {
      showFormError(validation.message);
      return;
    }

    const fromNum = validation.fromNum;
    const toNum = validation.toNum;

    if (editingId) {
      // Editar existente
      const index = ranges.findIndex(r => r.id === editingId);
      if (index !== -1) {
        ranges[index].from = fromNum;
        ranges[index].to = toNum;
      }
      cancelRangeEdit();
    } else {
      // Añadir nuevo
      const newRange = {
        id: 'rng_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        from: fromNum,
        to: toNum
      };
      ranges.push(newRange);
      rangeFromInput.value = '';
      rangeToInput.value = '';
      rangeFromInput.focus();
    }

    StorageManager.saveRanges(ranges);
    renderAll();
  }

  function startRangeEdit(range) {
    editingId = range.id;
    editRangeIdInput.value = range.id;
    rangeFromInput.value = range.from;
    rangeToInput.value = range.to;

    formTitle.textContent = 'Editar rango';
    submitRangeText.textContent = 'Guardar cambios';
    editingIndicator.classList.remove('hidden');
    cancelEditBtn.classList.remove('hidden');
    hideFormError();

    rangeFromInput.focus();
    renderConfigView();
  }

  function cancelRangeEdit() {
    editingId = null;
    editRangeIdInput.value = '';
    rangeFromInput.value = '';
    rangeToInput.value = '';

    formTitle.textContent = 'Añadir nuevo rango';
    submitRangeText.textContent = '+ Añadir rango';
    editingIndicator.classList.add('hidden');
    cancelEditBtn.classList.add('hidden');
    hideFormError();

    renderConfigView();
  }

  function handleRangeDelete(range) {
    showModal({
      title: 'Eliminar rango',
      message: `¿Estás seguro de que deseas eliminar el rango ${range.from}–${range.to}?`,
      confirmText: 'Eliminar',
      onConfirm: () => {
        ranges = ranges.filter(r => r.id !== range.id);
        StorageManager.saveRanges(ranges);

        if (editingId === range.id) {
          cancelRangeEdit();
        }

        renderAll();
      }
    });
  }

  function handleResetRangesRequest() {
    showModal({
      title: '¿Resetear todos los rangos?',
      message: 'Esta acción borrará TODOS los rangos de dorsales y también cualquier sorteo realizado. Esta acción no se puede deshacer.',
      confirmText: 'Resetear todo',
      onConfirm: () => {
        ranges = [];
        history = [];
        currentDisplay = null;
        cancelRangeEdit();
        StorageManager.resetAll();
        renderAll();
      }
    });
  }

  function showFormError(msg) {
    formError.textContent = msg;
    formError.classList.remove('hidden');
  }

  function hideFormError() {
    formError.textContent = '';
    formError.classList.add('hidden');
  }

  // --- RENDERIZADO VISTA DE SORTEO ---
  function renderDrawView() {
    const hasRanges = ranges.length > 0;
    const availableBibs = DrawEngine.getAvailableBibs(ranges, history);
    const availableCount = availableBibs.length;
    const drawnCount = history.length;

    statAvailable.textContent = availableCount;
    statDrawn.textContent = drawnCount;
    historyCountBadge.textContent = drawnCount;

    // Estado de avisos y botón de sorteo
    if (!hasRanges) {
      noRangesAlert.classList.remove('hidden');
      allDrawnAlert.classList.add('hidden');
      drawBtn.disabled = true;
      if (!isDrawing && currentDisplay === null) {
        winnerNumber.textContent = '---';
        winnerStatusSubtitle.textContent = 'Sin dorsales';
      }
    } else if (availableCount === 0) {
      noRangesAlert.classList.add('hidden');
      allDrawnAlert.classList.remove('hidden');
      drawBtn.disabled = true;
      if (!isDrawing && currentDisplay === null) {
        winnerNumber.textContent = '---';
        winnerStatusSubtitle.textContent = 'Todos sorteados';
      }
    } else {
      noRangesAlert.classList.add('hidden');
      allDrawnAlert.classList.add('hidden');
      drawBtn.disabled = isDrawing;
      if (!isDrawing && currentDisplay === null) {
        winnerNumber.textContent = '---';
        winnerStatusSubtitle.textContent = 'Listo para sortear';
      }
    }

    // Si hay un dorsal actual almacenado para mostrar
    if (currentDisplay !== null && !isDrawing) {
      winnerNumber.textContent = currentDisplay;
      winnerStatusSubtitle.textContent = `Dorsal premiado (${drawnCount}.º)`;
    }

    // Botón de deshacer
    undoBtn.disabled = (history.length === 0 || isDrawing);

    // Historial
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
      historyEmpty.classList.remove('hidden');
      historyListContainer.classList.add('hidden');
    } else {
      historyEmpty.classList.add('hidden');
      historyListContainer.classList.remove('hidden');

      // Mostramos el historial en orden cronológico ascendente:
      // El 1.º sorteo aparece arriba y los siguientes se van añadiendo debajo.
      history.forEach((item, index) => {
        const order = index + 1;
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <span class="history-item-order">${order}.º sorteo</span>
          <span class="history-item-dorsal">Dorsal <strong>${item.dorsal}</strong></span>
        `;
        historyList.appendChild(li);
      });
    }
  }

  // --- SORTEO Y ANIMACIÓN ---
  function handleDraw() {
    if (isDrawing) return;

    const availableBibs = DrawEngine.getAvailableBibs(ranges, history);
    if (!availableBibs || availableBibs.length === 0) return;

    // 1. Seleccionar el ganador internamente de forma inmediata con probabilidad uniforme
    const winner = DrawEngine.pickRandomBib(availableBibs);
    if (winner === null) return;

    isDrawing = true;
    drawBtn.disabled = true;
    undoBtn.disabled = true;
    winnerCard.classList.remove('winner-pulse');
    winnerCard.classList.add('spinning');
    winnerStatusSubtitle.textContent = 'Sorteando...';

    // 2. Animación de ruleta / slot machine (2.2 a 2.6 segundos aprox)
    // Velocidad progresivamente decreciente (desaceleración)
    runSlotAnimation(availableBibs, winner, () => {
      // Al terminar la animación:
      isDrawing = false;
      currentDisplay = winner;
      history.push({ dorsal: winner, timestamp: Date.now() });

      StorageManager.saveHistory(history);
      StorageManager.saveCurrentDisplay(currentDisplay);

      winnerCard.classList.remove('spinning');
      winnerCard.classList.add('winner-pulse');
      winnerNumber.textContent = winner;
      winnerStatusSubtitle.textContent = `¡Dorsal premiado! (${history.length}.º)`;

      // Confeti ligero
      fireConfetti();

      // Renderizar estado y contadores
      renderAll();
    });
  }

  /**
   * Ejecuta la animación con desaceleración progresiva
   */
  function runSlotAnimation(availableList, targetBib, onComplete) {
    const totalDuration = 2400; // ~2.4 segundos
    const startTime = performance.now();

    // Pool de números visuales para variar durante el giro
    const visualPool = availableList.length > 1 ? availableList : [targetBib, targetBib + 1, targetBib - 1];

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      if (progress < 1) {
        // Mostrar número aleatorio de los participantes
        const randSample = visualPool[Math.floor(Math.random() * visualPool.length)];
        winnerNumber.textContent = randSample;

        // Intervalo que crece cuadráticamente (desaceleración)
        // empieza en ~40ms y termina en ~350ms
        const delay = 40 + Math.pow(progress, 2.5) * 320;
        setTimeout(() => {
          requestAnimationFrame(step);
        }, delay);
      } else {
        // Fin de la animación: mostrar el ganador fijado
        winnerNumber.textContent = targetBib;
        onComplete();
      }
    }

    requestAnimationFrame(step);
  }

  // --- DESHACER SORTEO ---
  function handleUndoRequest() {
    if (history.length === 0 || isDrawing) return;

    const lastDraw = history[history.length - 1];
    showModal({
      title: 'Deshacer último sorteo',
      message: `¿Deseas anular el sorteo del Dorsal ${lastDraw.dorsal} y devolverlo a los dorsales disponibles?`,
      confirmText: 'Deshacer sorteo',
      onConfirm: () => {
        history.pop();
        StorageManager.saveHistory(history);

        // Actualizar visualización del dorsal actual
        if (history.length > 0) {
          currentDisplay = history[history.length - 1].dorsal;
        } else {
          currentDisplay = null;
          winnerNumber.textContent = '---';
          winnerStatusSubtitle.textContent = 'Listo para sortear';
        }
        StorageManager.saveCurrentDisplay(currentDisplay);

        winnerCard.classList.remove('winner-pulse', 'spinning');
        renderAll();
      }
    });
  }

  // --- REINICIAR SORTEO ---
  function handleResetDrawRequest() {
    if (isDrawing) return;

    showModal({
      title: '¿Reiniciar sorteo?',
      message: 'Se borrará el historial de dorsales premiados y volverán a estar todos disponibles. Los rangos de dorsales se mantendrán intactos.',
      confirmText: 'Reiniciar',
      onConfirm: () => {
        history = [];
        currentDisplay = null;
        StorageManager.resetDraw();

        winnerCard.classList.remove('winner-pulse', 'spinning');
        winnerNumber.textContent = '---';
        winnerStatusSubtitle.textContent = 'Listo para sortear';

        renderAll();
      }
    });
  }

  // --- MODAL DE CONFIRMACIÓN ---
  function showModal({ title, message, confirmText = 'Confirmar', onConfirm }) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirmBtn.textContent = confirmText;
    pendingModalAction = onConfirm;
    confirmModal.classList.remove('hidden');
  }

  function closeModal() {
    confirmModal.classList.add('hidden');
    pendingModalAction = null;
  }

  // --- CONFETI LIGERO CON CANVAS NATIVO (0 dependencias) ---
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimId = null;

  function setupConfettiCanvas() {
    confettiCtx = confettiCanvas.getContext('2d');
    function resize() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
  }

  function fireConfetti() {
    if (!confettiCtx) return;
    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    confettiParticles = [];
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899'];
    const w = confettiCanvas.width;

    // Crear 45 partículas ligeras
    for (let i = 0; i < 45; i++) {
      confettiParticles.push({
        x: w * 0.5 + (Math.random() - 0.5) * 120,
        y: confettiCanvas.height * 0.35,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    const startAnim = performance.now();
    function animate(now) {
      const elapsed = now - startAnim;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      let alive = false;
      confettiParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravedad
        p.rotation += p.rotationSpeed;
        if (elapsed > 1200) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0 && p.y < confettiCanvas.height) {
          alive = true;
          confettiCtx.save();
          confettiCtx.globalAlpha = Math.max(0, p.opacity);
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          confettiCtx.restore();
        }
      });

      if (alive && elapsed < 3000) {
        confettiAnimId = requestAnimationFrame(animate);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiAnimId = null;
      }
    }

    confettiAnimId = requestAnimationFrame(animate);
  }

  // Iniciar al cargar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
