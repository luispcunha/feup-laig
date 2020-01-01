/**
 * KeyframeAnimation class implementing key frame animations.
 */
class KeyframeAnimation extends Animation {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     * @param {String} id
     * @param {Keyframe[]} keyframes
     */
    constructor(scene, id, keyframes) {
        super(scene, id);

        this.keyframes = [];

        if (keyframes[0].t > 0)
            this.keyframes.push(new Keyframe()); // first keyframe corresponds to a default (neutral) keyframe

        this.keyframes.push(...keyframes);
        this.generateSegments();
        this.sumT = 0; // total time elapsed since start of execution

        const currentSegment = this.getCurrentSegment();
        this.animationMatrix = currentSegment.computeAnimMatrix(this.sumT);

        this.animationEnded = false;
    }

    /**
     * Initializes the segments attribute as an array of segments.
     */
    generateSegments() {
        this.segments = [];
        for (let i = 1; i < this.keyframes.length; i++)
            this.segments.push(new Segment(this.keyframes[i - 1], this.keyframes[i]));
    }

    /**
     * Returns the segment correspondent to the current total time elapsed, or null
     * if the current time is past the last keyframe of the animation.
     */
    getCurrentSegment() {
        for (const segment of this.segments) {
            if (this.sumT >= segment.keyframeBefore.t && this.sumT < segment.keyframeAfter.t)
                return segment;
        }

        return null;
    }

    /**
     * Updates the animation matrix given the time elapsed since previous update.
     *
     * @param {Number} t
     */
    update(t) {
        if (! this.animationEnded) {
            this.sumT += t;

            const currentSegment = this.getCurrentSegment();

            // if current segment is null, means the animation is over
            if (currentSegment == null) {
                // set animation matrix to the transformation matrix of the last keyframe
                this.animationMatrix = this.keyframes[this.keyframes.length - 1].getAnimationMatrix();
                this.animationEnded = true;
                return;
            }

            // compute animation matrix, consisting of the interpolation of the keyframes of the current segment
            console.log("t " + t);
            this.animationMatrix = currentSegment.computeAnimMatrix(this.sumT);
            console.log(this.animationMatrix);
        }
    }

    /**
     * Applies current animation matrix to the scene.
     */
    apply() {
        console.log("apply")
        console.log(this.animationMatrix);
        this.scene.multMatrix(this.animationMatrix);
    }

    isOver() {
        return this.animationEnded;
    }
}