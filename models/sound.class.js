/**
 * Manages music and sound effects across the game.
 */
class SoundManager {
    /**
     * Stores the key for saved audio settings.
     *
     * @param {string} storageKey Key used in local storage.
     */
    constructor(storageKey) {
        this.savedAudioKey = storageKey;
        this.audioMuted = false;
        this.audioUnlocked = false;
        this.audioPool = {};
        this.effectInstances = [];
    }

    /**
     * Loads all required audio files once.
     *
     * @returns {void}
     */
    init() {
        if (this.audioPool.game) {
            return;
        }

        this.audioPool.game = this.buildAudio('./assets/audios/mixkit-game-level-music-689.wav', true);
        this.audioPool.gameOver = this.buildAudio('./assets/audios/universfield-game-over-deep-male-voice-clip-352695.mp3');
        this.audioPool.win = this.buildAudio('./assets/audios/we-ve-got-a-winner-carnival-speaker-voice-dan-barracuda-1-00-02.mp3');
        this.audioPool.noBottles = this.buildAudio('./assets/audios/fail-male-taunt-wah-wah-wah-trumpet-gfx-sounds-1-00-04.mp3');
        this.audioPool.run = this.buildAudio('./assets/audios/freesound_community-running-1-6846.mp3', true, 0.10);
        this.audioPool.jump = this.buildAudio('./assets/audios/freesound_community-cartoon-jump-6462.mp3', false, 0.10);
        this.audioPool.bottleCollect = this.buildAudio('./assets/audios/u_6cbmmsst3z-bottle-205353.mp3', false, 0.10);
        this.audioPool.coinCollect = this.buildAudio('./assets/audios/chieuk-coin-257878.mp3', false, 0.10);
        this.audioPool.bottleBreak = this.buildAudio('./assets/audios/freesound_community-breaking-glass-83809.mp3', false, 0.10);
        this.audioPool.enemyKill = this.buildAudio('./assets/audios/floraphonic-rubber-chicken-squeak-toy-1-181416.mp3', false, 0.10);
        this.audioPool.characterHit = this.buildAudio('./assets/audios/beetpro-ouch-sound-effect-30-11844.mp3', false, 0.10);
        this.audioPool.endbossHit = this.buildAudio('./assets/audios/chicken-wakwak.mp3', false, 0.24);
    }

    /**
     * Creates one audio element with its playback settings.
     *
     * @param {string} src File path of the audio.
     * @param {boolean} [loop=false] Whether the sound should repeat.
     * @param {number} [volume=0.15] Audio volume.
     * @returns {HTMLAudioElement}
     */
    buildAudio(src, loop = false, volume = 0.15) {
        const audioItem = new Audio(src);
        audioItem.loop = loop;
        audioItem.volume = volume;
        audioItem.preload = 'auto';
        return audioItem;
    }

    /**
     * Reads the saved mute option from local storage.
     *
     * @returns {boolean}
     */
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

    /**
     * Saves the current mute option.
     *
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
     * Unlocks audio playback after the first user interaction.
     *
     * @param {Function} [onUnlock] Optional action after unlocking.
     * @returns {void}
     */
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

    /**
     * Changes the mute state and stores it.
     *
     * @returns {boolean}
     */
    toggleMute() {
        this.audioMuted = !this.audioMuted;
        this.saveMutedState();
        return this.audioMuted;
    }

    /**
     * Tells whether audio is muted right now.
     *
     * @returns {boolean}
     */
    isMuted() {
        return this.audioMuted;
    }

    /**
     * Pauses every registered track.
     *
     * @returns {void}
     */
    pauseAll() {
        Object.keys(this.audioPool).forEach((trackName) => {
            this.stopTrack(trackName, false);
        });

        this.stopEffectSounds();
    }

    /**
     * Stops the sounds that belong to active gameplay.
     *
     * @returns {void}
     */
    stopGameplaySounds() {
        this.stopTrack('run', false);
        this.stopEffectSounds();
    }

    /**
     * Stops several tracks at once.
     *
     * @param {string[]} names Track keys.
     * @param {boolean} [reset=true] Whether playback position should reset.
     * @returns {void}
     */
    stopTracks(names, reset = true) {
        names.forEach((trackName) => this.stopTrack(trackName, reset));
    }

    /**
     * Stops one track by name.
     *
     * @param {string} name Track key.
     * @param {boolean} [reset=true] Whether playback position should reset.
     * @returns {void}
     */
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

    /**
     * Starts the regular game music.
     *
     * @returns {void}
     */
    playGame() {
        this.playTrack('game', 'Audio playback blocked or failed:', false);
    }

    /**
     * Starts the game-over sound.
     *
     * @returns {void}
     */
    playGameOver() {
        this.playTrack('gameOver', 'Game-over audio playback blocked or failed:');
    }

    /**
     * Starts the win sound.
     *
     * @returns {void}
     */
    playWin() {
        this.playTrack('win', 'Win audio playback blocked or failed:');
    }

    /**
     * Starts the no-bottles result sound.
     *
     * @returns {void}
     */
    playNoBottles() {
        this.playTrack('noBottles', 'No-bottles audio playback blocked or failed:');
    }

    /**
     * Starts the running loop.
     *
     * @returns {void}
     */
    playRun() {
        this.playTrack('run', 'Run audio playback blocked or failed:', false);
    }

    /**
     * Ends the running loop.
     *
     * @returns {void}
     */
    stopRun() {
        this.stopTrack('run', false);
    }

    /**
     * Plays the jump sound once.
     *
     * @returns {void}
     */
    playJump() {
        this.playEffectTrack('jump', 'Jump audio playback blocked or failed:');
    }

    /**
     * Plays the bottle pickup sound.
     *
     * @returns {void}
     */
    playBottleCollect() {
        this.playEffectTrack('bottleCollect', 'Bottle collect audio playback blocked or failed:');
    }

    /**
     * Plays the coin pickup sound.
     *
     * @returns {void}
     */
    playCoinCollect() {
        this.playEffectTrack('coinCollect', 'Coin collect audio playback blocked or failed:');
    }

    /**
     * Plays the bottle crash sound.
     *
     * @returns {void}
     */
    playBottleBreak() {
        this.playEffectTrack('bottleBreak', 'Bottle break audio playback blocked or failed:');
    }

    /**
     * Plays the enemy defeat sound.
     *
     * @returns {void}
     */
    playEnemyKill() {
        this.playEffectTrack('enemyKill', 'Enemy kill audio playback blocked or failed:');
    }

    /**
     * Plays the sound for character damage.
     *
     * @returns {void}
     */
    playCharacterHit() {
        this.playEffectTrack('characterHit', 'Character hit audio playback blocked or failed:');
    }

    /**
     * Starts the endboss hit sound.
     *
     * @returns {void}
     */
    playEndbossHit() {
        this.playTrack('endbossHit', 'Endboss hit audio playback blocked or failed:');
    }

    /**
     * Ends the endboss hit sound immediately.
     *
     * @returns {void}
     */
    stopEndbossHit() {
        this.stopTrack('endbossHit', true);
    }

    /**
     * Chooses the fitting track for the current scene.
     *
     * @param {"game"|"gameOver"|"win"|"noBottles"} scene Current scene name.
     * @returns {void}
     */
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

    /**
     * Plays one stored track.
     *
     * @param {string} name Track key.
     * @param {string} warningMessage Message for playback errors.
     * @param {boolean} [reset=true] Whether the track should restart first.
     * @returns {void}
     */
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

    /**
     * Plays a copied one-shot effect.
     *
     * @param {string} name Track key.
     * @param {string} warningMessage Message for playback errors.
     * @returns {void}
     */
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

    /**
     * Removes one finished effect instance from the active list.
     *
     * @param {HTMLAudioElement} audio Finished effect audio.
     * @returns {void}
     */
    removeActiveEffectAudio(audio) {
        this.effectInstances = this.effectInstances.filter((item) => item !== audio);
    }

    /**
     * Stops all currently active effect sounds.
     *
     * @returns {void}
     */
    stopEffectSounds() {
        this.effectInstances.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });

        this.effectInstances = [];
    }

    /**
     * Prints playback problems except normal autoplay blocks.
     *
     * @param {string} warningMessage Message prefix.
     * @param {Error} error Playback error.
     * @returns {void}
     */
    handlePlayError(warningMessage, error) {
        if (error && error.name === 'NotAllowedError') {
            return;
        }

        console.warn(warningMessage, error);
    }
}