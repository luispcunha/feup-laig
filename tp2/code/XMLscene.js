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

    this.rttTexture = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
    this.securityCamera = new MySecurityCamera(this, this.rttTexture);
    this.secCamShader = new CGFshader(this.gl, "shaders/securityCamera.vert", "shaders/securityCamera.frag");

    this.displayAxis = false;
    this.displayLights = false;
    this.displaySecurityCamera = true;

    this.lastT = 0;
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.rttTexture = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
    this.securityCamera.texture = this.rttTexture;
  }

  /**
  * Initializes the scene cameras.
  */
  initCameras() {
    const cam = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.currentMainCamera = cam;
    this.currentSecurityCamera = cam;
    this.camera = cam;
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
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

    this.initLights();

    this.currentMainView = this.graph.defaultView;
    this.onMainCameraChange();

    this.currentSecondaryView = this.graph.defaultView;
    this.onSecurityCameraChange();


    this.interface.initCameraSettings(Object.keys(this.graph.views));
    this.interface.initLightSettings();

    this.sceneInited = true;
  }

  /**
   * Set current camera to the one selected in the interface
   */
  onMainCameraChange() {
    this.currentMainCamera = this.graph.views[this.currentMainView];
    this.interface.setActiveCamera(this.currentMainCamera);
  }

  onSecurityCameraChange() {
    this.currentSecurityCamera = this.graph.views[this.currentSecondaryView];
  }


  display() {
    if (this.displaySecurityCamera) {
      this.rttTexture.attachToFrameBuffer();
      this.render(this.currentSecurityCamera);
      this.rttTexture.detachFromFrameBuffer();
    }
    this.render(this.currentMainCamera);
    if (this.displaySecurityCamera) {
      this.setActiveShader(this.secCamShader);
      this.gl.disable(this.gl.DEPTH_TEST);
      this.securityCamera.display();
      this.gl.enable(this.gl.DEPTH_TEST);
      this.setActiveShader(this.defaultShader);
    }
  }

  /**
  * Renders the scene.
  */
  render(camera) {
    // ---- BEGIN Background, camera and axis setup
    this.camera = camera;
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
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
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

    const shaderTimeFactor = 5000;
    this.secCamShader.setUniformsValues({ timeFactor: t / shaderTimeFactor % 1 });

    if (this.graph.loadedOk) {
      const keys = Object.keys(this.graph.animations);

      for (const key of keys)
        this.graph.animations[key].update(deltaT);
    }
  }
}
