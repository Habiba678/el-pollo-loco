let topInfoBar;
let startButton;
let backToStartButton;
let restartButton;

/**
 * Mounts all UI templates.
 * @returns {void}
 */
function mountTemplates() {
    setTemplate('topUiMount', getTopBarTemplate);
    setTemplate('startUiMount', getStartButtonTemplate);
    setTemplate('bottomUiMount', getBottomButtonsTemplate);
}

/**
 * Injects one template into one container.
 * @param {string} id The container id.
 * @param {Function} templateFn The template function.
 * @returns {void}
 */
function setTemplate(id, templateFn) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = templateFn();
}

/**
 * Caches UI elements.
 * @returns {void}
 */
function cacheUiElements() {
    topInfoBar = document.getElementById('topInfoBar');
    startButton = document.getElementById('startBtn');
    backToStartButton = document.getElementById('backToStartBtn');
    restartButton = document.getElementById('nochmalBtn');
}

/**
 * Updates the body class for the current screen mode.
 * @returns {void}
 */
function updateScreenModeClass() {
    document.body.classList.remove(
        'start-screen-mode',
        'game-running-mode',
        'game-over-mode'
    );

    if (!isGameRunning && !isGameFinished) {
        document.body.classList.add('start-screen-mode');
    } else if (isGameRunning) {
        document.body.classList.add('game-running-mode');
    } else {
        document.body.classList.add('game-over-mode');
    }
}

/**
 * Toggles one element display.
 * @param {string} id The element id.
 * @param {boolean} show True if element should be shown.
 * @param {string} displayValue The CSS display value.
 * @returns {void}
 */
function toggleDisplay(id, show, displayValue = 'block') {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? displayValue : 'none';
}

/**
 * Refreshes UI visibility.
 * @returns {void}
 */
function refreshOverlayButtons() {
    updateScreenModeClass();

    if (topInfoBar) {
        topInfoBar.classList.remove('hidden-bar');
    }

    toggleDisplay('startScreenUi', !isGameRunning && !isGameFinished, 'flex');
    toggleDisplay('desktopBottomActions', !isGameRunning && !isGameFinished, 'flex');

    if (backToStartButton) {
        backToStartButton.style.display = 'none';
    }

    if (restartButton) {
        restartButton.style.display = 'none';
    }
}

/**
 * Toggles one mute slash.
 * @param {string} id The slash element id.
 * @param {boolean} muted The mute state.
 * @returns {void}
 */
function toggleMuteSlash(id, muted) {
    const slash = document.getElementById(id);
    if (slash) slash.classList.toggle('hidden-audio-slash', !muted);
}

/**
 * Opens an overlay.
 * @param {string} id The overlay id.
 * @returns {void}
 */
function openOverlay(id) {
    const overlay = document.getElementById(id);
    closeInfoMenu();

    if (!overlay) return;

    overlay.classList.remove('hidden-layer');
    document.body.classList.add('overlay-open');
}

/**
 * Closes an overlay.
 * @param {string} id The overlay id.
 * @returns {void}
 */
function closeOverlay(id) {
    const overlay = document.getElementById(id);

    if (overlay) {
        overlay.classList.add('hidden-layer');
    }

    refreshBodyOverlayState();
}

/**
 * Opens the legal overlay.
 * @returns {void}
 */
function openLegalOverlay() {
    openOverlay('legalOverlay');
}

/**
 * Closes the legal overlay.
 * @returns {void}
 */
function closeLegalOverlay() {
    closeOverlay('legalOverlay');
}

/**
 * Opens the guide overlay.
 * @returns {void}
 */
function openGuideOverlay() {
    openOverlay('guideOverlay');
}

/**
 * Closes the guide overlay.
 * @returns {void}
 */
function closeGuideOverlay() {
    closeOverlay('guideOverlay');
}

/**
 * Opens the legal overlay from the mobile menu.
 * @returns {void}
 */
function openLegalOverlayFromMenu() {
    closeInfoMenu();
    openLegalOverlay();
}

/**
 * Opens the guide overlay from the mobile menu.
 * @returns {void}
 */
function openGuideOverlayFromMenu() {
    closeInfoMenu();
    openGuideOverlay();
}

/**
 * Toggles the mobile info menu.
 * @returns {void}
 */
function toggleInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) menu.classList.toggle('hidden-layer');
}

/**
 * Closes the mobile info menu.
 * @returns {void}
 */
function closeInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) menu.classList.add('hidden-layer');
}

/**
 * Closes the mobile menu when clicking outside.
 * @param {MouseEvent} event The click event.
 * @returns {void}
 */
function handleOutsideMenuClick(event) {
    const menuWrap = document.querySelector('.mobile-menu-wrap');

    if (menuWrap && !menuWrap.contains(event.target)) {
        closeInfoMenu();
    }
}

/**
 * Handles Escape for overlays.
 * @param {KeyboardEvent} event The key event.
 * @returns {void}
 */
function handleOverlayEscapeKey(event) {
    if (event.key === 'Escape') closeAllPanels();
}

/**
 * Closes all open panels.
 * @returns {void}
 */
function closeAllPanels() {
    closeOverlay('legalOverlay');
    closeOverlay('guideOverlay');
    closeInfoMenu();
}

/**
 * Refreshes the body overlay class.
 * @returns {void}
 */
function refreshBodyOverlayState() {
    const ids = ['legalOverlay', 'guideOverlay'];

    const open = ids.some(id => {
        const overlay = document.getElementById(id);
        return overlay && !overlay.classList.contains('hidden-layer');
    });

    document.body.classList.toggle('overlay-open', open);
}