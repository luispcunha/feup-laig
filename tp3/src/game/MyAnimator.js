/**
 * MyAnimator class that has the hability to add animations to animated pieces, as well as updating those animations
 */
class MyAnimator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.animations = [];
    }

    /**
     * Creates an animated piece for a move, and adds it to the board to be displayed
     *
     * @param {*} player player who did the move
     * @param {*} move coordinates of the move
     */
    animateMove(player, move) {
        const piece = this.orchestrator.board.createAnimatedOctagonPiece(player);
        const animation = this.createAnimation(player, move);

        this.animations.push(animation);

        piece.addAnimation(animation);

        this.orchestrator.board.addAnimatedPiece(piece);
    }

    /**
     * Creates a keyframe animation for a move
     *
     * @param {*} player player who did the move
     * @param {*} move coordinates of the move
     */
    createAnimation(player, move) {
        let xi, xf, zi, zf;

        // adjust height of animation to the size of the board
        const boardPrimitive = this.orchestrator.getScene().graph.boardPrimitive;
        const boardSideAvg = (boardPrimitive.width + boardPrimitive.height) / 2;
        const y = boardSideAvg * 0.3;

        // compute starting and end positions of animation
        const xDif = this.orchestrator.board.nColumns / 4;

        if (player == 1) {
            xi = - xDif - 1;
            zi = 4 * this.orchestrator.board.nRows / 5 - 0.5;

            xf = move.col;
            zf = move.row;
        } else if (player == 2) {
            xi = this.orchestrator.board.nColumns + xDif;
            zi = this.orchestrator.board.nRows / 5 - 0.5;

            xf = move.col;
            zf = move.row;
        }

        // generate keyframes
        const kfs = this.generateKeyFrames(xi, xf, zi, zf, y, 1.5, 50);

        // create keyframe animation
        const animation = new KeyframeAnimation(this.orchestrator.getScene(), "anim", kfs);

        return animation;
    }

    /**
     * Generates keyframes for an animation
     *
     * @param {*} xi starting x of animation
     * @param {*} xf ending x of animation
     * @param {*} zi starting z of animation
     * @param {*} zf ending z of animation
     * @param {*} height max height of the arch described by the animation
     * @param {*} t time the animation will take to complete
     * @param {*} nframes number of frames
     */
    generateKeyFrames(xi, xf, zi, zf, height, t, nframes) {
        const kfs = [];

        // n is the number of frames that are generated with y as a sinusoidal function of t
        const n = nframes - 3;

        const dt = t / nframes;
        const dx = (xf - xi) / n;
        const dz = (zf - zi) / n;

        const dh = Math.PI / n;

        // initial height of the arch movement, in order to not hit the borders of the box
        const archInitialHeight = 0.15;
        // duration of the first vertical movement, trying to make it look smoother
        const archInitialTime = archInitialHeight * Point.distance(new Point(0, 0, 0), new Point(dx, Math.sin(dh) * height, dz)) / dt;

        // first keyframe, positioning the piece in the starting position
        let kf = new Keyframe(
            0,
            new KFTransformation(1, 1, 1),
            new KFTransformation(0, 0, 0),
            new KFTransformation(xi, 0, zi)
        );

        kfs.push(kf);

        // generate arch movement keyframes
        for (let i = 0; i <= n; i++) {
            kf =  new Keyframe(
                archInitialTime + i * dt,
                new KFTransformation(1, 1, 1),
                new KFTransformation(0, 0, 0),
                new KFTransformation(xi + i * dx, archInitialHeight + Math.sin(dh * i) * height, zi + i * dz)
            );

            kfs.push(kf);
        }

        // last keyframe, in order for the piece to descend to the board from the inital height
        kf = new Keyframe(
            2 * archInitialTime + t,
            new KFTransformation(1, 1, 1),
            new KFTransformation(0, 0, 0),
            new KFTransformation(xf, 0, zf)
        );

        kfs.push(kf);

        return kfs;
    }

    /**
     * Updates animations, forgetting the ones that are finished
     *
     * @param {*} time elapsed time since last update
     */
    update(time) {
        this.animations.forEach((anim) => {
            anim.update(time);
        });

        this.animations = this.animations.filter((anim) => {
            return ! anim.isOver();
        });
    }

    /**
     * Checks if animator is currently animating anything
     */
    isAnimating() {
        return this.animations.length > 0;
    }
}