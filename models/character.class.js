/** Controls the player character, movement and animations. */
class Character extends MovableObject {
    x = 100;
    y = 165;
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
    knockbackActive = false;
    knockbackInterval = null;

    /** Creates the character and loads sprites. */
    constructor() {
        super().loadImage('./assets/img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadAllImages();
        this.applyGravity();
        this.animation();
    }

    /** Loads all sprite groups. */
    loadAllImages() {
        [
            this.baseRestSprites,
            this.extendedRestSprites,
            this.travelSprites,
            this.airborneSprites,
            this.endStateSprites,
            this.damageSprites
        ].forEach(images => this.loadImages(images));
    }

    /** Starts character update intervals. */
    animation() {
        setInterval(() => this.updateMovement(), 1000 / 60);
        setInterval(() => this.updateActionVisuals(), 60);
        setInterval(() => this.updateRestVisuals(), 250);
    }

    /** Updates movement and camera. */
    updateMovement() {
        if (!this.canUpdate()) return;
        this.moveSound.pause();
        this.processSideInput();
        this.processJumpInput();
        this.world.camera_x = -this.x + 100;
    }

    /** Checks if updates may run. */
    canUpdate() {
        return this.world && !this.world.gameOver;
    }

    /** Handles left and right movement. */
    processSideInput() {
        if (this.knockbackActive) return;
        this.handleMoveRight();
        this.handleMoveLeft();
    }

    /** Handles movement to the right. */
    handleMoveRight() {
        if (!this.world.keyboard.RIGHT || this.x >= this.world.level.level_end_x) return;
        this.moveRight();
        this.otherDirection = false;
        this.moveSound.play();
        this.resetStillTimer();
    }

    /** Handles movement to the left. */
    handleMoveLeft() {
        if (!this.world.keyboard.LEFT || this.x <= 0) return;
        this.moveLeft();
        this.otherDirection = true;
        this.moveSound.play();
        this.resetStillTimer();
    }

    /** Handles jump input. */
    processJumpInput() {
        if (this.knockbackActive) return;
        if (!this.world.keyboard.SPACE || this.isAboveGround()) return;
        this.jump();
        this.resetStillTimer();
    }

    /** Updates active animations. */
    updateActionVisuals() {
        if (!this.canUpdate()) return;
        if (this.isDead()) return this.playAnimation(this.endStateSprites);
        if (this.isAboveGround()) return this.playAirSequence();
        if (this.isHurt()) return this.playAnimation(this.damageSprites);

        this.airFramePointer = 0;
        this.airSequenceOpen = false;

        if (this.isMovingOrKnocked()) {
            this.playAnimation(this.travelSprites);
        }
    }

    /** Updates idle animations. */
    updateRestVisuals() {
        if (!this.canUpdate() || this.shouldSkipRestAnimation()) {
            this.resetStillTimer();
            return;
        }

        if (this.stillTimer < 30) {
            this.playAnimation(this.baseRestSprites);
            this.stillTimer++;
            return;
        }

        this.playAnimation(this.extendedRestSprites);
    }

    /** Checks if rest animation should be skipped. */
    shouldSkipRestAnimation() {
        return this.isMovingOrKnocked() ||
            this.world.keyboard.SPACE ||
            this.isAboveGround() ||
            this.isDead() ||
            this.isHurt();
    }

    /** Checks if character is moving sideways or knocked back. */
    isMovingOrKnocked() {
        return this.world.keyboard.LEFT ||
            this.world.keyboard.RIGHT ||
            this.knockbackActive;
    }

    /** Resets idle timer. */
    resetStillTimer() {
        this.stillTimer = 0;
    }

    /** Plays jump frame sequence. */
    playAirSequence() {
        if (!this.airSequenceOpen) {
            this.airSequenceOpen = true;
            this.airFramePointer = 0;
        }

        const index = Math.min(this.airFramePointer, this.airborneSprites.length - 1);
        this.img = this.imageCache[this.airborneSprites[index]];

        if (this.airFramePointer < this.airborneSprites.length - 1) {
            this.airFramePointer++;
        }
    }

    /** Starts a jump. */
    jump() {
        this.speedY = 30;
    }

    /** Starts a short backward knockback. */
    startKnockback(pushDistance = 140, jumpStrength = 28, steps = 12) {
        this.clearKnockbackInterval();
        this.knockbackActive = true;
        this.speedY = jumpStrength;

        const stepDistance = pushDistance / steps;
        let remainingSteps = steps;

        this.knockbackInterval = setInterval(() => {
            this.x = Math.max(0, this.x - stepDistance);
            remainingSteps--;

            if (remainingSteps <= 0) {
                this.clearKnockbackInterval();
                this.knockbackActive = false;
            }
        }, 1000 / 60);
    }

    /** Clears running knockback interval. */
    clearKnockbackInterval() {
        if (!this.knockbackInterval) return;
        clearInterval(this.knockbackInterval);
        this.knockbackInterval = null;
    }
}