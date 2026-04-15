/**
 * Controls the game flow.
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
let hasPlayerWon = false;
let lostWithoutBottles = false;

const AUDIO_STORAGE_KEY = 'elpolo.musicMuted';
const KEY_BINDINGS = { 37: 'LEFT', 39: 'RIGHT', 38: 'UP', 40: 'DOWN', 32: 'SPACE', 68: 'D' };

/**
 * Starts the game setup.
 * @returns {void}
 */
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    backToStartButton = document.getElementById('backToStartBtn');
    restartButton = document.getElementById('nochmalBtn');
    topInfoBar = document.getElementById('topInfoBar');

    gameAudio = new AudioManager(AUDIO_STORAGE_KEY);
    gameAudio.init();
    audioMuted = gameAudio.loadMutedState();
    gameAudio.initUnlock(() => { if (!audioMuted && isGameRunning) gameAudio.playGame(); });

    screenView = new GameScreen();
    screenView.setCanvas(canvas, ctx);

    mobileControls = new MobilScreen(keyboard, resetKeyboardState);
    mobileControls.init();

    renderStartView();
    mobileControls.checkOrientation();
    refreshOverlayButtons();

    if (backToStartButton) backToStartButton.addEventListener('click', returnToStartScreen);
    if (restartButton) restartButton.addEventListener('click', restartRoundDirectly);

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', event => screenView.handleCanvasMouseMove(event, getScreenState()));
    canvas.addEventListener('mouseleave', () => screenView.resetCanvasCursor());

    ['resize', 'fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
        .forEach(type => window.addEventListener(type, handleResize));

    window.addEventListener('click', handleOutsideMenuClick);
    window.addEventListener('keydown', handleOverlayEscapeKey);
    window.addEventListener('keydown', event => setKeyState(event, true));
    window.addEventListener('keyup', event => setKeyState(event, false));
}

function setKeyState(event, pressed) {
    const key = KEY_BINDINGS[event.keyCode];
    if (key) keyboard[key] = pressed;
}

function resetKeyboardState() {
    Object.values(KEY_BINDINGS).forEach(key => keyboard[key] = false);
}

function getScreenState() {
    return { gameStarted: isGameRunning, gameOver: isGameFinished };
}

function getSceneAudioName() {
    if (hasPlayerWon) return 'win';
    if (lostWithoutBottles) return 'noBottles';
    return isGameFinished ? 'gameOver' : 'game';
}

function refreshOverlayButtons() {
    if (topInfoBar) topInfoBar.classList.toggle('hidden-bar', isGameRunning || isGameFinished);

    const gameContainer = document.getElementById('gameContainer');
    if (canvas && gameContainer) {
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        const top = canvasRect.top - containerRect.top;
        const centerX = canvasRect.left - containerRect.left + canvasRect.width / 2;

        [backToStartButton, restartButton].forEach(button => {
            if (!button) return;
            button.style.left = `${centerX}px`;
            button.style.transform = 'translateX(-50%)';
        });

        if (isGameFinished) {
            const restartTop = top + canvasRect.height - 118;
            if (restartButton) restartButton.style.top = `${restartTop}px`;
            if (backToStartButton) backToStartButton.style.top = `${restartTop + 48}px`;
        } else {
            if (backToStartButton) backToStartButton.style.top = `${top + 18}px`;
            if (restartButton) restartButton.style.top = `${top + 68}px`;
        }
    }

    if (backToStartButton) backToStartButton.style.display = isGameFinished ? 'block' : 'none';
    if (restartButton) restartButton.style.display = isGameFinished ? 'block' : 'none';
}

function stopActiveWorld() {
    if (!world) return;
    if (gameAudio) gameAudio.stopGameplaySounds();
    world.gameOver = true;
    world = null;
}

function resetGameFlags() {
    isGameRunning = false;
    isGameFinished = false;
    hasPlayerWon = false;
    lostWithoutBottles = false;
}

function returnToStartScreen() {
    resetGameFlags();
    closeAllPanels();
    stopActiveWorld();
    resetKeyboardState();

    if (gameAudio) gameAudio.stopTracks(['game', 'gameOver', 'win', 'noBottles']);
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderStartView();
}

function handleCanvasClick(event) {
    screenView.handleCanvasClick(event, getScreenState(), {
        startGame: launchGame,
        restartGame: restartRoundDirectly,
        toggleMusic: switchAudioMode,
        toggleFullscreen: () => mobileControls.toggleFullscreen()
    });
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

    if (gameAudio) {
        gameAudio.stopTracks(['gameOver', 'win', 'noBottles']);
        gameAudio.playGame();
    }

    refreshOverlayButtons();
}

function restartRoundDirectly() {
    stopActiveWorld();
    resetKeyboardState();
    launchGame();
}

function renderStartView() {
    resetGameFlags();
    refreshOverlayButtons();
    screenView.showStartScreen(audioMuted);
}

function switchAudioMode() {
    if (!gameAudio) return;
    audioMuted = gameAudio.toggleMute();
    audioMuted ? gameAudio.pauseAll() : gameAudio.playScene(getSceneAudioName());
    if (screenView) screenView.refreshSpeakerIcon(audioMuted);
}

function openOverlay(id) {
    const overlay = document.getElementById(id);
    closeInfoMenu();
    if (!overlay) return;
    overlay.classList.remove('hidden-layer');
    document.body.classList.add('overlay-open');
}

function closeOverlay(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('hidden-layer');
    refreshBodyOverlayState();
}

function toggleInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) menu.classList.toggle('hidden-layer');
}

function closeInfoMenu() {
    const menu = document.getElementById('mobileInfoMenu');
    if (menu) menu.classList.add('hidden-layer');
}

function openLegalOverlay() { openOverlay('legalOverlay'); }
function closeLegalOverlay() { closeOverlay('legalOverlay'); }
function openGuideOverlay() { openOverlay('guideOverlay'); }
function closeGuideOverlay() { closeOverlay('guideOverlay'); }
function openLegalOverlayFromMenu() { closeInfoMenu(); openLegalOverlay(); }
function openGuideOverlayFromMenu() { closeInfoMenu(); openGuideOverlay(); }

function handleOutsideMenuClick(event) {
    const menuWrap = document.querySelector('.mobile-menu-wrap');
    if (menuWrap && !menuWrap.contains(event.target)) closeInfoMenu();
}

function handleOverlayEscapeKey(event) {
    if (event.key === 'Escape') closeAllPanels();
}

function closeAllPanels() {
    closeOverlay('legalOverlay');
    closeOverlay('guideOverlay');
    closeInfoMenu();
}

function refreshBodyOverlayState() {
    const open = ['legalOverlay', 'guideOverlay'].some(id => {
        const overlay = document.getElementById(id);
        return overlay && !overlay.classList.contains('hidden-layer');
    });
    document.body.classList.toggle('overlay-open', open);
}

function showWinScreen() { finishGame('win', './assets/img/You won, you lost/You Win A.png'); }
function showGameOverScreen() { finishGame('gameOver', './assets/img/You won, you lost/Game Over.png'); }
function showNoBottlesScreen() { finishGame('noBottles', './assets/img/You won, you lost/You lost.png'); }

function finishGame(scene, imagePath) {
    isGameRunning = false;
    isGameFinished = true;
    hasPlayerWon = scene === 'win';
    lostWithoutBottles = scene === 'noBottles';

    resetKeyboardState();
    if (world) world.gameOver = true;

    if (gameAudio) {
        gameAudio.stopGameplaySounds();
        gameAudio.stopTrack('game', false);

        const actions = {
            win: () => {
                gameAudio.stopTracks(['gameOver', 'noBottles']);
                gameAudio.playWin();
            },
            noBottles: () => {
                gameAudio.stopTracks(['gameOver', 'win']);
                gameAudio.playNoBottles();
            },
            gameOver: () => {
                gameAudio.stopTracks(['noBottles', 'win']);
                gameAudio.playGameOver();
            }
        };

        actions[scene]?.();
    }

    refreshOverlayButtons();
    screenView.showResultScreen(imagePath, audioMuted);
}