/**
 * Manages endboss behavior, reactions and collision handling.
 */
class EndbossManager {
    /**
     * Creates the endboss manager.
     *
     * @param {World} world - The current game world.
     */
    constructor(world) {
        this.world = world;
        this.jumpCooldown = false;
        this.lastBossHitTime = 0;
        this.hitPauseActive = false;
    }

    /**
     * Returns the current endboss instance from the enemy list.
     *
     * @returns {Endboss|undefined} The endboss object if found.
     */
    get endboss() {
        return this.world.level.enemies.find(enemy => enemy instanceof Endboss);
    }

    /**
     * Updates activation and movement behavior of the endboss.
     *
     * @returns {void}
     */
    update() {
        const boss = this.endboss;

        if (!boss || boss.isDead() || !boss.world) {
            return;
        }

        const character = this.world.character;
        const distance = Math.abs(boss.x - character.x);

        if (distance < 500) {
            boss.isActive = true;
        }

        if (!boss.isActive || this.hitPauseActive) {
            return;
        }

        boss.moveTowardCharacter(character.x);
    }

    /**
     * Starts a boss jump attack if the cooldown allows it.
     *
     * @returns {void}
     */
    triggerJumpAttack() {
        const boss = this.endboss;

        if (!boss || boss.isDead() || boss.isJumpAttacking || this.jumpCooldown) {
            return;
        }

        this.jumpCooldown = true;
        boss.triggerJumpAttack();

        setTimeout(() => {
            this.jumpCooldown = false;
        }, 1400);
    }

    /**
     * Applies damage to the endboss, updates the boss bar
     * and checks whether the fight has been won.
     *
     * @returns {void}
     */
    handleBossHit() {
        const boss = this.endboss;

        if (!boss || boss.isDead()) {
            return;
        }

        boss.hit();
        this.world.statusBarEndboss.setPercentage(boss.lifePoints);

        if (this.world.gameAudio) {
            this.world.gameAudio.playEndbossHit();
        }

        const now = Date.now();
        const enoughTimePassed = now - this.lastBossHitTime > 500;

        if (enoughTimePassed) {
            this.lastBossHitTime = now;
            this.triggerJumpAttack();
        }

        if (boss.isDead()) {
            this.world.gameOver = true;

            setTimeout(() => {
                if (typeof showWinScreen === 'function') {
                    showWinScreen();
                }
            }, 500);
        }
    }

    /**
     * Handles collision between character and endboss,
     * applies damage and starts knockback.
     *
     * @returns {void}
     */
    handleBossCollision() {
        const boss = this.endboss;

        if (!boss || boss.isDead()) {
            return;
        }

        const character = this.world.character;

        if (!character.isColliding(boss)) {
            return;
        }

        if (character.isHurt() || this.hitPauseActive) {
            return;
        }

        character.hit();
        this.world.statusBarHealth.setPercentage(character.energy);

        const maxCharacterX = boss.x - character.width - 10;
        if (character.x > maxCharacterX) {
            character.x = maxCharacterX;
        }

        this.hitPauseActive = true;
        character.startKnockback(140, 28, 12);

        if (this.world.gameAudio) {
            this.world.gameAudio.playCharacterHit();
        }

        setTimeout(() => {
            this.hitPauseActive = false;
        }, 350);
    }
}