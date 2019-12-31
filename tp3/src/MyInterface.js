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

        this.initDisplaySettings();
        this.initKeys();

        return true;
    }

    /**
     * Adds folder with checkboxes to control the visibility of lights and axis.
     */
    initDisplaySettings() {
        this.displaySettingsFolder = this.settingsFolder.addFolder("Display");
        this.displaySettingsFolder.add(this.scene, "displayLights").name("Display Lights").onChange(() => this.scene.onLightVisibilityChange());
        this.displaySettingsFolder.add(this.scene, "displayAxis").name("Display Axis");
    }

    /**
     * Adds folder with dropdown to select current cameras
     */
    initCameraSettings(viewsList) {
        this.cameraSettingsFolder = this.settingsFolder.addFolder("Active Cameras");
        // Dropdown for the main camera
        this.cameraSettingsFolder.add(this.scene, "currentMainView", viewsList).name("Main Camera").onChange(() => this.scene.onMainCameraChange());

        //this.cameraSettingsFolder.add(this.scene, 'currentP1View', viewsList).name('Player 1\'s Camera').onChange(() => this.scene.onP1CameraChange());

        //this.cameraSettingsFolder.add(this.scene, 'currentP2View', viewsList).name('Player 2\'s Camera').onChange(() => this.scene.onP2CameraChange());
    }

    /**
     * Adds checkboxes to toggle lights on/off
     */
    initLightSettings() {
        this.lightSettingsFolder = this.settingsFolder.addFolder("Active Lights");

        const keys = Object.keys(this.scene.graph.lights);
        for (let i = 0; i < keys.length; i++) {
            this.lightSettingsFolder.add(this.scene.lights[i], 'enabled').name(keys[i]);
        }
    }

    initGameSettings() {
        this.gui.add(this.scene.gameOrchestrator, "start").name("Start");
        this.gui.add(this.scene.gameOrchestrator, "undo").name("Undo");
        this.gui.add(this.scene.gameOrchestrator, "p1Type", { "Human": PlayerType.human, "Bot lvl 1": PlayerType.lvl1, "Bot lvl 2": PlayerType.lvl2 }).name("Player 1");
        this.gui.add(this.scene.gameOrchestrator, "p2Type", { "Human": PlayerType.human, "Bot lvl 1": PlayerType.lvl1, "Bot lvl 2": PlayerType.lvl2 }).name("Player 2");
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
