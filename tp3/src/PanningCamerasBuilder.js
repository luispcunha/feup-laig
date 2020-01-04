class PanningCamerasBuilder {
    constructor(from, to, animationTime) {
        this.from = from;
        this.to = to;
        this.animationTime = animationTime * 1000;
        this.elapsedTime = 0;
    }

    update(t) {
        this.elapsedTime += t;
        if (this.elapsedTime > this.animationTime)
            return true;
        return false;
    }

    getCamera() {
        if (this.elapsedTime < this.animationTime) {
            const timeFactor = this.elapsedTime / this.animationTime;
            const fov = this.from.fov + (this.to.fov - this.from.fov) * timeFactor;
            const near = this.from.near + (this.to.near - this.from.near) * timeFactor;
            const far = this.from.far + (this.to.far - this.from.far) * timeFactor;
            const position = [
                this.from.position[0] + (this.to.position[0] - this.from.position[0]) * timeFactor,
                this.from.position[1] + (this.to.position[1] - this.from.position[1]) * timeFactor,
                this.from.position[2] + (this.to.position[2] - this.from.position[2]) * timeFactor
            ];
            const target = [
                this.from.target[0] + (this.to.target[0] - this.from.target[0]) * timeFactor,
                this.from.target[1] + (this.to.target[1] - this.from.target[1]) * timeFactor,
                this.from.target[2] + (this.to.target[2] - this.from.target[2]) * timeFactor
            ];
            return new CGFcamera(fov, near, far, position, target);
        }
        return this.to;
    }
}