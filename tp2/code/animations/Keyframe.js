class Keyframe {
    constructor(t, scale, rotate, translate) {
        if (!arguments.length) {
            this.t = 0;
            this.scale = new KFTransformation(1, 1, 1);
            this.rotate = new KFTransformation(0, 0, 0);
            this.translate = new KFTransformation(0, 0, 0);
        } else {
            this.t = t * 1000;
            this.scale = scale;
            this.rotate = rotate;
            this.translate = translate;
        }
    }

    getAnimationMatrix() {
        let animationMatrix = mat4.create();

        animationMatrix = mat4.translate(animationMatrix, animationMatrix, this.translate.getArray());

        animationMatrix = mat4.rotateX(animationMatrix, animationMatrix, this.rotate.x);
        animationMatrix = mat4.rotateY(animationMatrix, animationMatrix, this.rotate.y);
        animationMatrix = mat4.rotateZ(animationMatrix, animationMatrix, this.rotate.z);

        animationMatrix = mat4.scale(animationMatrix, animationMatrix, this.scale.getArray());

        return animationMatrix;
    }
}
