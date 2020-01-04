var DEGREE_TO_RAD = Math.PI / 180;

/**
* XMLscene class, representing the scene that is to be rendered.
*/
class XMLscene extends CGFscene {
  /**
  * @constructor
  * @param {MyInterface} myinterface
  */
  constructor(myinterface) {
    super();

    this.interface = myinterface;
    this.gameOrchestrator = new MyGameOrchestrator(this);
  }

  /**
  * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
  * @param {CGFApplication} application
  */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(20);

    this.displayAxis = false;
    this.displayLights = false;

    this.lastT = 0;

    this.graphs = { };
    this.graphsLoadedOk = { };

    this.currentGraphKey = null;
  }

  /**
  * Initializes the scene cameras.
  */
  initCameras() {
    const cam = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.setCamera(cam);
  }

  /**
  * Initializes the scene lights with the values read from the XML file.
  */
  initLights() {
    var i = 0;
    // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
      if (i >= 8)
        break;              // Only eight lights allowed by WebGL.

      if (this.graph.lights.hasOwnProperty(key)) {
        var light = this.graph.lights[key];

        this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
        this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
        this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
        this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
        this.lights[i].setConstantAttenuation(light[6][0]);
        this.lights[i].setLinearAttenuation(light[6][1]);
        this.lights[i].setQuadraticAttenuation(light[6][2]);

        if (light[1] == "spot") {
          this.lights[i].setSpotCutOff(light[7]);
          this.lights[i].setSpotExponent(light[8]);
          this.lights[i].setSpotDirection(
            light[9][0] - light[2][0],
            light[9][1] - light[2][1],
            light[9][2] - light[2][2]
          );
        }

        this.lights[i].setVisible(this.displayLights);
        if (light[0])
          this.lights[i].enable();
        else
          this.lights[i].disable();

        this.lights[i].update();

        i++;
      }
    }
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }

  /** Handler called when the graph is finally loaded.
  * As loading is asynchronous, this may be called already after the application has started the run loop
  */
  onGraphLoaded() {
    if (this.allGraphsLoaded()) {
      this.changeGraph();

      this.interface.initGameSettings();

      this.gameOrchestrator.onSceneInited();

      this.sceneInited = true;
    }
  }

  /**
   * Set current camera to the one selected in the interface
   */
  onMainCameraChange() {
    this.mainCamera = this.graph.views[this.mainView];
    if (this.currentView == 'main')
      this.setCamera(this.mainCamera);
  }

  onP1CameraChange() {
    this.p1Camera = this.graph.views[this.p1View];
    if (this.currentView == 'player1')
      this.setCamera(this.p1Camera);
  }

  onP2CameraChange() {
    this.p2Camera = this.graph.views[this.p2View];
    if (this.currentView == 'player2')
      this.setCamera(this.p2Camera);
  }

  setCamera(camera) {
    this.camera = camera;
    this.interface.setActiveCamera(camera);
  }


  display() {
    if (this.cameraInTransition) {
      this.camera = this.cameraBuilder.getCamera();
    }
    this.gameOrchestrator.managePick(this.pickMode, this.pickResults);
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();


    if (this.sceneInited) {

      for (const light of this.lights)
        light.update();

      if (this.displayAxis)
        this.axis.display();

      // Draw axis
      this.setDefaultAppearance();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();
      this.gameOrchestrator.display();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }

  setPlayerCamera(player) {
    switch (player) {
      case '1':
        console.log('changing camera to player 1');
        this.currentView = 'player1';
        this.goToCamera(this.p1Camera);
        break;
      case '2':
        console.log('changing camera to player 2');
        this.currentView = 'player2';
        this.goToCamera(this.p2Camera);
        break;
      default:
        console.log('changing camera to main');
        this.currentView = 'main';
        this.goToCamera(this.mainCamera);
    }
  }

  goToCamera(camera) {
    this.cameraBuilder = new PanningCamerasBuilder(this.camera, camera, 1.2);
    this.cameraInTransition = true;
  }

  /**
   * Changes the material of all graph components that have multiple materials defined
   */
  cycleMaterials() {
    this.graph.cycleMaterials();
  }

  /**
   * Updates the visibility of all lights according to this.displayLights bool value (controlable in the interface)
   */
  onLightVisibilityChange() {
    for (const light of this.lights) {
      light.setVisible(this.displayLights);
    }
  }

  /**
   * Updates all animations in the scene.
   */
  update(t) {
    let deltaT = t - this.lastT;
    this.lastT = t;

    if (this.sceneInited) {
      const keys = Object.keys(this.graph.animations);

      for (const key of keys)
        this.graph.animations[key].update(deltaT);
    }

    this.gameOrchestrator.update(deltaT);

    if (this.cameraBuilder) {
      if (this.cameraBuilder.update(deltaT)) {
        this.setCamera(this.cameraBuilder.getCamera());
        this.cameraBuilder = undefined;
        this.cameraInTransition = undefined;
      }
    }
  }

  addGraph(graph) {
    this.graphs[graph.id] = graph;
    this.graphsLoadedOk[graph.id] = true;
  }

  addGraphKeys(keys) {
    this.currentGraphKey = keys[0];

    keys.forEach((key) => {
      this.graphsLoadedOk[key] = false;
    });
  }

  allGraphsLoaded() {
    let allLoaded = true;

    Object.values(this.graphsLoadedOk).forEach((loaded) => {
      if (! loaded)
        allLoaded = loaded;
    });

    return allLoaded;
  }

  changeGraph() {
    this.graph = this.graphs[this.currentGraphKey];

    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

    this.initLights();

    this.currentView = 'main';
    this.mainView = this.graph.defaultView;
    this.onMainCameraChange();
    this.p1View = this.graph.p1DefaultView;
    this.onP1CameraChange();
    this.p2View = this.graph.p2DefaultView;
    this.onP2CameraChange();

    this.interface.initCameraSettings(Object.keys(this.graph.views));
  }
}
