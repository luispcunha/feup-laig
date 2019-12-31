class MyAnimator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }

    setAnimation(piece) {

        const kf = new Keyframe(30, new KFTransformation(1, 1, 1), new KFTransformation(0, 0, 0), new KFTransformation(20,25, 5));

        this.animation = new KeyframeAnimation(this.orchestrator.getScene(), "anim", [kf]);

        this.piece = piece;
        this.piece.addAnimation(this.animation);
    }

    update(time) {
        if (this.animation) {
            this.animation.update(time);
            if (this.animation.isOver)
                this.animation = null;
        }
    }

    display() {
        if (this.piece)
            this.piece.display();
    }
}