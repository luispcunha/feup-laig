/**
 * MyTile class
 */
class MyAnimatedOctagonPiece extends MyOctagonPiece {
    /**
     * @constructor
     */
    constructor(orchestrator, player, componentP1, componentP2) {
        super(orchestrator, player, componentP1, componentP2);
        this.animation = null;
    }

    addAnimation(animation) {
        this.animation = animation;
    }

    /**
     * Display board.
     */
    display() {
        if (this.animation)
            this.animation.apply();

        super.display();
    }
}