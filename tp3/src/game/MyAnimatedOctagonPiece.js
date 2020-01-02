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

    isAnimOver() {
        return this.animation.isOver();
    }

    /**
     * Display board.
     */
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();

        if (this.animation) {
            this.animation.apply();
        }

        super.display();

        scene.popMatrix();
    }
}