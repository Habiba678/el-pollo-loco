/**
 * The endboss enemy.
 * It can walk, get hurt, die and jump attack.
 */
class Endboss extends MovableObject {
    x;
    y = 140;
    width = 170;
    height = 315;
    offset = { top: 60, bottom: 10, left: 25, right: 25 };

    lifePoints = 100;
    speed = 1.1;
    jumpAttackSpeed = 3.2;
    world = null;
    isActive = false;
    isJumpAttacking = false;
    hitPower = 20;

    alertCycle = [
        './assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        './assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    walkCycle = [
        './assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        './assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        './assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        './assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    hurtCycle = [
        './assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        './assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        './assets/img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    deadCycle = [
        './assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        './assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        './assets/img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    /**
     * Creates the endboss and loads its images.
     */
    constructor() {
        super().loadImage(this.alertCycle[0]);
        this.loadImages(this.alertCycle);
        this.loadImages(this.walkCycle);
        this.loadImages(this.hurtCycle);
        this.loadImages(this.deadCycle);

        this.x = 2200;
        this.groundLevel = 140;
        this.otherDirection = false;

        this.applyGravity();
        this.animate();
    }

    /**
     * Plays the right animation.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            if (this.isDead()) {
                this.playAnimation(this.deadCycle);
                return;
            }

            if (this.isHurt()) {
                this.playAnimation(this.hurtCycle);
                return;
            }

            if (this.isActive) {
                this.playAnimation(this.walkCycle);
                return;
            }

            this.playAnimation(this.alertCycle);
        }, 180);
    }

    /**
     * Moves the endboss toward the character.
     * @param {number} characterX The character x position.
     * @returns {void}
     */
    moveTowardCharacter(characterX) {
        if (this.isDead() || this.isJumpAttacking) {
            return;
        }

        if (this.x > characterX + 45) {
            this.moveLeft();
            this.otherDirection = false;
        }
    }

    /**
     * Starts the jump attack.
     * @returns {void}
     */
    triggerJumpAttack() {
        if (!this.world || this.isDead() || this.isJumpAttacking) {
            return;
        }

        this.isJumpAttacking = true;
        this.speedY = 20;

        const characterX = this.world.character.x;
        const jumpToRight = this.x < characterX;

        const jumpInterval = setInterval(() => {
            if (this.isDead()) {
                clearInterval(jumpInterval);
                this.isJumpAttacking = false;
                return;
            }

            const landed = !this.isAboveGround() && this.speedY === 0;

            if (landed) {
                clearInterval(jumpInterval);
                this.isJumpAttacking = false;
                return;
            }

            if (jumpToRight) {
                this.x += this.jumpAttackSpeed;
                this.otherDirection = true;
            } else {
                this.x -= this.jumpAttackSpeed;
                this.otherDirection = false;
            }
        }, 1000 / 60);
    }

    /**
     * Reduces the boss health.
     * @returns {void}
     */
    hit() {
        this.lifePoints = Math.max(0, this.lifePoints - this.hitPower);

        if (this.lifePoints > 0) {
            this.lastHit = Date.now();
        }
    }

    /**
     * Checks if the boss is dead.
     * @returns {boolean}
     */
    isDead() {
        return this.lifePoints <= 0;
    }
}