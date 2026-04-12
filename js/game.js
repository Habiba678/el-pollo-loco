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

function setupManagers() {
    gameAudio = new SoundManager(AUDIO_STORAGE_KEY);
    screenView = new GameScreen();
    screenView.setCanvas(canvas, ctx);
}

function setupMobileControls() {
    mobileControls = new MobilScreen(keyboard, resetKeyboardState);
    mobileControls.init();
}

function setupAudio() {
    gameAudio.init();
    audioMuted = gameAudio.loadMutedState();

    gameAudio.initUnlock(() => {
        if (!audioMuted && isGameRunning) {
            gameAudio.playGame();
        }
    });
}

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

function bindBackButton() {
    if (!backToStartButton) {
        return;
    }

    backToStartButton.addEventListener('click', returnToStartScreen);
}

function bindRestartButton() {
    if (!restartButton) {
        return;
    }

    restartButton.addEventListener('click', restartRoundDirectly);
}

function refreshTopInfoBar() {
    if (!topInfoBar) {
        return;
    }

    const shouldShow = !isGameRunning && !isGameFinished;
    topInfoBar.classList.toggle('hidden-bar', !shouldShow);
}

function refreshOverlayButtons() {
    placeOverlayButtons();
    refreshTopInfoBar();

    if (backToStartButton) {
        backToStartButton.style.display = isGameFinished ? 'block' : 'none';
    }

    if (restartButton) {
        restartButton.style.display = isGameFinished ? 'block' : 'none';
    }
}

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

    if (backToStartButton) {
        backToStartButton.style.left = `${canvasCenterXInsideContainer}px`;
        backToStartButton.style.transform = 'translateX(-50%)';
    }

    if (restartButton) {
        restartButton.style.left = `${canvasCenterXInsideContainer}px`;
        restartButton.style.transform = 'translateX(-50%)';
    }

    if (isGameFinished) {
        const bottomOffset = 118;
        const gap = 10;

        if (restartButton) {
            restartButton.style.top = `${canvasTopInsideContainer + canvasRect.height - bottomOffset}px`;
        }

        if (backToStartButton) {
            backToStartButton.style.top = `${canvasTopInsideContainer + canvasRect.height - bottomOffset + 38 + gap}px`;
        }

        return;
    }

    if (backToStartButton) {
        backToStartButton.style.top = `${canvasTopInsideContainer + 18}px`;
    }

    if (restartButton) {
        restartButton.style.top = `${canvasTopInsideContainer + 68}px`;
    }
}

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

function resetKeyboardState() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

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

function handleCanvasMouseMove(event) {
    screenView.handleCanvasMouseMove(event, {
        gameStarted: isGameRunning,
        gameOver: isGameFinished,
    });
}

function handleCanvasMouseLeave() {
    screenView.resetCanvasCursor();
}

function handleResize() {
    screenView.updateIconPositions();
    mobileControls.checkOrientation();
    refreshOverlayButtons();
    closeInfoMenu();
}

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

function restartRoundDirectly() {
    stopActiveWorld();
    resetKeyboardState();
    launchGame();
}

function renderStartView() {
    refreshOverlayButtons();
    screenView.showStartScreen(audioMuted);
}

function refreshAudioIcon() {
    if (!screenView) {
        return;
    }

    screenView.refreshSpeakerIcon(audioMuted);
}

function switchAudioMode() {
    audioMuted = gameAudio.toggleMute();

    if (audioMuted) {
        gameAudio.pauseAll();
    } else {
        playCurrentSceneAudio();
    }

    refreshAudioIcon();
}

function openLegalOverlay() {
    const overlay = document.getElementById('legalOverlay');
    closeInfoMenu();

    if (overlay) {
        overlay.classList.remove('hidden-layer');
        document.body.classList.add('overlay-open');
    }
}

function closeLegalOverlay() {
    const overlay = document.getElementById('legalOverlay');

    if (overlay) {
        overlay.classList.add('hidden-layer');
    }

    refreshBodyOverlayState();
}

function openGuideOverlay() {
    const overlay = document.getElementById('guideOverlay');
    closeInfoMenu();

    if (overlay) {
        overlay.classList.remove('hidden-layer');
        document.body.classList.add('overlay-open');
    }
}

function closeGuideOverlay() {
    const overlay = document.getElementById('guideOverlay');

    if (overlay) {
        overlay.classList.add('hidden-layer');
    }

    refreshBodyOverlayState();
}

function toggleInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (!menu) {
        return;
    }

    menu.classList.toggle('hidden-layer');
}

function closeInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (!menu) {
        return;
    }

    menu.classList.add('hidden-layer');
}

function openLegalOverlayFromMenu() {
    closeInfoMenu();
    openLegalOverlay();
}

function openGuideOverlayFromMenu() {
    closeInfoMenu();
    openGuideOverlay();
}

function handleOutsideMenuClick(event) {
    const menuWrap = document.querySelector('.mobile-menu-wrap');
    if (!menuWrap) {
        return;
    }

    if (!menuWrap.contains(event.target)) {
        closeInfoMenu();
    }
}

function handleOverlayEscapeKey(event) {
    if (event.key !== 'Escape') {
        return;
    }

    closeAllPanels();
}

function closeAllPanels() {
    closeLegalOverlay();
    closeGuideOverlay();
    closeInfoMenu();
}

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
    gameAudio.stopTracks(['noBottles', 'win']);
    gameAudio.playGameOver();
    refreshOverlayButtons();

    screenView.showResultScreen(
        './assets/img/You won, you lost/Game Over.png',
        audioMuted
    );
}

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