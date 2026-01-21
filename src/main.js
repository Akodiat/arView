import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {
    ArToolkitSource,
    ArToolkitContext,
    ArMarkerControls
} from 'threex';

ArToolkitContext.baseURL = './';

class View {
    constructor() {
        // init renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setClearColor(new THREE.Color('lightgrey'), 0);
        this.renderer.setSize(640, 480);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0px';
        this.renderer.domElement.style.left = '0px';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.animationMixers = [];

        // array of functions for the rendering loop
        this.onRenderFcts = [];

        // init scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.scene.add(this.camera);

        this.arToolkitSource = new ArToolkitSource({
            sourceType: 'webcam',
            sourceWidth: window.innerWidth > window.innerHeight ? 640 : 480,
            sourceHeight: window.innerWidth > window.innerHeight ? 480 : 640,
        });

        this.arToolkitSource.init(() => {
            this.arToolkitSource.domElement.addEventListener('canplay', () => {
                console.log(
                    'canplay',
                    'actual source dimensions',
                    this.arToolkitSource.domElement.videoWidth,
                    this.arToolkitSource.domElement.videoHeight
                );
                this.initARContext();
            });
        })

        // handle resize
        window.addEventListener('resize', () => {
            this.arToolkitSource.onResizeElement();
            this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);
            if (this.arToolkitContext &&this.arToolkitContext.arController) {
                this.arToolkitSource.copyElementSizeTo(
                    this.arToolkitContext.arController.canvas
                );
            }
        });

        this.setupLights();

        var geometry = new THREE.BoxGeometry(1, 0.1, 1);
        var material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = geometry.parameters.height / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const loader = new GLTFLoader();
        loader.loadAsync("resources/flamingo.glb").then(
            gltf => {
                const model = gltf.scene;
                model.scale.multiplyScalar(0.01);
                model.position.y += 1;
                model.traverse(child=>{
                    child.castShadow = true;
                    child.receiveShadow = true;
                })
                this.scene.add(model);

                if (gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(gltf.scene);
                    for (const a of gltf.animations) {
                        mixer.clipAction(a).play();
                    }
                    this.animationMixers.push(mixer);
                }
            }
        );

        this.renderer.setAnimationLoop(() => this.animate());
    }

    setupLights() {
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 1.75, 1);
        dirLight.position.multiplyScalar(0.3);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        const d = 2;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 35;
        dirLight.shadow.bias = - 0.0001;

        this.scene.add(dirLight);

        //const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 1 );
        //this.scene.add(dirLightHelper);
    }


    initARContext() {
        // create atToolkitContext
        this.arToolkitContext = new ArToolkitContext({
            cameraParametersUrl: ArToolkitContext.baseURL + "data/camera_para.dat",
            detectionMode: 'mono'
        });
        // initialize it
        this.arToolkitContext.init(() => { // copy projection matrix to camera
            this.camera.projectionMatrix.copy(
                this.arToolkitContext.getProjectionMatrix()
            );

            this.arToolkitContext.arController.orientation = this.getSourceOrientation();
            this.arToolkitContext.arController.options.orientation = this.getSourceOrientation();

            console.log('arToolkitContext', this.arToolkitContext);

            this.arToolkitSource.onResizeElement();
            this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);
            this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas);

            document.getElementById("loadingDialog").open = false;
        })

        // MARKER
        this.arMarkerControls = new ArMarkerControls(
            this.arToolkitContext,
            this.camera, {
                type: 'pattern',
                patternUrl: ArToolkitContext.baseURL + "data/patt.hiro",
                changeMatrixMode: 'cameraTransformMatrix'
            }
        );

        this.scene.visible = false;

        console.log('ArMarkerControls', this.arMarkerControls);
    }

    getSourceOrientation() {
        if (!this.arToolkitSource) {
            return null;
        }

        console.log(
            'actual source dimensions',
            this.arToolkitSource.domElement.videoWidth,
            this.arToolkitSource.domElement.videoHeight
        );

        if (this.arToolkitSource.domElement.videoWidth > this.arToolkitSource.domElement.videoHeight) {
            console.log('source orientation', 'landscape');
            return 'landscape';
        } else {
            console.log('source orientation', 'portrait');
            return 'portrait';
        }
    }

    animate() {
        if (!this.arToolkitContext ||
            !this.arToolkitSource ||
            !this.arToolkitSource.ready
        ) {
            return;
        }

        this.arToolkitContext.update(this.arToolkitSource.domElement);

        // update scene.visible if the marker is seen
        this.scene.visible = this.camera.visible;

        const delta = this.clock.getDelta();
        for (const mixer of this.animationMixers) {
            mixer.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

new View();