/**
 * Manages music and sound effects across the game.
 */
class SoundManager {
    constructor(storageKey) {
        this.savedAudioKey = storageKey;
        this.audioMuted = false;
        this.audioUnlocked = false;
        this.audioPool = {};
        this.effectInstances = [];
    }

    init() {
        if (this.audioPool.game) {
            return;
        }

        this.audioPool.game = this.buildAudio('./assets/audio/music.mp3', true, 0.06);
        this.audioPool.gameOver = this.buildAudio('./assets/audio/freesound_community_ver-arcade-6435.mp3', false, 0.10);
        this.audioPool.win = this.buildAudio('./assets/audio/win.mp3', false, 0.10);
        this.audioPool.noBottles = this.buildAudio('./assets/audio/freesound_community_ver-arcade-6435.mp3', false, 0.10);

        this.audioPool.run = this.buildAudio('./assets/audio/running.mp3', true, 0.03);
        this.audioPool.jump = this.buildAudio('./assets/audio/jump.mp3', false, 0.06);

        this.audioPool.bottleCollect = this.buildAudio('./assets/audio/bottle.mp3', false, 0.05);
        this.audioPool.coinCollect = this.buildAudio('./assets/audio/bottle.mp3', false, 0.04);

        this.audioPool.bottleBreak = this.buildAudio('./assets/audio/glass.mp3', false, 0.06);
        this.audioPool.enemyKill = this.buildAudio('./assets/audio/chicken.mp3', false, 0.06);
        this.audioPool.characterHit = this.buildAudio('./assets/audio/el_pollo_loco.mp3', false, 0.07);
        this.audioPool.endbossHit = this.buildAudio('./assets/audio/throw.mp3', false, 0.05);
    }

    buildAudio(src, loop = false, volume = 0.15) {
        const audioItem = new Audio(src);
        audioItem.loop = loop;
        audioItem.volume = volume;
        audioItem.preload = 'auto';
        return audioItem;
    }

    loadMutedState() {
        try {
            const storedState = localStorage.getItem(this.savedAudioKey);
            if (storedState !== null) {
                this.audioMuted = storedState === 'true';
            }
        } catch (error) {
            console.warn('Unable to read music state from localStorage:', error);
        }

        return this.audioMuted;
    }

    saveMutedState() {
        try {
            localStorage.setItem(this.savedAudioKey, String(this.audioMuted));
        } catch (error) {
            console.warn('Unable to save music state in localStorage:', error);
        }
    }

    initUnlock(onUnlock) {
        const unlockSound = () => {
            this.audioUnlocked = true;

            if (typeof onUnlock === 'function') {
                onUnlock();
            }
        };

        window.addEventListener('pointerdown', unlockSound, { once: true });
        window.addEventListener('keydown', unlockSound, { once: true });
    }

    toggleMute() {
        this.audioMuted = !this.audioMuted;
        this.saveMutedState();
        return this.audioMuted;
    }

    isMuted() {
        return this.audioMuted;
    }

    pauseAll() {
        Object.keys(this.audioPool).forEach((trackName) => {
            this.stopTrack(trackName, false);
        });

        this.stopEffectSounds();
    }

    stopGameplaySounds() {
        this.stopTrack('run', false);
        this.stopEffectSounds();
    }

    stopTracks(names, reset = true) {
        names.forEach((trackName) => this.stopTrack(trackName, reset));
    }

    stopTrack(name, reset = true) {
        const currentAudio = this.audioPool[name];

        if (!currentAudio) {
            return;
        }

        currentAudio.pause();

        if (reset) {
            currentAudio.currentTime = 0;
        }
    }

    playGame() {
        this.playTrack('game', 'Audio playback blocked or failed:', false);
    }

    playGameOver() {
        this.playTrack('gameOver', 'Game-over audio playback blocked or failed:');
    }

    playWin() {
        this.playTrack('win', 'Win audio playback blocked or failed:');
    }

    playNoBottles() {
        this.playTrack('noBottles', 'No-bottles audio playback blocked or failed:');
    }

    playRun() {
        this.playTrack('run', 'Run audio playback blocked or failed:', false);
    }

    stopRun() {
        this.stopTrack('run', false);
    }

    playJump() {
        this.playEffectTrack('jump', 'Jump audio playback blocked or failed:');
    }

    playBottleCollect() {
        this.playEffectTrack('bottleCollect', 'Bottle collect audio playback blocked or failed:');
    }

    playCoinCollect() {
        this.playEffectTrack('coinCollect', 'Coin collect audio playback blocked or failed:');
    }

    playBottleBreak() {
        this.playEffectTrack('bottleBreak', 'Bottle break audio playback blocked or failed:');
    }

    playEnemyKill() {
        this.playEffectTrack('enemyKill', 'Enemy kill audio playback blocked or failed:');
    }

    playCharacterHit() {
        this.playEffectTrack('characterHit', 'Character hit audio playback blocked or failed:');
    }

    playEndbossHit() {
        this.playEffectTrack('endbossHit', 'Endboss hit audio playback blocked or failed:');
    }

    stopEndbossHit() {
        this.stopTrack('endbossHit', true);
    }

    playScene(scene) {
        if (scene === 'win') {
            this.playWin();
            return;
        }

        if (scene === 'noBottles') {
            this.playNoBottles();
            return;
        }

        if (scene === 'gameOver') {
            this.playGameOver();
            return;
        }

        this.playGame();
    }

    playTrack(name, warningMessage, reset = true) {
        const currentAudio = this.audioPool[name];

        if (!currentAudio || this.audioMuted || !this.audioUnlocked) {
            return;
        }

        if (!reset && !currentAudio.paused) {
            return;
        }

        if (reset) {
            currentAudio.currentTime = 0;
        }

        const playback = currentAudio.play();

        if (playback && typeof playback.catch === 'function') {
            playback.catch((error) => {
                this.handlePlayError(warningMessage, error);
            });
        }
    }

    playEffectTrack(name, warningMessage) {
        const currentAudio = this.audioPool[name];

        if (!currentAudio || this.audioMuted || !this.audioUnlocked) {
            return;
        }

        const effectCopy = currentAudio.cloneNode();
        effectCopy.volume = currentAudio.volume;
        effectCopy.currentTime = 0;

        this.effectInstances.push(effectCopy);

        effectCopy.addEventListener('ended', () => {
            this.removeActiveEffectAudio(effectCopy);
        }, { once: true });

        const playback = effectCopy.play();

        if (playback && typeof playback.catch === 'function') {
            playback.catch((error) => {
                this.removeActiveEffectAudio(effectCopy);
                this.handlePlayError(warningMessage, error);
            });
        }
    }

    removeActiveEffectAudio(audio) {
        this.effectInstances = this.effectInstances.filter((item) => item !== audio);
    }

    stopEffectSounds() {
        this.effectInstances.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });

        this.effectInstances = [];
    }

    handlePlayError(warningMessage, error) {
        if (error && error.name === 'NotAllowedError') {
            return;
        }

        console.warn(warningMessage, error);
    }
}