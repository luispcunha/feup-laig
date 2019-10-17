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

        // add a group of controls (and open/expand by defult)
        this.settingsFolder = this.gui.addFolder("Settings");
        this.initKeys();

        return true;
    }

    initCameraOptions() {
      this.settingsFolder.add(this.scene, "currentView", Object.keys(this.scene.graph.views)).name("Current Camera").onChange(() => {
          this.scene.onCameraChange();
          this.setActiveCamera(this.scene.camera);
      });
    }

    initLightOptions() {
        const keys = Object.keys(this.scene.graph.lights);

        for (let i = 0; i < keys.length; i++) {
            this.settingsFolder.add(this.scene.lights[i], 'enabled').name(keys[i]);
        }
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.activeKeys={};
    }

    processKeyboard(event) {
        if (event.code == "KeyM") {
            this.scene.cycleMaterials();
        }
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}
