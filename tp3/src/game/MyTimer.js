class MyTimer {
    constructor(orchestrator) {
        this.time = 0;
        this.counting = false;
        this.inited = false;

        this.orchestrator = orchestrator;
    }

    init() {
        this.inited = true;

        this.rectangle1 = new MyRectangle(this.orchestrator.getScene(), -0.11, -0.06, 0.85, 1);
        this.rectangle2 = new MyRectangle(this.orchestrator.getScene(), -0.06, -0.01, 0.85, 1);
        this.rectangle3 = new MyRectangle(this.orchestrator.getScene(), -0.01, 0.01, 0.85, 1);
        this.rectangle4 = new MyRectangle(this.orchestrator.getScene(), 0.01, 0.06, 0.85, 1);
        this.rectangle5 = new MyRectangle(this.orchestrator.getScene(), 0.06, 0.11, 0.85, 1);

        this.rectangle1.scaleTexCoords(0.05, 0.15);
        this.rectangle2.scaleTexCoords(0.05, 0.15);
        this.rectangle3.scaleTexCoords(0.02, 0.15);
        this.rectangle4.scaleTexCoords(0.05, 0.15);
        this.rectangle5.scaleTexCoords(0.05, 0.15);

        this.shader = new CGFshader(this.orchestrator.getScene().gl, "shaders/overlay.vert", "shaders/overlay.frag");
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
        if (this.inited) {
            const totalSeconds = Math.round(this.time / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            this.orchestrator.getScene().setActiveShader(this.shader);
            this.orchestrator.getScene().gl.disable(this.orchestrator.getScene().gl.DEPTH_TEST);

            this.orchestrator.getScene().graph.textures[Math.floor(minutes / 10)].bind(0);
            this.rectangle1.display();

            this.orchestrator.getScene().graph.textures[minutes % 10].bind(0);
            this.rectangle2.display();

            this.orchestrator.getScene().graph.textures['colon'].bind(0);
            this.rectangle3.display();

            this.orchestrator.getScene().graph.textures[Math.floor(seconds / 10)].bind(0);
            this.rectangle4.display();

            this.orchestrator.getScene().graph.textures[seconds % 10].bind(0);
            this.rectangle5.display();

            this.orchestrator.getScene().gl.enable(this.orchestrator.getScene().gl.DEPTH_TEST);

            this.orchestrator.getScene().setActiveShader(this.orchestrator.getScene().defaultShader);
        }
    }
}