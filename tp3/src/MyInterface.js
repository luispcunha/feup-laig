/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by default)
        this.settingsFolder = this.gui.addFolder("Settings");
        this.settingsFolder.open();
        this.initKeys();

        return true;
    }

    /**
     * Adds folder with dropdown to select current cameras
     */
    initCameraSettings(viewsList) {
        this.cameraSettingsFolder = this.settingsFolder.addFolder("Camera Settings");
        // Dropdown for the main camera
        this.cameraSettingsFolder.add(this.scene, "mainView", viewsList).name("Main Camera").onChange(() => this.scene.onMainCameraChange());

        this.cameraSettingsFolder.add(this.scene, 'p1View', viewsList).name('Player 1\'s Camera').onChange(() => this.scene.onP1CameraChange());

        this.cameraSettingsFolder.add(this.scene, 'p2View', viewsList).name('Player 2\'s Camera').onChange(() => this.scene.onP2CameraChange());
    }

    initGameSettings() {
        this.gui.add(this.scene.gameOrchestrator, "start").name("Start");
        this.gui.add(this.scene.gameOrchestrator, "undo").name("Undo");
        this.gui.add(this.scene.gameOrchestrator, "p1Type", { "Human": PlayerType.human, "Bot lvl 1": PlayerType.lvl1, "Bot lvl 2": PlayerType.lvl2 }).name("Player 1");
        this.gui.add(this.scene.gameOrchestrator, "p2Type", { "Human": PlayerType.human, "Bot lvl 1": PlayerType.lvl1, "Bot lvl 2": PlayerType.lvl2 }).name("Player 2");
        this.gui.add(this.scene.gameOrchestrator, "movie").name("Movie");

        this.gui.add(this.scene.gameOrchestrator, "nColumns", 4, 20).step(1).name("# columns").onChange(() => this.scene.gameOrchestrator.changeBoardSize());
        this.gui.add(this.scene.gameOrchestrator, "nRows", 4, 20).step(1).name("# rows").onChange(() => this.scene.gameOrchestrator.changeBoardSize());
    }

    /**
     * Set up interface to use keyboard
     */
    initKeys() {
        // create reference from the scene to the GUI
        this.scene.gui = this;
        // create a named array to store which keys are being pressed
        this.activeKeys = {};
    }

    /**
     * Event handler for when the user presses and releases a key
     * @param {Event} event
     */
    processKeyboard(event) {
        if (event.code == "KeyM") {
            this.scene.cycleMaterials();
        }
    }

    /**
     * Event handler for when the user presses a key
     * @param {Event} event
     */
    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };

    /**
     * Event handler for when the user releases a key
     * @param {Event} event
     */
    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    /**
     * Checks if a key is currently pressed
     * @param {KeyCode} keyCode
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}
