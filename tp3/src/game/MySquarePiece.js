/**
 * MyTile class
 */
class MySquarePiece extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, tile, player, componentP1, componentP2) {
        super(scene);
        this.tile = tile;
        this.type = type;
        this.player = player;
        this.components = [];
        this.components[1] = componentP1;
        this.components[2] = componentP2;
    }

    setComponentP1(component, player) {
        this.components[player] = component;
    }

    /**
     * Display board.
     */
    display() {
        this.components[this.player].display();
    }
}