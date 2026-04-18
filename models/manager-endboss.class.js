/**
 * Manages the endboss logic.
 */
class EndbossManager {
    /**
     * Sets up the boss manager.
     * @param {World} world The current game world.
     */
    constructor(world) {
        this.world = world;
        this.jumpCooldown = false;
        this.lastBossHitTime = 0;
        this.hitPauseActive = false;
    }

    /**
     * Gets the current endboss.
     * @returns {Endboss|undefined} The current endboss.
     */
    get endboss() {
        return this.world.level.enemies.find(enemy => enemy instanceof Endboss);
    }

    /**
     * Updates the boss behavior.
     * @returns {void}
     */
    update() {
        const boss = this.endboss;
        if (!boss || boss.isDead() || !boss.world || this.world.gameOver) return;

        const character = this.world.character;
        const distance = Math.abs(boss.x - character.x);

        if (distance < 500) {
            boss.isActive = true;
        }

        if (!boss.isActive || this.hitPauseActive) return;

        boss.moveTowardCharacter(character.x);

        if (distance < 220 && !boss.isJumpAttacking) {
            this.triggerJumpAttack();
        }
    }

    /**
     * Starts the jump attack.
     * @returns {void}
     */
    triggerJumpAttack() {
        const boss = this.endboss;
        if (!boss || boss.isDead() || boss.isJumpAttacking || this.jumpCooldown) return;

        this.jumpCooldown = true;
        boss.triggerJumpAttack();

        setTimeout(() => {
            this.jumpCooldown = false;
        }, 1400);
    }

    /**
     * Updates the boss after a hit.
     * @returns {void}
     */
    handleBossHit() {
        const boss = this.endboss;
        if (!boss || boss.isDead() || this.world.gameOver) return;

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

        if (!boss.isDead()) return;

        this.world.gameOver = true;

        setTimeout(() => {
            if (typeof showWinScreen === 'function') {
                showWinScreen();
            }
        }, 500);
    }

    /**
     * Checks collision with the boss.
     * @returns {void}
     */
    handleBossCollision() {
        const boss = this.endboss;
        if (!boss || boss.isDead() || this.world.gameOver) return;

        const character = this.world.character;
        if (!character.isColliding(boss)) return;
        if (character.isHurt() || this.hitPauseActive) return;

        character.hit();
        this.world.statusBarHealth.setPercentage(character.energy);

        const pushDistance = boss.otherDirection ? -60 : 60;
        const maxCharacterX = boss.x - character.width - 10;

        if (character.x > maxCharacterX && !boss.otherDirection) {
            character.x = maxCharacterX;
        }

        this.hitPauseActive = true;
        character.startKnockback(pushDistance, 18, 10);

        if (this.world.gameAudio) {
            this.world.gameAudio.playCharacterHit();
        }

        setTimeout(() => {
            this.hitPauseActive = false;
        }, 450);
    }
}