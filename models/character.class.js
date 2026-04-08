/**
 * Represents the player avatar and manages motion,
 * state-based visuals and camera follow updates.
 */
class Character extends MovableObject {
    x = 100;
    y = 170;
    width = 100;
    height = 250;
    offset = { top: 60, bottom: 10, left: 25, right: 25 };

    baseRestSprites = [
        './assets/img/2_character_pepe/1_idle/idle/I-1.png',
        './assets/img/2_character_pepe/1_idle/idle/I-2.png',
        './assets/img/2_character_pepe/1_idle/idle/I-3.png',
        './assets/img/2_character_pepe/1_idle/idle/I-6.png',
        './assets/img/2_character_pepe/1_idle/idle/I-7.png',
        './assets/img/2_character_pepe/1_idle/idle/I-8.png',
        './assets/img/2_character_pepe/1_idle/idle/I-9.png',
        './assets/img/2_character_pepe/1_idle/idle/I-10.png'
    ];

    extendedRestSprites = [
        './assets/img/2_character_pepe/1_idle/long_idle/I-11.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-12.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-13.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-14.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-15.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-16.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-17.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-18.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-19.png',
        './assets/img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    travelSprites = [
        './assets/img/2_character_pepe/2_walk/W-21.png',
        './assets/img/2_character_pepe/2_walk/W-22.png',
        './assets/img/2_character_pepe/2_walk/W-23.png',
        './assets/img/2_character_pepe/2_walk/W-24.png',
        './assets/img/2_character_pepe/2_walk/W-25.png',
        './assets/img/2_character_pepe/2_walk/W-26.png'
    ];

    airborneSprites = [
        './assets/img/2_character_pepe/3_jump/J-31.png',
        './assets/img/2_character_pepe/3_jump/J-32.png',
        './assets/img/2_character_pepe/3_jump/J-33.png',
        './assets/img/2_character_pepe/3_jump/J-34.png',
        './assets/img/2_character_pepe/3_jump/J-35.png',
        './assets/img/2_character_pepe/3_jump/J-36.png',
        './assets/img/2_character_pepe/3_jump/J-37.png',
        './assets/img/2_character_pepe/3_jump/J-38.png',
        './assets/img/2_character_pepe/3_jump/J-39.png'
    ];

    endStateSprites = [
        './assets/img/2_character_pepe/5_dead/D-51.png',
        './assets/img/2_character_pepe/5_dead/D-52.png',
        './assets/img/2_character_pepe/5_dead/D-53.png',
        './assets/img/2_character_pepe/5_dead/D-54.png',
        './assets/img/2_character_pepe/5_dead/D-55.png',
        './assets/img/2_character_pepe/5_dead/D-56.png',
        './assets/img/2_character_pepe/5_dead/D-57.png'
    ];

    damageSprites = [
        './assets/img/2_character_pepe/4_hurt/H-41.png',
        './assets/img/2_character_pepe/4_hurt/H-42.png',
        './assets/img/2_character_pepe/4_hurt/H-43.png'
    ];

    world;
    moveSound = new Audio('audio/running.mp3');
    stillTimer = 0;
    airFramePointer = 0;
    airSequenceOpen = false;
    speed = 10;

    /**
     * Loads sprite collections, enables gravity and starts the recurring updates.
     */
    constructor() {
        super().loadImage('./assets/img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadImages(this.baseRestSprites);
        this.loadImages(this.extendedRestSprites);
        this.loadImages(this.travelSprites);
        this.loadImages(this.airborneSprites);
        this.loadImages(this.endStateSprites);
        this.loadImages(this.damageSprites);
        this.applyGravity();
        this.animation();
    }

    /**
     * Runs the character update cycle for movement, camera tracking
     * and visual state switching.
     * @returns {void}
     */
    animation() {
        setInterval(() => {
            if (!this.world || this.world.gameOver) return;

            this.moveSound.pause();
            this.processSideInput();
            this.processJumpInput();
            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);

        setInterval(() => {
            if (!this.world || this.world.gameOver) return;
            this.updateActionVisuals();
        }, 60);

        setInterval(() => {
            if (!this.world || this.world.gameOver) return;
            this.updateRestVisuals();
        }, 250);
    }

    /**
     * Evaluates left and right input and applies horizontal movement.
     * @returns {void}
     */
    processSideInput() {
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
            this.moveSound.play();
            this.resetStillTimer();
        }

        if (this.world.keyboard.LEFT && this.x > 0) {
            this.moveLeft();
            this.otherDirection = true;
            this.moveSound.play();
            this.resetStillTimer();
        }
    }

    /**
     * Starts a jump when the jump key is pressed on solid ground.
     * @returns {void}
     */
    processJumpInput() {
        if (this.world.keyboard.SPACE && !this.isAboveGround()) {
            this.jump();
            this.resetStillTimer();
        }
    }

    /**
     * Chooses the active animation for defeat, damage, air state or walking.
     * @returns {void}
     */
    updateActionVisuals() {
        if (this.isDead()) {
            this.playAnimation(this.endStateSprites);
            return;
        }

        if (this.isHurt()) {
            this.playAnimation(this.damageSprites);
            return;
        }

        if (this.isAboveGround()) {
            this.playAirSequence();
            return;
        }

        this.airFramePointer = 0;
        this.airSequenceOpen = false;

        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.travelSprites);
        }
    }

    /**
     * Handles the quiet standing states and switches later into the longer rest cycle.
     * @returns {void}
     */
    updateRestVisuals() {
        const movingSideways = this.world.keyboard.LEFT || this.world.keyboard.RIGHT;
        const tryingJump = this.world.keyboard.SPACE;
        const currentlyAirborne = this.isAboveGround();
        const blockedByState = this.isDead() || this.isHurt();

        if (movingSideways || tryingJump || currentlyAirborne || blockedByState) {
            this.resetStillTimer();
            return;
        }

        if (this.stillTimer < 30) {
            this.playAnimation(this.baseRestSprites);
            this.stillTimer++;
        } else {
            this.playAnimation(this.extendedRestSprites);
        }
    }

    /**
     * Clears the standing timer after movement or another active input.
     * @returns {void}
     */
    resetStillTimer() {
        this.stillTimer = 0;
    }

    /**
     * Advances through the airborne sprite sequence while the figure is in the air.
     * @returns {void}
     */
    playAirSequence() {
        if (!this.airSequenceOpen) {
            this.airSequenceOpen = true;
            this.airFramePointer = 0;
        }

        const safeIndex = Math.min(this.airFramePointer, this.airborneSprites.length - 1);
        const currentSprite = this.airborneSprites[safeIndex];
        this.img = this.imageCache[currentSprite];

        if (this.airFramePointer < this.airborneSprites.length - 1) {
            this.airFramePointer++;
        }
    }

    /**
     * Applies upward force to begin a jump movement.
     * @returns {void}
     */
    jump() {
        this.speedY = 30;
    }
}