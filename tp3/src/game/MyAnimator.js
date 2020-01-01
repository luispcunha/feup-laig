class MyAnimator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.animations = [];
    }

    animateMove(player, move) {
        const piece = this.orchestrator.board.createAnimatedOctagonPiece(player);
        const animation = this.createAnimation(player, move);

        this.animations.push(animation);

        piece.addAnimation(animation);

        this.orchestrator.board.addAnimatedPiece(piece);
    }

    createAnimation(player, move) {
        let xi, xf, zi, zf;

        if (player == 1) {
            xi = -2;
            zi = this.orchestrator.board.nRows / 2 - 0.5;

            xf = move.col;
            zf = move.row;
        } else if (player == 2) {
            xi = this.orchestrator.board.nColumns + 2;
            zi = this.orchestrator.board.nRows / 2 - 0.5;

            xf = move.col;
            zf = move.row;
        }

        const kfs = this.generateKeyFrames(xi, xf, zi, zf, 1, 2, 10);

        const animation = new KeyframeAnimation(this.orchestrator.getScene(), "anim", kfs);

        return animation;
    }

    generateKeyFrames(xi, xf, zi, zf, height, t, n) {
        const kfs = [];

        const dt = t / n;
        const dx = (xf - xi) / n;
        const dz = (zf - zi) / n;

        const d = Math.PI / n;

        for (let i = 0; i <= n; i++) {
            const kf =  new Keyframe(
                i * dt,
                new KFTransformation(1, 1, 1),
                new KFTransformation(0, 0, 0),
                new KFTransformation(xi + i * dx, Math.sin(d * i) * height, zi + i * dz)
            );

            kfs.push(kf);
        }

        return kfs;
    }

    update(time) {
        this.animations.forEach((anim) => {
            anim.update(time);
        });

        this.animations = this.animations.filter((anim) => {
            return ! anim.isOver();
        });
    }

    isAnimating() {
        return this.animations.length > 0;
    }
}