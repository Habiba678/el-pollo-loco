/**
 * Handles game setup, menu flow, audio state and canvas controls.
 */
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

let isGameRunning = false;
let isGameFinished = false;
let audioMuted = false;
const AUDIO_STORAGE_KEY = 'elpolo.musicMuted';
let hasPlayerWon = false;
let lostWithoutBottles = false;

/**
 * Starts the basic game setup.
 *
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    backToStartButton = document.getElementById('backToStartBtn');
    restartButton = document.getElementById('nochmalBtn');
    topInfoBar = document.getElementById('topInfoBar');

    setupManagers();
    setupAudio();
    renderStartView();
    setupMobileControls();
    mobileControls.checkOrientation();
    refreshOverlayButtons();
    bindBackButton();
    bindRestartButton();
    bindRuntimeEvents();
}

/**
 * Creates the screen and audio helpers.
 *
 * @returns {void}
 */
function setupManagers() {
    gameAudio = new SoundManager(AUDIO_STORAGE_KEY);
    screenView = new GameScreen();
    screenView.setCanvas(canvas, ctx);
}

/**
 * Sets up the mobile touch controller.
 *
 * @returns {void}
 */
function setupMobileControls() {
    mobileControls = new MobilScreen(keyboard, resetKeyboardState);
    mobileControls.init();
}

/**
 * Loads audio settings and unlocks playback after interaction.
 *
 * @returns {void}
 */
function setupAudio() {
    gameAudio.init();
    audioMuted = gameAudio.loadMutedState();

    gameAudio.initUnlock(() => {
        if (!audioMuted) {
            playCurrentSceneAudio();
        }
    });
}

/**
 * Registers canvas and window events.
 *
 * @returns {void}
 */
function bindRuntimeEvents() {
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

    window.addEventListener('resize', handleResize);
    window.addEventListener('fullscreenchange', handleResize);
    window.addEventListener('webkitfullscreenchange', handleResize);
    window.addEventListener('msfullscreenchange', handleResize);

    window.addEventListener('click', handleOutsideMenuClick);
    window.addEventListener('keydown', handleOverlayEscapeKey);
}

/**
 * Plays the matching audio for the active screen state.
 *
 * @returns {void}
 */
function playCurrentSceneAudio() {
    const sceneName = hasPlayerWon
        ? 'win'
        : lostWithoutBottles
            ? 'noBottles'
            : isGameFinished
                ? 'gameOver'
                : 'game';

    gameAudio.playScene(sceneName);
}

/**
 * Connects the back-to-start button.
 *
 * @returns {void}
 */
function bindBackButton() {
    if (!backToStartButton) {
        return;
    }

    backToStartButton.addEventListener('click', returnToStartScreen);
}

/**
 * Connects the restart button.
 *
 * @returns {void}
 */
function bindRestartButton() {
    if (!restartButton) {
        return;
    }

    restartButton.addEventListener('click', restartRoundDirectly);
}

/**
 * Shows or hides the top info buttons depending on game state.
 *
 * @returns {void}
 */
function refreshTopInfoBar() {
    if (!topInfoBar) {
        return;
    }

    const shouldShow = !isGameRunning && !isGameFinished;
    topInfoBar.classList.toggle('hidden-bar', !shouldShow);
}

/**
 * Updates the visibility of the overlay buttons.
 *
 * @returns {void}
 */
function refreshOverlayButtons() {
    placeOverlayButtons();
    refreshTopInfoBar();

    if (backToStartButton) {
        backToStartButton.style.display = (isGameRunning || isGameFinished) ? 'block' : 'none';
    }

    if (restartButton) {
        restartButton.style.display = isGameFinished ? 'block' : 'none';
    }
}

/**
 * Places the overlay buttons relative to the game container and canvas.
 *
 * @returns {void}
 */
function placeOverlayButtons() {
    if (!canvas) {
        return;
    }

    const gameContainer = document.getElementById('gameContainer');
    if (!gameContainer) {
        return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    const canvasLeftInsideContainer = canvasRect.left - containerRect.left;
    const canvasTopInsideContainer = canvasRect.top - containerRect.top;
    const canvasCenterXInsideContainer = canvasLeftInsideContainer + canvasRect.width / 2;
    const canvasBottomInsideContainer = canvasTopInsideContainer + canvasRect.height;

    if (backToStartButton) {
        backToStartButton.style.left = `${canvasCenterXInsideContainer}px`;
        backToStartButton.style.transform = 'translateX(-50%)';
    }

    if (restartButton) {
        restartButton.style.left = `${canvasCenterXInsideContainer}px`;
        restartButton.style.transform = 'translateX(-50%)';
    }

    if (isGameFinished) {
        if (backToStartButton) {
            backToStartButton.style.top = `${canvasBottomInsideContainer - 130}px`;
        }

        if (restartButton) {
            restartButton.style.top = `${canvasBottomInsideContainer - 65}px`;
        }

        return;
    }

    if (isGameRunning) {
        if (backToStartButton) {
            backToStartButton.style.top = `${canvasTopInsideContainer + 12}px`;
        }

        if (restartButton) {
            restartButton.style.top = `${canvasBottomInsideContainer - 60}px`;
        }

        return;
    }

    if (backToStartButton) {
        backToStartButton.style.top = `${canvasTopInsideContainer + 12}px`;
    }

    if (restartButton) {
        restartButton.style.top = `${canvasBottomInsideContainer - 60}px`;
    }
}

/**
 * Stops the current world safely.
 *
 * @returns {void}
 */
function stopActiveWorld() {
    if (!world) {
        return;
    }

    if (gameAudio) {
        gameAudio.stopGameplaySounds();
    }

    world.gameOver = true;
    world = null;
}

/**
 * Resets all keyboard flags.
 *
 * @returns {void}
 */
function resetKeyboardState() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

/**
 * Returns from gameplay back to the start screen.
 *
 * @returns {void}
 */
function returnToStartScreen() {
    isGameRunning = false;
    isGameFinished = false;
    hasPlayerWon = false;
    lostWithoutBottles = false;

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
 * Passes the canvas click to the screen controller.
 *
 * @param {MouseEvent} event Browser click event.
 * @returns {void}
 */
function handleCanvasClick(event) {
    screenView.handleCanvasClick(
        event,
        { gameStarted: isGameRunning, gameOver: isGameFinished },
        {
            startGame: launchGame,
            restartGame: restartRoundDirectly,
            toggleMusic: switchAudioMode,
            toggleFullscreen: () => mobileControls.toggleFullscreen(),
        }
    );
}

/**
 * Updates hover state over the canvas.
 *
 * @param {MouseEvent} event Browser mouse event.
 * @returns {void}
 */
function handleCanvasMouseMove(event) {
    screenView.handleCanvasMouseMove(event, {
        gameStarted: isGameRunning,
        gameOver: isGameFinished,
    });
}

/**
 * Restores the default canvas cursor.
 *
 * @returns {void}
 */
function handleCanvasMouseLeave() {
    screenView.resetCanvasCursor();
}

/**
 * Refreshes responsive positions on resize.
 *
 * @returns {void}
 */
function handleResize() {
    screenView.updateIconPositions();
    mobileControls.checkOrientation();
    refreshOverlayButtons();
    closeInfoMenu();
}

/**
 * Starts a new round.
 *
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

    mobileControls.checkOrientation();
    gameAudio.stopTracks(['gameOver', 'win', 'noBottles']);
    gameAudio.playGame();
    refreshOverlayButtons();
}

/**
 * Restarts immediately.
 *
 * @returns {void}
 */
function restartRoundDirectly() {
    stopActiveWorld();
    resetKeyboardState();
    launchGame();
}

/**
 * Draws the start screen.
 *
 * @returns {void}
 */
function renderStartView() {
    refreshOverlayButtons();
    screenView.showStartScreen(audioMuted, () => {
        gameAudio.playGame();
    });
}

/**
 * Refreshes the speaker icon.
 *
 * @returns {void}
 */
function refreshAudioIcon() {
    if (!screenView) {
        return;
    }

    screenView.refreshSpeakerIcon(audioMuted);
}

/**
 * Toggles mute mode and refreshes active audio.
 *
 * @returns {void}
 */
function switchAudioMode() {
    audioMuted = gameAudio.toggleMute();

    if (audioMuted) {
        gameAudio.pauseAll();
    } else {
        playCurrentSceneAudio();
    }

    refreshAudioIcon();
}

/**
 * Opens the legal overlay.
 *
 * @returns {void}
 */
function openLegalOverlay() {
    const overlay = document.getElementById('legalOverlay');
    closeInfoMenu();

    if (overlay) {
        overlay.classList.remove('hidden-layer');
        document.body.classList.add('overlay-open');
    }
}

/**
 * Closes the legal overlay.
 *
 * @returns {void}
 */
function closeLegalOverlay() {
    const overlay = document.getElementById('legalOverlay');

    if (overlay) {
        overlay.classList.add('hidden-layer');
    }

    refreshBodyOverlayState();
}

/**
 * Opens the guide overlay.
 *
 * @returns {void}
 */
function openGuideOverlay() {
    const overlay = document.getElementById('guideOverlay');
    closeInfoMenu();

    if (overlay) {
        overlay.classList.remove('hidden-layer');
        document.body.classList.add('overlay-open');
    }
}

/**
 * Closes the guide overlay.
 *
 * @returns {void}
 */
function closeGuideOverlay() {
    const overlay = document.getElementById('guideOverlay');

    if (overlay) {
        overlay.classList.add('hidden-layer');
    }

    refreshBodyOverlayState();
}

/**
 * Opens or closes the mobile info menu.
 *
 * @returns {void}
 */
function toggleInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (!menu) {
        return;
    }

    menu.classList.toggle('hidden-layer');
}

/**
 * Closes the mobile info menu.
 *
 * @returns {void}
 */
function closeInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (!menu) {
        return;
    }

    menu.classList.add('hidden-layer');
}

/**
 * Opens the legal overlay from the mobile menu.
 *
 * @returns {void}
 */
function openLegalOverlayFromMenu() {
    closeInfoMenu();
    openLegalOverlay();
}

/**
 * Opens the guide overlay from the mobile menu.
 *
 * @returns {void}
 */
function openGuideOverlayFromMenu() {
    closeInfoMenu();
    openGuideOverlay();
}

/**
 * Closes the mobile menu when clicking outside of it.
 *
 * @param {MouseEvent} event Browser click event.
 * @returns {void}
 */
function handleOutsideMenuClick(event) {
    const menuWrap = document.querySelector('.mobile-menu-wrap');
    if (!menuWrap) {
        return;
    }

    if (!menuWrap.contains(event.target)) {
        closeInfoMenu();
    }
}

/**
 * Closes open overlays with the Escape key.
 *
 * @param {KeyboardEvent} event Keyboard event.
 * @returns {void}
 */
function handleOverlayEscapeKey(event) {
    if (event.key !== 'Escape') {
        return;
    }

    closeAllPanels();
}

/**
 * Closes all overlays and menus.
 *
 * @returns {void}
 */
function closeAllPanels() {
    closeLegalOverlay();
    closeGuideOverlay();
    closeInfoMenu();
}

/**
 * Updates the body class depending on open overlays.
 *
 * @returns {void}
 */
function refreshBodyOverlayState() {
    const legalOverlay = document.getElementById('legalOverlay');
    const guideOverlay = document.getElementById('guideOverlay');

    const legalOpen = legalOverlay && !legalOverlay.classList.contains('hidden-layer');
    const guideOpen = guideOverlay && !guideOverlay.classList.contains('hidden-layer');

    if (legalOpen || guideOpen) {
        document.body.classList.add('overlay-open');
    } else {
        document.body.classList.remove('overlay-open');
    }
}

/**
 * Shows the win screen.
 *
 * @returns {void}
 */
function showWinScreen() {
    isGameRunning = false;
    isGameFinished = true;
    hasPlayerWon = true;
    lostWithoutBottles = false;

    resetKeyboardState();

    if (world) {
        world.gameOver = true;
    }

    gameAudio.stopGameplaySounds();
    gameAudio.stopTrack('game', false);
    gameAudio.stopTracks(['gameOver', 'noBottles']);
    gameAudio.playWin();
    refreshOverlayButtons();

    screenView.showResultScreen(
        './assets/img/You won, you lost/You Win A.png',
        audioMuted
    );
}

/**
 * Shows the normal game over screen.
 *
 * @returns {void}
 */
function showGameOverScreen() {
    isGameRunning = false;
    isGameFinished = true;
    hasPlayerWon = false;
    lostWithoutBottles = false;

    resetKeyboardState();

    if (world) {
        world.gameOver = true;
    }

    gameAudio.stopGameplaySounds();
    gameAudio.stopTrack('game', false);
    gameAudio.stopTracks(['noBottles']);
    gameAudio.playGameOver();
    refreshOverlayButtons();

    screenView.showResultScreen(
        './assets/img/9_intro_outro_screens/game_over/game over.png',
        audioMuted
    );
}

/**
 * Shows the lose screen for the no-bottles case.
 *
 * @returns {void}
 */
function showNoBottlesScreen() {
    isGameRunning = false;
    isGameFinished = true;
    hasPlayerWon = false;
    lostWithoutBottles = true;

    resetKeyboardState();

    if (world) {
        world.gameOver = true;
    }

    gameAudio.stopGameplaySounds();
    gameAudio.stopTrack('game', false);
    gameAudio.stopTracks(['gameOver', 'win']);
    gameAudio.playNoBottles();
    refreshOverlayButtons();

    screenView.showResultScreen(
        './assets/img/You won, you lost/You lost.png',
        audioMuted
    );
}

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 37) { keyboard.LEFT = true; }
    if (e.keyCode === 39) { keyboard.RIGHT = true; }
    if (e.keyCode === 38) { keyboard.UP = true; }
    if (e.keyCode === 40) { keyboard.DOWN = true; }
    if (e.keyCode === 32) { keyboard.SPACE = true; }
    if (e.keyCode === 68) { keyboard.D = true; }
});

window.addEventListener('keyup', (e) => {
    if (e.keyCode === 37) { keyboard.LEFT = false; }
    if (e.keyCode === 39) { keyboard.RIGHT = false; }
    if (e.keyCode === 38) { keyboard.UP = false; }
    if (e.keyCode === 40) { keyboard.DOWN = false; }
    if (e.keyCode === 32) { keyboard.SPACE = false; }
    if (e.keyCode === 68) { keyboard.D = false; }
});