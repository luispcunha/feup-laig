class MyTimer {
    constructor(orchestrator) {
        this.time = 0;
        this.counting = false;
        this.inited = false;

        this.orchestrator = orchestrator;

        this.visible = false;
    }

    init() {
        this.inited = true;

        const scene = this.orchestrator.getScene();

        this.minutesTens = new MyOverlayElement(scene, -0.11, -0.06, 0.85, 1);
        this.minutesUnits = new MyOverlayElement(scene, -0.06, -0.01, 0.85, 1);
        this.colon = new MyOverlayElement(scene, -0.01, 0.01, 0.85, 1);
        this.secondsTens = new MyOverlayElement(scene, 0.01, 0.06, 0.85, 1);
        this.secondsUnits = new MyOverlayElement(scene, 0.06, 0.11, 0.85, 1);

        this.colon.setTexture(this.orchestrator.colonTexture);
    }

    hide() {
        this.visible = false;
    }

    show() {
        this.visible = true;
    }

    start() {
        this.counting = true;
    }

    stop() {
        this.counting = false;
    }

    reset() {
        this.time = 0;
    }

    update(t) {
        if (this.counting)
            this.time += t;
    }

    display() {
        if (this.inited && this.visible) {
            const totalSeconds = Math.round(this.time / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            this.minutesTens.setTexture(this.orchestrator.numberTextures[Math.floor(minutes / 10)]);
            this.minutesTens.display();

            this.minutesUnits.setTexture(this.orchestrator.numberTextures[minutes % 10]);
            this.minutesUnits.display();

            this.secondsTens.setTexture(this.orchestrator.numberTextures[Math.floor(seconds / 10)]);
            this.secondsTens.display();

            this.secondsUnits.setTexture(this.orchestrator.numberTextures[seconds % 10]);
            this.secondsUnits.display();

            this.colon.display();
        }
    }
}