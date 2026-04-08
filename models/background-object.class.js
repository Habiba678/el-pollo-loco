/**
 * Displays one background image segment of the level.
 * It stays fixed to the world and is placed by its horizontal position.
 */
class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;

    /**
     * Creates a background segment with an image and x position.
     * @param {string} imagePath File path of the background image.
     * @param {number} x X position inside the level.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}