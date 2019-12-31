/**
* Animation class defining necessary methods for an animation implementation.
*/
class Animation {
    /**
    * @constructor
    *
    * @param {CGFscene} scene
    * @param {String} id
    */
    constructor(scene, id) {
        this.scene = scene;
        this.id = id;
    }

    /**
     * Updates the animation given the time elapsed since the previous update
     * @param {Number} t
     */
    update(t) {}

    /**
     * Applies the animation matrix to the scene
     */
    apply() {}

    isOver() {}
}