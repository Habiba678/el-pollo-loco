/**
 * Creates a moving cloud for the background scenery.
 */
class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    driftSpeed = 0.1 + Math.random() * 0.35;

    /**
     * Sets the image, places the cloud at a random x position
     * and starts the floating movement.
     */
    constructor() {
        super().loadImage('./assets/img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 500;
        this.animate();
    }

    /**
     * Keeps the cloud moving slowly to the left.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);
    }
}