let canvas;
let ctx;
let world;
let keyboard = new Keyboard();

let screenView;
let backToStartButton;
let restartButton;
let gameAudio;
let mobileControls;
let topInfoBar;
let startButton;

let isGameRunning = false;
let isGameFinished = false;
let audioMuted = false;
let hasPlayerWon = false;
let lostWithoutBottles = false;

const AUDIO_STORAGE_KEY = 'elpolo.musicMuted';
const KEY_BINDINGS = {
    37: 'LEFT',
    39: 'RIGHT',
    38: 'UP',
    40: 'DOWN',
    32: 'SPACE',
    68: 'D'
};

/**
 * Initializes the game.
 * @returns {void}
 */
function init() {
    mountTemplates();

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    backToStartButton = document.getElementById('backToStartBtn');
    restartButton = document.getElementById('nochmalBtn');
    topInfoBar = document.getElementById('topInfoBar');
    startButton = document.getElementById('startBtn');

    gameAudio = new AudioManager(AUDIO_STORAGE_KEY);
    gameAudio.init();
    audioMuted = gameAudio.loadMutedState();
    gameAudio.initUnlock(() => {
        if (!audioMuted && isGameRunning) {
            gameAudio.playGame();
        }
    });

    screenView = new GameScreen();
    screenView.setCanvas(canvas, ctx);

    mobileControls = new MobilScreen(keyboard, resetKeyboardState);
    mobileControls.init();

    renderStartView();
    mobileControls.checkOrientation();
    refreshOverlayButtons();

    if (backToStartButton) {
        backToStartButton.addEventListener('click', returnToStartScreen);
    }

    if (restartButton) {
        restartButton.addEventListener('click', restartRoundDirectly);
    }

    if (startButton) {
        startButton.addEventListener('click', launchGame);
    }

    [
        'resize',
        'fullscreenchange',
        'webkitfullscreenchange',
        'msfullscreenchange'
    ].forEach(type => window.addEventListener(type, handleResize));

    window.addEventListener('click', handleOutsideMenuClick);
    window.addEventListener('keydown', handleOverlayEscapeKey);
    window.addEventListener('keydown', event => setKeyState(event, true));
    window.addEventListener('keyup', event => setKeyState(event, false));
}

/**
 * Mounts the HTML templates into their containers.
 * @returns {void}
 */
function mountTemplates() {
    const topUiMount = document.getElementById('topUiMount');
    const startUiMount = document.getElementById('startUiMount');
    const bottomUiMount = document.getElementById('bottomUiMount');

    if (topUiMount) {
        topUiMount.innerHTML = getTopBarTemplate();
    }

    if (startUiMount) {
        startUiMount.innerHTML = getStartButtonTemplate();
    }

    if (bottomUiMount) {
        bottomUiMount.innerHTML = getBottomButtonsTemplate();
    }
}

/**
 * Sets one keyboard state.
 * @param {KeyboardEvent} event The keyboard event.
 * @param {boolean} pressed True if key is pressed.
 * @returns {void}
 */
function setKeyState(event, pressed) {
    const key = KEY_BINDINGS[event.keyCode];
    if (key) {
        keyboard[key] = pressed;
    }
}

/**
 * Resets all keyboard states.
 * @returns {void}
 */
function resetKeyboardState() {
    Object.values(KEY_BINDINGS).forEach(key => {
        keyboard[key] = false;
    });
}

/**
 * Updates start screen and overlay visibility.
 * @returns {void}
 */
function refreshOverlayButtons() {
    if (topInfoBar) {
        topInfoBar.classList.remove('hidden-bar');
    }

    const startScreenUi = document.getElementById('startScreenUi');
    const desktopBottomActions = document.getElementById('desktopBottomActions');

    if (startScreenUi) {
        startScreenUi.style.display = !isGameRunning && !isGameFinished ? 'flex' : 'none';
    }

    if (desktopBottomActions) {
        desktopBottomActions.style.display = !isGameRunning && !isGameFinished ? 'flex' : 'none';
    }

    if (backToStartButton) {
        backToStartButton.style.display = 'none';
    }

    if (restartButton) {
        restartButton.style.display = 'none';
    }
}

/**
 * Stops the current world safely.
 * @returns {void}
 */
function stopActiveWorld() {
    if (!world) return;

    if (gameAudio) {
        gameAudio.stopGameplaySounds();
    }

    world.gameOver = true;
    world = null;
}

/**
 * Resets internal game state flags.
 * @returns {void}
 */
function resetGameFlags() {
    isGameRunning = false;
    isGameFinished = false;
    hasPlayerWon = false;
    lostWithoutBottles = false;
}

/**
 * Returns from the current state to the start screen.
 * @returns {void}
 */
function returnToStartScreen() {
    resetGameFlags();
    closeAllPanels();
    stopActiveWorld();
    resetKeyboardState();

    if (gameAudio) {
        gameAudio.stopTracks(['game', 'gameOver', 'win', 'noBottles']);
    }

    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    renderStartView();
}

/**
 * Handles resize and fullscreen changes.
 * @returns {void}
 */
function handleResize() {
    if (mobileControls) {
        mobileControls.checkOrientation();
    }

    refreshOverlayButtons();
    closeInfoMenu();
}

/**
 * Starts a new round.
 * @returns {void}
 */
function launchGame() {
    isGameRunning = true;
    isGameFinished = false;
    hasPlayerWon = false;
    lostWithoutBottles = false;

    closeAllPanels();
    stopActiveWorld();
    resetKeyboardState();

    world = new World(canvas, keyboard, gameAudio);

    if (mobileControls) {
        mobileControls.checkOrientation();
    }

    if (gameAudio) {
        gameAudio.stopTracks(['gameOver', 'win', 'noBottles']);
        gameAudio.playGame();
    }

    refreshOverlayButtons();
}

/**
 * Restarts the game directly.
 * @returns {void}
 */
function restartRoundDirectly() {
    stopActiveWorld();
    resetKeyboardState();
    launchGame();
}

/**
 * Renders the start screen.
 * @returns {void}
 */
function renderStartView() {
    resetGameFlags();
    refreshOverlayButtons();
    screenView.showStartScreen(audioMuted);
}

/**
 * Toggles audio mode.
 * @returns {void}
 */
function switchAudioMode() {
    if (!gameAudio) return;

    audioMuted = gameAudio.toggleMute();

    const audioSlash = document.getElementById('audioMuteSlash');
    const mobileAudioSlash = document.getElementById('mobileAudioMuteSlash');

    if (audioSlash) {
        audioSlash.classList.toggle('hidden-audio-slash', !audioMuted);
    }

    if (mobileAudioSlash) {
        mobileAudioSlash.classList.toggle('hidden-audio-slash', !audioMuted);
    }
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
 * Toggles the mobile info menu.
 * @returns {void}
 */
function toggleInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) {
        menu.classList.toggle('hidden-layer');
    }
}

/**
 * Closes the mobile info menu.
 * @returns {void}
 */
function closeInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) {
        menu.classList.add('hidden-layer');
    }
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
 * Opens the legal overlay from mobile menu.
 * @returns {void}
 */
function openLegalOverlayFromMenu() {
    closeInfoMenu();
    openLegalOverlay();
}

/**
 * Opens the guide overlay from mobile menu.
 * @returns {void}
 */
function openGuideOverlayFromMenu() {
    closeInfoMenu();
    openGuideOverlay();
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
    if (event.key === 'Escape') {
        closeAllPanels();
    }
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
 * Refreshes body overlay class depending on open overlays.
 * @returns {void}
 */
function refreshBodyOverlayState() {
    const open = ['legalOverlay', 'guideOverlay'].some(id => {
        const overlay = document.getElementById(id);
        return overlay && !overlay.classList.contains('hidden-layer');
    });

    document.body.classList.toggle('overlay-open', open);
}

/**
 * Shows the win screen.
 * @returns {void}
 */
function showWinScreen() {
    finishGame('./assets/img/You won, you lost/You Win A.png');
}

/**
 * Shows the standard game over screen.
 * @returns {void}
 */
function showGameOverScreen() {
    finishGame('./assets/img/You won, you lost/Game Over.png');
}

/**
 * Shows the no-bottles result screen.
 * @returns {void}
 */
function showNoBottlesScreen() {
    finishGame('./assets/img/You won, you lost/You lost.png');
}

/**
 * Finishes the game and shows a result image.
 * @param {string} imagePath The result image path.
 * @returns {void}
 */
function finishGame(imagePath) {
    isGameRunning = false;
    isGameFinished = true;

    resetKeyboardState();

    if (world) {
        world.gameOver = true;
    }

    if (gameAudio) {
        gameAudio.stopGameplaySounds();
        gameAudio.stopTrack('game', false);
    }

    refreshOverlayButtons();
    screenView.showResultScreen(imagePath, audioMuted);
}