class EndbossManager {
    constructor(world) {
        this.world = world;
        this.jumpCooldown = false;
        this.lastBossHitTime = 0;
    }

    get endboss() {
        return this.world.level.enemies.find(enemy => enemy instanceof Endboss);
    }

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

        if (!boss.isActive) {
            return;
        }

        boss.moveTowardCharacter(character.x);

        if (distance < 150 && !this.jumpCooldown && !boss.isJumpAttacking) {
            this.triggerJumpAttack();
        }
    }

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

    handleBossCollision() {
        const boss = this.endboss;

        if (!boss || boss.isDead()) {
            return;
        }

        if (!this.world.character.isColliding(boss)) {
            return;
        }

        if (this.world.character.isHurt()) {
            return;
        }

        this.world.character.hit();
        this.world.statusBarHealth.setPercentage(this.world.character.energy);

        this.world.character.speedY = 10;
        this.world.character.x = Math.max(0, this.world.character.x - 35);

        if (this.world.gameAudio) {
            this.world.gameAudio.playCharacterHit();
        }
    }
}