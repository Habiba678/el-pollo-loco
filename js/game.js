let canvas;
let ctx;
let world;
let keyboard = new Keyboard();

let screenView;
let gameAudio;
let mobileControls;

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
    cacheCoreElements();
    cacheUiElements();
    setupAudio();
    setupSystems();
    bindEvents();
    renderStartView();
    handleResize();
}

/**
 * Caches core DOM elements.
 * @returns {void}
 */
function cacheCoreElements() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
}

/**
 * Initializes audio.
 * @returns {void}
 */
function setupAudio() {
    gameAudio = new AudioManager(AUDIO_STORAGE_KEY);
    gameAudio.init();
    audioMuted = gameAudio.loadMutedState();

    gameAudio.initUnlock(() => {
        if (!audioMuted && isGameRunning) gameAudio.playGame();
    });
}

/**
 * Initializes screen systems.
 * @returns {void}
 */
function setupSystems() {
    screenView = new GameScreen();
    screenView.setCanvas(canvas, ctx);

    mobileControls = new MobilScreen(keyboard, resetKeyboardState);
    mobileControls.init();
}

/**
 * Binds UI and window events.
 * @returns {void}
 */
function bindEvents() {
    bindClick(backToStartButton, returnToStartScreen);
    bindClick(restartButton, restartRoundDirectly);
    bindClick(startButton, launchGame);

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
 * Binds a click handler if the element exists.
 * @param {HTMLElement|null} element The element.
 * @param {Function} handler The click handler.
 * @returns {void}
 */
function bindClick(element, handler) {
    if (element) element.addEventListener('click', handler);
}

/**
 * Updates one keyboard state.
 * @param {KeyboardEvent} event The keyboard event.
 * @param {boolean} pressed True if pressed.
 * @returns {void}
 */
function setKeyState(event, pressed) {
    const key = KEY_BINDINGS[event.keyCode];
    if (key) keyboard[key] = pressed;
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
 * Stops the active world safely.
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
 * Returns to the start screen.
 * @returns {void}
 */
function returnToStartScreen() {
    stopActiveWorld();
    resetKeyboardState();
    closeAllPanels();
    resetGameFlags();

    if (gameAudio) {
        gameAudio.stopTracks(['game', 'gameOver', 'win', 'noBottles']);
        gameAudio.stopGameplaySounds();
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
    if (mobileControls) mobileControls.checkOrientation();
    refreshOverlayButtons();
    closeInfoMenu();
}

/**
 * Starts a new round.
 * @returns {void}
 */
function launchGame() {
    stopActiveWorld();
    resetKeyboardState();
    closeAllPanels();

    isGameRunning = true;
    isGameFinished = false;
    hasPlayerWon = false;
    lostWithoutBottles = false;

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
    toggleMuteSlash('audioMuteSlash', audioMuted);
    toggleMuteSlash('mobileAudioMuteSlash', audioMuted);
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

    if (world) world.gameOver = true;

    if (gameAudio) {
        gameAudio.stopGameplaySounds();
        gameAudio.stopTrack('game', false);
    }

    refreshOverlayButtons();
    screenView.showResultScreen(imagePath, audioMuted);
}