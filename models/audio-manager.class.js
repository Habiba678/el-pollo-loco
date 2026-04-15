/**
 * Controls game music and sound effects.
 */
class AudioManager {
    /**
     * Creates the audio manager.
     * @param {string} storageKey The local storage key.
     */
    constructor(storageKey) {
        this.savedAudioKey = storageKey;
        this.audioMuted = false;
        this.audioUnlocked = false;
        this.audioPool = {};
        this.effectInstances = [];
    }

    /**
     * Loads all audio files.
     * @returns {void}
     */
    init() {
        if (this.audioPool.game) return;

        const tracks = {
            game: ['./assets/audio/music.mp3', true, 0.06],
            gameOver: ['./assets/audio/freesound_community_ver-arcade-6435.mp3', false, 0.10],
            win: ['./assets/audio/win.mp3', false, 0.10],
            noBottles: ['./assets/audio/freesound_community_ver-arcade-6435.mp3', false, 0.10],
            run: ['./assets/audio/running.mp3', true, 0.03],
            jump: ['./assets/audio/jump.mp3', false, 0.06],
            bottleCollect: ['./assets/audio/bottle.mp3', false, 0.05],
            coinCollect: ['./assets/audio/bottle.mp3', false, 0.04],
            bottleBreak: ['./assets/audio/glass.mp3', false, 0.06],
            enemyKill: ['./assets/audio/chicken.mp3', false, 0.06],
            characterHit: ['./assets/audio/el_pollo_loco.mp3', false, 0.07],
            endbossHit: ['./assets/audio/throw.mp3', false, 0.05]
        };

        Object.entries(tracks).forEach(([name, [src, loop, volume]]) => {
            this.audioPool[name] = this.buildAudio(src, loop, volume);
        });
    }

    /**
     * Creates one audio object.
     * @param {string} src The audio path.
     * @param {boolean} loop The loop state.
     * @param {number} volume The volume.
     * @returns {HTMLAudioElement}
     */
    buildAudio(src, loop = false, volume = 0.15) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = volume;
        audio.preload = 'auto';
        return audio;
    }

    /**
     * Loads the mute state.
     * @returns {boolean}
     */
    loadMutedState() {
        try {
            const stored = localStorage.getItem(this.savedAudioKey);
            if (stored !== null) this.audioMuted = stored === 'true';
        } catch (error) {
            console.warn('Unable to read music state from localStorage:', error);
        }
        return this.audioMuted;
    }

    /**
     * Saves the mute state.
     * @returns {void}
     */
    saveMutedState() {
        try {
            localStorage.setItem(this.savedAudioKey, String(this.audioMuted));
        } catch (error) {
            console.warn('Unable to save music state in localStorage:', error);
        }
    }

    /**
     * Unlocks audio after user input.
     * @param {Function} onUnlock Runs after audio unlock.
     * @returns {void}
     */
    initUnlock(onUnlock) {
        const unlock = () => {
            this.audioUnlocked = true;
            if (typeof onUnlock === 'function') onUnlock();
        };

        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    /**
     * Toggles mute mode.
     * @returns {boolean}
     */
    toggleMute() {
        this.audioMuted = !this.audioMuted;
        this.saveMutedState();
        return this.audioMuted;
    }

    /**
     * Pauses all sounds.
     * @returns {void}
     */
    pauseAll() {
        Object.keys(this.audioPool).forEach(name => this.stopTrack(name, false));
        this.stopEffectSounds();
    }

    /**
     * Stops gameplay sounds.
     * @returns {void}
     */
    stopGameplaySounds() {
        this.stopTrack('run', false);
        this.stopEffectSounds();
    }

    /**
     * Stops multiple tracks.
     * @param {string[]} names The track names.
     * @param {boolean} reset Resets playback time.
     * @returns {void}
     */
    stopTracks(names, reset = true) {
        names.forEach(name => this.stopTrack(name, reset));
    }

    /**
     * Stops one track.
     * @param {string} name The track name.
     * @param {boolean} reset Resets playback time.
     * @returns {void}
     */
    stopTrack(name, reset = true) {
        const audio = this.audioPool[name];
        if (!audio) return;
        audio.pause();
        if (reset) audio.currentTime = 0;
    }

    /**
     * Plays the game music.
     * @returns {void}
     */
    playGame() { this.playTrack('game', 'Audio playback blocked or failed:', false); }

    /**
     * Plays the game over music.
     * @returns {void}
     */
    playGameOver() { this.playTrack('gameOver', 'Game-over audio playback blocked or failed:'); }

    /**
     * Plays the win music.
     * @returns {void}
     */
    playWin() { this.playTrack('win', 'Win audio playback blocked or failed:'); }

    /**
     * Plays the no-bottles music.
     * @returns {void}
     */
    playNoBottles() { this.playTrack('noBottles', 'No-bottles audio playback blocked or failed:'); }

    /**
     * Plays the bottle collect sound.
     * @returns {void}
     */
    playBottleCollect() { this.playEffectTrack('bottleCollect', 'Bottle collect audio playback blocked or failed:'); }

    /**
     * Plays the coin collect sound.
     * @returns {void}
     */
    playCoinCollect() { this.playEffectTrack('coinCollect', 'Coin collect audio playback blocked or failed:'); }

    /**
     * Plays the bottle break sound.
     * @returns {void}
     */
    playBottleBreak() { this.playEffectTrack('bottleBreak', 'Bottle break audio playback blocked or failed:'); }

    /**
     * Plays the enemy kill sound.
     * @returns {void}
     */
    playEnemyKill() { this.playEffectTrack('enemyKill', 'Enemy kill audio playback blocked or failed:'); }

    /**
     * Plays the character hit sound.
     * @returns {void}
     */
    playCharacterHit() { this.playEffectTrack('characterHit', 'Character hit audio playback blocked or failed:'); }

    /**
     * Plays the endboss hit sound.
     * @returns {void}
     */
    playEndbossHit() { this.playEffectTrack('endbossHit', 'Endboss hit audio playback blocked or failed:'); }

    /**
     * Plays one scene sound.
     * @param {string} scene The scene name.
     * @returns {void}
     */
    playScene(scene) {
        const actions = {
            win: () => this.playWin(),
            noBottles: () => this.playNoBottles(),
            gameOver: () => this.playGameOver()
        };
        (actions[scene] || (() => this.playGame()))();
    }

    /**
     * Plays one track.
     * @param {string} name The track name.
     * @param {string} warningMessage The warning text.
     * @param {boolean} reset Resets playback time.
     * @returns {void}
     */
    playTrack(name, warningMessage, reset = true) {
        const audio = this.audioPool[name];
        if (!audio || this.audioMuted || !this.audioUnlocked) return;
        if (!reset && !audio.paused) return;
        if (reset) audio.currentTime = 0;

        const playback = audio.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(error => this.handlePlayError(warningMessage, error));
        }
    }

    /**
     * Plays one effect track.
     * @param {string} name The track name.
     * @param {string} warningMessage The warning text.
     * @returns {void}
     */
    playEffectTrack(name, warningMessage) {
        const audio = this.audioPool[name];
        if (!audio || this.audioMuted || !this.audioUnlocked) return;

        const effect = audio.cloneNode();
        effect.volume = audio.volume;
        effect.currentTime = 0;
        this.effectInstances.push(effect);

        effect.addEventListener('ended', () => this.removeActiveEffectAudio(effect), { once: true });

        const playback = effect.play();
        if (playback && typeof playback.catch === 'function') {
            playback.catch(error => {
                this.removeActiveEffectAudio(effect);
                this.handlePlayError(warningMessage, error);
            });
        }
    }

    /**
     * Removes one effect sound.
     * @param {HTMLAudioElement} audio The effect audio.
     * @returns {void}
     */
    removeActiveEffectAudio(audio) {
        this.effectInstances = this.effectInstances.filter(item => item !== audio);
    }

    /**
     * Stops all effect sounds.
     * @returns {void}
     */
    stopEffectSounds() {
        this.effectInstances.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.effectInstances = [];
    }

    /**
     * Handles playback errors.
     * @param {string} warningMessage The warning text.
     * @param {Error} error The playback error.
     * @returns {void}
     */
    handlePlayError(warningMessage, error) {
        if (error && error.name === 'NotAllowedError') return;
        console.warn(warningMessage, error);
    }
}