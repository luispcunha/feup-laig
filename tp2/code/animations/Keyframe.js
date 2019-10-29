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
}