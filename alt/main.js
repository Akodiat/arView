import * as THREE from 'three'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

import {
    ArToolkitSource,
    ArToolkitContext,
    ArMarkerControls
} from 'threex';


const modelList = [
    "../resources/flamingo.glb",
    "../resources/horse.glb"
];

var scene, camera, renderer;

var arToolkitSource, arToolkitContext;

var mesh;

let currentModelId, currentModel;
let animationMixer;


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
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);


    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////

    arToolkitSource = new ArToolkitSource({
        sourceType: 'webcam',
        sourceWidth: window.innerWidth,
        sourceHeight: window.innerHeight,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
    });

    function onResize() {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
    }

    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize event
    window.addEventListener('resize', function() {
        onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////

    // create atToolkitContext
    arToolkitContext = new ArToolkitContext({
        cameraParametersUrl: './camera_para.dat',
        detectionMode: 'mono'
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
		onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////

    // build markerControls
    scene.add(markerRoot);
    const markerControls = new ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: "./hiro.patt",
    })

    const geometry = new THREE.BoxGeometry(1, 0.1, 1);
    const material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.05;
	markerRoot.add(mesh);

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

	setModel(0);

	renderer.setAnimationLoop(animate);

}

function setModel(modelId) {
	if (modelId === currentModelId) {
		return
	}
	currentModelId = modelId;
	if (currentModel) {
		markerRoot.remove(currentModel);
	}
	loader.loadAsync(modelList[modelId]).then(
		gltf => {
			currentModel = gltf.scene;
			currentModel.scale.multiplyScalar(0.02);
			//currentModel.position.y += 2;
			//currentModel.rotation.x = Math.PI/2;
			markerRoot.add(currentModel);

			if (gltf.animations.length > 0) {
				animationMixer = new THREE.AnimationMixer(gltf.scene);
				for (const a of gltf.animations) {
					animationMixer.clipAction(a).play();
				}
			}
		}
	);
}


function render() {
    renderer.render(scene, camera);
}


function animate() {
	const delta = clock.getDelta();
	if (animationMixer) {
		animationMixer.update(delta);
	}
	// update artoolkit on every frame
    if (arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
	}
    render();
}