/**
 * Controls the boss enemy, including patrol movement,
 * attack phases, damage reaction and defeat visuals.
 */
class Endboss extends MovableObject {
    x;
    y = 140;
    width = 170;
    height = 315;
    offset = { top: 60, bottom: 10, left: 25, right: 25 };

    lifePoints = 100;
    speed = 1;
    patrolSpeed = 1;
    chaseSpeed = 2.5;
    attackWindow = 2500;
    attackTimer = null;
    isActive = false;
    isHunting = false;
    roamLeft;
    roamRight;
    walksLeft = true;
    hitPower = 25;

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

    attackCycle = [
        './assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        './assets/img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    /**
     * Loads all boss image groups and prepares its movement range.
     */
    constructor() {
        super().loadImage(this.alertCycle[0]);
        this.loadImages(this.alertCycle);
        this.loadImages(this.walkCycle);
        this.loadImages(this.attackCycle);
        this.loadImages(this.hurtCycle);
        this.loadImages(this.deadCycle);

        this.x = 1400 + Math.random() * 500;
        this.roamLeft = this.x - 200;
        this.roamRight = this.x + 200;

        this.animate();
    }

    /**
     * Updates the current boss animation depending on its state.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            if (this.isDead()) {
                this.playAnimation(this.deadCycle);
            } else if (this.isHurt()) {
                this.playAnimation(this.hurtCycle);
            } else if (this.isHunting) {
                this.playAnimation(this.attackCycle);
            } else if (this.isActive) {
                this.playAnimation(this.walkCycle);
            } else {
                this.playAnimation(this.alertCycle);
            }
        }, 200);
    }

    /**
     * Moves the boss either along its patrol route or toward the character.
     * @param {number} characterX Current x position of the player.
     * @returns {void}
     */
    updateMovement(characterX) {
        if (this.isDead() || !this.isActive) return;

        if (this.isHunting && typeof characterX === 'number') {
            this.speed = this.chaseSpeed;

            if (this.x > characterX) {
                this.moveLeft();
                this.otherDirection = false;
            } else {
                this.moveRight();
                this.otherDirection = true;
            }
            return;
        }

        this.handlePatrolPath();
    }

    /**
     * Keeps the boss moving between its left and right patrol borders.
     * @returns {void}
     */
    handlePatrolPath() {
        this.speed = this.patrolSpeed;

        if (this.walksLeft) {
            this.moveLeft();
            this.otherDirection = false;

            if (this.x <= this.roamLeft) {
                this.walksLeft = false;
            }
        } else {
            this.moveRight();
            this.otherDirection = true;

            if (this.x >= this.roamRight) {
                this.walksLeft = true;
            }
        }
    }

    /**
     * Activates the boss and opens a temporary attack phase.
     * @returns {void}
     */
    startAttackMode() {
        if (this.isDead()) return;

        this.isActive = true;
        this.isHunting = true;

        if (this.attackTimer) {
            clearTimeout(this.attackTimer);
        }

        this.attackTimer = setTimeout(() => {
            this.isHunting = false;
            this.attackTimer = null;
        }, this.attackWindow);
    }

    /**
     * Reduces the boss life value and stores the last hit timestamp.
     * @returns {void}
     */
    hit() {
        this.lifePoints = Math.max(0, this.lifePoints - this.hitPower);

        if (this.lifePoints > 0) {
            this.lastHit = Date.now();
        }
    }
}