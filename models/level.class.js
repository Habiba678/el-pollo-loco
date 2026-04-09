/**
 * Holds the objects that belong to one level.
 */
class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_end_x = 2200;

    /**
     * Creates a level with its enemies, clouds and background elements.
     *
     * @param {Array} enemies Enemies that appear in the level.
     * @param {Array} clouds Clouds used in the background.
     * @param {Array} backgroundObjects Background elements of the level.
     */
    constructor(enemies, clouds, backgroundObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}