/**
 * Represents the smaller chicken enemy with its own size,
 * walking cycle and a normal ground movement.
 */
class ChickenSmall extends MovableObject {
    x;
    y = 400;
    groundLevel = 400;
    width = 60;
    height = 40;
    offset = { top: 3, bottom: 3, left: 5, right: 5 };
    dead = false;
    speed = 0.35;

    walkSprites = [
        './assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        './assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    deadSprite = './assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor() {
        super().loadImage('./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png');
        this.loadImages(this.walkSprites);
        this.loadImages([this.deadSprite]);
        this.x = 560 + Math.random() * 560;
        this.animation();
    }

    animation() {
        setInterval(() => {
            if (!this.dead) {
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.dead) {
                this.playAnimation(this.walkSprites);
            }
        }, 200);
    }

    die() {
        this.dead = true;
        this.speed = 0;
        this.img = this.imageCache[this.deadSprite];
    }
}