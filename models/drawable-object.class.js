/**
 * Shared parent class for objects that use images on the game canvas.
 * It takes care of loading graphics, storing cached sprites and drawing them.
 */
class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    /**
     * Assigns one image file to the object so it can be rendered later.
     *
     * @param {string} path File location of the image.
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Places the current image on the canvas at the object's position.
     *
     * @param {CanvasRenderingContext2D} ctx Context used to paint on the canvas.
     * @returns {void}
     */
    draw(ctx) {
        try {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } catch (e) {
            console.warn('Error loading image', e);
            console.log('Image could not be drawn', this.img);
        }
    }

    /**
     * Shows a visible helper border for selected entities during debugging.
     *
     * @param {CanvasRenderingContext2D} ctx Context used to paint on the canvas.
     * @returns {void}
     */
    drawFrame(ctx) {
        if (
            this instanceof Character ||
            this instanceof Chicken ||
            this instanceof Endboss
        ) {
            ctx.beginPath();
            ctx.lineWidth = '5';
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }

    /**
     * Prepares a group of image files and saves them inside the cache object.
     *
     * @param {string[]} arr List of image paths that should be preloaded.
     * @returns {void}
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}