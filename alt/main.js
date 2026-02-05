import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ArToolkitSource, ArToolkitContext, ArMarkerControls}  from 'threex';

ArToolkitContext.baseURL = '../';

const cameraParam = "./camera_para.dat"
let arToolkitContext, arMarkerControls;

const clock = new THREE.Clock();
const animationMixers = [];

// init renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0)
renderer.setSize( 640, 480 );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild(renderer.domElement);

// init scene and camera
const scene	= new THREE.Scene();

// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false;

// Create a camera
const camera = new THREE.Camera();
scene.add(camera);

// Add lights
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

const arToolkitSource = new ArToolkitSource({
    sourceType : 'webcam',
    sourceWidth: window.innerWidth > window.innerHeight ? 1280 : 960,
    sourceHeight: window.innerWidth > window.innerHeight ? 960 : 1280,
})

arToolkitSource.init(() => {
    arToolkitSource.domElement.addEventListener('canplay', () => {
        console.log('initARContext()');

        // CONTEXT
        arToolkitContext = new ArToolkitContext({
            cameraParametersUrl: cameraParam,
            detectionMode: 'mono_and_matrix',
            matrixCodeType: '3x3',
            patternRatio: 0.5,

            canvasWidth: arToolkitSource.domElement.videoWidth,
            canvasHeight: arToolkitSource.domElement.videoHeight
        });

        arToolkitContext.init(() => {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

            const sourceOrientation = getSourceOrientation()

            arToolkitContext.arController.orientation = sourceOrientation;
            arToolkitContext.arController.options.orientation = sourceOrientation;

            console.log('arToolkitContext', arToolkitContext);
            resize();
        });

        // MARKER
        arMarkerControls = new ArMarkerControls(arToolkitContext, camera, {
            type: 'barcode',
            barcodeValue: 0,
            smooth: true,
            changeMatrixMode: 'cameraTransformMatrix',
        });

        console.log('ArMarkerControls', arMarkerControls);
        //window.arMarkerControls = arMarkerControls;
    });
});

function getSourceOrientation() {
    if (!arToolkitSource) {
        return null;
    }
    return (
        arToolkitSource.domElement.videoWidth >
        arToolkitSource.domElement.videoHeight ?
        'landscape' : 'portrait'
    );
}

// handle resize
window.addEventListener('resize', function(){
    resize();
})

function resize(){
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if( arToolkitContext.arController !== null ){
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

const loader = new GLTFLoader();

loader.loadAsync("../resources/flamingo.glb").then(
    gltf => {
        const model = gltf.scene;
        model.scale.multiplyScalar(0.01);
        model.position.y += 1;
        scene.add(model);

        if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const a of gltf.animations) {
                mixer.clipAction(a).play();
            }
            animationMixers.push(mixer);
        }
    }
);

// add a simple box
const geometry = new THREE.BoxGeometry(1, 0.1, 1);
const material = new THREE.MeshStandardMaterial({
    transparent : true,
    opacity: 0.5,
    side: THREE.DoubleSide
});
const mesh = new THREE.Mesh(geometry, material);
mesh.position.y	= geometry.parameters.height/2
scene.add(mesh);

renderer.setAnimationLoop(() => {
    if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
        return;
    }

    arToolkitContext.update(arToolkitSource.domElement);

    // update scene.visible if the marker is seen
    scene.visible = camera.visible;

    const delta = clock.getDelta();
    for (const mixer of animationMixers) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
});