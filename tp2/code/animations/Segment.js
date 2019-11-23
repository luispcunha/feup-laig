/**
 * Class segment representing a keyframe animation's segment between two consecutive key frames.
 */
class Segment {
    /**
     * @constructor
     *
     * @param {Keyframe} keyframeBefore
     * @param {Keyframe} keyframeAfter
     */
    constructor(keyframeBefore, keyframeAfter) {
        this.keyframeBefore = keyframeBefore;
        this.keyframeAfter = keyframeAfter;
    }

    /**
     * Computes the current animation matrix given the total time elapsed since the beginning of the animation.
     *
     * @param {Number} totalTime
     */
    computeAnimMatrix(totalTime) {
        let animationMatrix = mat4.create();

        // time elapsed since the beginning of the segment
        const currentTime = totalTime - this.keyframeBefore.t;
        // progress (between 0 and 1) within this segment
        const progress = currentTime / (this.keyframeAfter.t - this.keyframeBefore.t);

        // compute current translate transformation and multiply it to the animation matrix
        const translate = KFTransformation.computeLinearInterpolation(this.keyframeBefore.translate, this.keyframeAfter.translate, progress);
        animationMatrix = mat4.translate(animationMatrix, animationMatrix, translate);

        // compute current rotate transformation and multiply it to the animation matrix
        const rotate = KFTransformation.computeLinearInterpolation(this.keyframeBefore.rotate, this.keyframeAfter.rotate, progress);
        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, rotate[0]);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, rotate[1]);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, rotate[2]);

        // compute current scale transformation and multiply it to the animation matrix
        const scale = KFTransformation.computeScaleGeoProg(this.keyframeBefore.scale, this.keyframeAfter.scale, this.keyframeBefore.t, this.keyframeAfter.t, currentTime);
        animationMatrix = mat4.scale(animationMatrix, animationMatrix, scale);

        return animationMatrix;
    }
}