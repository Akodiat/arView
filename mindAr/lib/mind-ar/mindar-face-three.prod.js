import { g } from "./resolution-utils-CAodkhtM.js";
import { Scene as u, WebGLRenderer as v, sRGBEncoding as m, PerspectiveCamera as p, Group as f, BufferAttribute as M, BufferGeometry as w, Mesh as S, MeshStandardMaterial as C } from "three";
import { CSS3DRenderer as y } from "three/addons/renderers/CSS3DRenderer.js";
import { C as A } from "./controller-DuJqkdE0.js";
import { U as R } from "./ui-BTBXHmb7.js";
class F {
  constructor(e, s, t, o, h, i = null) {
    this.container = e, this.ui = s, this.shouldFaceUser = t, this.userDeviceId = o, this.environmentDeviceId = h, this.resolution = i, this.video = null;
  }
  async start() {
    return new Promise((e, s) => {
      if (this.video = document.createElement("video"), this.video.setAttribute("autoplay", ""), this.video.setAttribute("muted", ""), this.video.setAttribute("playsinline", ""), this.video.style.position = "absolute", this.video.style.top = "0px", this.video.style.left = "0px", this.video.style.zIndex = "-2", this.container.appendChild(this.video), !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.ui.showCompatibility(), s();
        return;
      }
      const t = {
        audio: !1,
        video: {}
      };
      if (this.shouldFaceUser ? this.userDeviceId ? t.video.deviceId = { exact: this.userDeviceId } : t.video.facingMode = "user" : this.environmentDeviceId ? t.video.deviceId = { exact: this.environmentDeviceId } : t.video.facingMode = "environment", this.resolution) {
        const o = g(this.resolution);
        t.video.width = o.width, t.video.height = o.height;
      }
      navigator.mediaDevices.getUserMedia(t).then((o) => {
        this.video.addEventListener("loadedmetadata", () => {
          this.video.setAttribute("width", this.video.videoWidth), this.video.setAttribute("height", this.video.videoHeight), e();
        }), this.video.srcObject = o;
      }).catch((o) => {
        console.log("getUserMedia error", o), s();
      });
    });
  }
  stop() {
    this.video && this.video.srcObject && this.video.srcObject.getTracks().forEach(function(s) {
      s.stop();
    }), this.video && (this.video.remove(), this.video = null);
  }
  switchCamera() {
    this.shouldFaceUser = !this.shouldFaceUser;
  }
  setResolution(e) {
    this.resolution = e;
  }
  getVideo() {
    return this.video;
  }
}
class x {
  constructor(e) {
    this.container = e, this.scene = new u(), this.cssScene = new u(), this.renderer = new v({ antialias: !0, alpha: !0 }), this.cssRenderer = new y({ antialias: !0 }), this.renderer.outputEncoding = m, this.renderer.setPixelRatio(window.devicePixelRatio), this.camera = new p(), this.container.appendChild(this.renderer.domElement), this.container.appendChild(this.cssRenderer.domElement);
  }
  getScene() {
    return this.scene;
  }
  getCSSScene() {
    return this.cssScene;
  }
  getRenderer() {
    return this.renderer;
  }
  getCSSRenderer() {
    return this.cssRenderer;
  }
  getCamera() {
    return this.camera;
  }
}
class b {
  constructor(e, s, t) {
    this.scene = e, this.cssScene = s, this.controller = t, this.anchors = [], this.faceMeshes = [];
  }
  addAnchor(e) {
    const s = new f();
    s.matrixAutoUpdate = !1;
    const t = {
      group: s,
      landmarkIndex: e,
      css: !1
    };
    return this.anchors.push(t), this.scene.add(s), t;
  }
  addCSSAnchor(e) {
    const s = new f();
    s.matrixAutoUpdate = !1;
    const t = {
      group: s,
      landmarkIndex: e,
      css: !0
    };
    return this.anchors.push(t), this.cssScene.add(s), t;
  }
  addFaceMesh() {
    const e = { BufferGeometry: w, BufferAttribute: M }, s = this.controller.createThreeFaceGeometry(e), t = new S(s, new C({ color: 16777215 }));
    return t.visible = !1, t.matrixAutoUpdate = !1, this.faceMeshes.push(t), t;
  }
  getAnchors() {
    return this.anchors;
  }
  getFaceMeshes() {
    return this.faceMeshes;
  }
}
class E {
  constructor(e, s, t) {
    this.anchors = e, this.faceMeshes = s, this.controller = t;
  }
  update(e, s) {
    for (let t = 0; t < this.anchors.length; t++)
      this.anchors[t].css ? this.anchors[t].group.children.forEach((o) => {
        o.element.style.visibility = e ? "visible" : "hidden";
      }) : this.anchors[t].group.visible = e;
    for (let t = 0; t < this.faceMeshes.length; t++)
      this.faceMeshes[t].visible = e;
    if (e) {
      const { metricLandmarks: t, faceMatrix: o, faceScale: h, blendshapes: i } = s;
      for (let r = 0; r < this.anchors.length; r++) {
        const a = this.anchors[r].landmarkIndex, n = this.controller.getLandmarkMatrix(a);
        if (this.anchors[r].css) {
          const d = [
            1e-3 * n[0],
            1e-3 * n[1],
            n[2],
            n[3],
            1e-3 * n[4],
            1e-3 * n[5],
            n[6],
            n[7],
            1e-3 * n[8],
            1e-3 * n[9],
            n[10],
            n[11],
            1e-3 * n[12],
            1e-3 * n[13],
            n[14],
            n[15]
          ];
          this.anchors[r].group.matrix.set(...d);
        } else
          this.anchors[r].group.matrix.set(...n);
      }
      for (let r = 0; r < this.faceMeshes.length; r++)
        this.faceMeshes[r].matrix.set(...o);
    }
  }
}
class I {
  constructor(e, s, t, o, h, i, r, a) {
    this.renderer = e, this.cssRenderer = s, this.camera = t, this.container = o, this.video = h, this.controller = i, this.shouldFaceUser = r, this.disableFaceMirror = a;
  }
  resize() {
    if (!this.video) return;
    {
      this.video.setAttribute("width", this.video.videoWidth), this.video.setAttribute("height", this.video.videoHeight), this.controller.onInputResized(this.video);
      const { fov: r, aspect: a, near: n, far: l } = this.controller.getCameraParams();
      this.camera.fov = r, this.camera.aspect = a, this.camera.near = n, this.camera.far = l, this.camera.updateProjectionMatrix(), this.renderer.setSize(this.video.videoWidth, this.video.videoHeight), this.cssRenderer.setSize(this.video.videoWidth, this.video.videoHeight);
    }
    let e, s;
    const t = this.video.videoWidth / this.video.videoHeight, o = this.container.clientWidth / this.container.clientHeight;
    t > o ? (s = this.container.clientHeight, e = s * t) : (e = this.container.clientWidth, s = e / t), this.video.style.top = -(s - this.container.clientHeight) / 2 + "px", this.video.style.left = -(e - this.container.clientWidth) / 2 + "px", this.video.style.width = e + "px", this.video.style.height = s + "px", this.shouldFaceUser && !this.disableFaceMirror ? this.video.style.transform = "scaleX(-1)" : this.video.style.transform = "scaleX(1)";
    const h = this.renderer.domElement, i = this.cssRenderer.domElement;
    h.style.position = "absolute", h.style.top = this.video.style.top, h.style.left = this.video.style.left, h.style.width = this.video.style.width, h.style.height = this.video.style.height, i.style.position = "absolute", i.style.top = this.video.style.top, i.style.left = this.video.style.left, i.style.transformOrigin = "top left", i.style.transform = "scale(" + e / parseFloat(i.style.width) + "," + s / parseFloat(i.style.height) + ")";
  }
}
class U {
  constructor(e, s) {
    this.video = e, this.controllerConfig = s, this.controller = null;
  }
  async start(e) {
    return this.controller = new A({
      filterMinCF: this.controllerConfig.filterMinCF,
      filterBeta: this.controllerConfig.filterBeta,
      filterDCutOff: this.controllerConfig.filterDCutOff
    }), this.controller.onUpdate = this.controllerConfig.onUpdate, await this.controller.setup(e), await this.controller.dummyRun(this.video), this.controller.processVideo(this.video), this.controller;
  }
  stop() {
    this.controller && (this.controller.stopProcessVideo(), this.controller = null);
  }
  getController() {
    return this.controller;
  }
}
class D {
  constructor({
    container: e,
    uiLoading: s = "yes",
    uiScanning: t = "yes",
    uiError: o = "yes",
    filterMinCF: h = null,
    filterBeta: i = null,
    filterDCutOff: r = null,
    userDeviceId: a = null,
    environmentDeviceId: n = null,
    disableFaceMirror: l = !1,
    resolution: d = null
  }) {
    this.container = e, this.filterMinCF = h, this.filterBeta = i, this.filterDCutOff = r, this.userDeviceId = a, this.environmentDeviceId = n, this.disableFaceMirror = l, this.resolution = d, this.shouldFaceUser = !0, this.ui = new R({ uiLoading: s, uiScanning: t, uiError: o }), this.rendererSetup = new x(e), this.scene = this.rendererSetup.getScene(), this.cssScene = this.rendererSetup.getCSSScene(), this.renderer = this.rendererSetup.getRenderer(), this.cssRenderer = this.rendererSetup.getCSSRenderer(), this.camera = this.rendererSetup.getCamera(), this.videoManager = null, this.anchorManager = null, this.matrixUpdater = null, this.resizeHandler = null, this.arSession = null, this.latestEstimate = null, window.addEventListener("resize", this._resize.bind(this));
  }
  async start() {
    this.ui.showLoading(), this.videoManager = new F(
      this.container,
      this.ui,
      this.shouldFaceUser,
      this.userDeviceId,
      this.environmentDeviceId,
      this.resolution
    ), await this.videoManager.start(), await this._startAR(), this.ui.hideLoading();
  }
  stop() {
    this.arSession && this.arSession.stop(), this.videoManager && this.videoManager.stop();
  }
  switchCamera() {
    this.shouldFaceUser = !this.shouldFaceUser, this.videoManager && this.videoManager.switchCamera(), this.stop(), this.start();
  }
  async setResolution(e) {
    if (e !== null && typeof e != "string")
      throw new Error('Resolution must be a string (e.g., "360p", "720p") or null');
    if (this.resolution === e)
      return;
    const s = this.arSession !== null;
    let t = [], o = [], h = [];
    if (s && this.anchorManager) {
      const i = this.anchorManager.getAnchors();
      t = i.filter((a) => !a.css).map((a) => ({
        landmarkIndex: a.landmarkIndex,
        group: a.group
        // Preserve the group with user's 3D objects
      })), o = i.filter((a) => a.css).map((a) => ({
        landmarkIndex: a.landmarkIndex,
        group: a.group
        // Preserve the group with user's 3D objects
      })), h = this.anchorManager.getFaceMeshes().map((a) => ({
        visible: a.visible,
        material: a.material.clone()
        // Clone material to preserve settings
      }));
    }
    s && (this.ui.showLoading(), this.stop()), this.resolution = e, this.videoManager && this.videoManager.setResolution(e), s && (await this.start(), this.anchorManager && (t.forEach((i) => {
      const r = [];
      for (; i.group.children.length > 0; )
        r.push(i.group.children[0]);
      this.scene.remove(i.group);
      const a = this.anchorManager.addAnchor(i.landmarkIndex);
      r.forEach((n) => a.group.add(n));
    }), o.forEach((i) => {
      const r = [];
      for (; i.group.children.length > 0; )
        r.push(i.group.children[0]);
      this.cssScene.remove(i.group);
      const a = this.anchorManager.addCSSAnchor(i.landmarkIndex);
      r.forEach((n) => a.group.add(n));
    }), h.forEach((i) => {
      const r = this.anchorManager.addFaceMesh();
      r.visible = i.visible, r.material = i.material;
    })));
  }
  addAnchor(e) {
    if (!this.anchorManager)
      throw new Error("AR session not started. Call start() first.");
    return this.anchorManager.addAnchor(e);
  }
  addCSSAnchor(e) {
    if (!this.anchorManager)
      throw new Error("AR session not started. Call start() first.");
    return this.anchorManager.addCSSAnchor(e);
  }
  addFaceMesh() {
    if (!this.anchorManager)
      throw new Error("AR session not started. Call start() first.");
    return this.anchorManager.addFaceMesh();
  }
  getLatestEstimate() {
    return this.latestEstimate;
  }
  _resize() {
    this.resizeHandler && this.resizeHandler.resize();
  }
  setFilterParams({ filterMinCF: e, filterBeta: s, filterDCutOff: t }) {
    e !== void 0 && (this.filterMinCF = e), s !== void 0 && (this.filterBeta = s), t !== void 0 && (this.filterDCutOff = t), this.arSession && this.arSession.getController() && this.arSession.getController().setFilterParams({ filterMinCF: e, filterBeta: s, filterDCutOff: t });
  }
  getConfig() {
    const e = {
      filterMinCF: this.filterMinCF,
      filterBeta: this.filterBeta,
      filterDCutOff: this.filterDCutOff
    };
    return this.arSession && this.arSession.getController() ? {
      ...e,
      controller: this.arSession.getController().getConfig()
    } : e;
  }
  async _startAR() {
    const e = this.videoManager.getVideo();
    this.arSession = new U(e, {
      filterMinCF: this.filterMinCF,
      filterBeta: this.filterBeta,
      filterDCutOff: this.filterDCutOff,
      onUpdate: ({ hasFace: o, estimateResult: h }) => {
        this.latestEstimate = o ? h : null, this.matrixUpdater && this.matrixUpdater.update(o, h);
      }
    });
    const s = this.shouldFaceUser && !this.disableFaceMirror, t = await this.arSession.start(s);
    this.anchorManager = new b(this.scene, this.cssScene, t), this.matrixUpdater = new E(
      this.anchorManager.getAnchors(),
      this.anchorManager.getFaceMeshes(),
      t
    ), this.resizeHandler = new I(
      this.renderer,
      this.cssRenderer,
      this.camera,
      this.container,
      e,
      t,
      this.shouldFaceUser,
      this.disableFaceMirror
    ), this._resize();
  }
}
window.MINDAR || (window.MINDAR = {});
window.MINDAR.FACE || (window.MINDAR.FACE = {});
window.MINDAR.FACE.MindARThree = D;
export {
  D as MindARThree
};
