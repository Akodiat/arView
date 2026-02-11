import * as THREE from "three"
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

import {
    ArToolkitSource,
    ArToolkitContext,
    ArMarkerControls
} from "threex";


const modelList = [
    "../resources/flamingo.glb",
    "../resources/horse.glb"
];

var scene, camera, renderer;

var arToolkitSource, arToolkitContext;

const animationMixers = [];


const loader = new GLTFLoader();
const clock = new THREE.Clock();

const markerRoot = new THREE.Group();

initialize();

function initialize() {
    scene = new THREE.Scene();

    let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color("lightgrey"), 0)
    renderer.setSize(640, 480);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.body.appendChild(renderer.domElement);


    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////

    arToolkitSource = new ArToolkitSource({
        sourceType: "webcam",
        sourceWidth: window.innerWidth,
        sourceHeight: window.innerHeight,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
    });

    // handle resize event
    window.addEventListener("resize", onResize);

    // Ugly hacks to make sure we have correct canvas size
    window.addEventListener("markerFound", onResize);
    window.addEventListener("click", onResize);

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////

    // create atToolkitContext
    arToolkitContext = new ArToolkitContext({
        cameraParametersUrl: "../resources/camera_para.dat",
        detectionMode: "mono_and_matrix",
        matrixCodeType: "4x4_BCH_13_9_3",
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    arToolkitSource.init(() => {});

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////

    // build markerControls
    scene.add(markerRoot);

    for (let i=0; i<modelList.length; i++) {
        markerRoot.add(addModel(i));
    }

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(0.3);

    scene.add(dirLight);

    renderer.setAnimationLoop(animate);

}

function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
}

function addModel(modelId) {
    const group = new THREE.Group();

    const markerGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const markerMaterial = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.y = 0.05;
    group.add(markerMesh);

    loader.loadAsync(modelList[modelId]).then(
        gltf => {
            const mesh = gltf.scene;
            group.add(mesh);

            if (gltf.animations.length > 0) {
                const animationMixer = new THREE.AnimationMixer(gltf.scene);
                for (const a of gltf.animations) {
                    animationMixer.clipAction(a).play();
                }
                animationMixers.push(animationMixer);
            }
        }
    );
    new ArMarkerControls(arToolkitContext, group, {
        type: "barcode",
        barcodeValue: modelId,
    });

    return group;
}


function render() {
    renderer.render(scene, camera);
}


let initialResize = false;
function animate() {
    const delta = clock.getDelta();
    for (const a of animationMixers) {
        a.update(delta);
    }
    if (!initialResize) {
        // Ugly, but only way I found to trigger resize after
        // everything is set up.
        onResize();
        initialResize = true;
    }
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
    }
    render();
}