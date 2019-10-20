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

        // checkbox to control light visibility
        this.settingsFolder.add(this.scene, "displayLights").name("Display Lights").onChange(() => {
            this.scene.setLightVisibility();
        });

        // checkbox to control axis visibility
        this.settingsFolder.add(this.scene, "displayAxis").name("Display Axis");

        this.initKeys();

        return true;
    }

    /**
     * Adds dropdown to select camera to the settings interface.
     */
    initCameraOptions() {
      this.settingsFolder.add(this.scene, "currentView", Object.keys(this.scene.graph.views)).name("Current Camera").onChange(() => {
          this.scene.onCameraChange();
          this.setActiveCamera(this.scene.camera);
      });
    }

    /**
     * Adds checkboxes to toggle lights on/off
     */
    initLightOptions() {
        const keys = Object.keys(this.scene.graph.lights);

        for (let i = 0; i < keys.length; i++) {
            this.settingsFolder.add(this.scene.lights[i], 'enabled').name(keys[i]);
        }
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
 