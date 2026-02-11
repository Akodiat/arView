import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MindARThree} from '../lib/mind-ar/mindar-image-three.prod.js';
import QrScanner from '../lib/qr-scanner.min.js';

const modelList = [
    "../resources/flamingo.glb",
    "../resources/horse.glb"
];


// Create Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create MindAR instance (requires canvas, scene, and camera)
const mindarThree = new MindARThree({
    container: document.body,
    canvas: renderer.domElement,
    scene: scene,
    camera: camera,
    imageTargetSrc: "./data/target.mind",
    //resolution: '720p'  // Optional: Set camera resolution
});

const anchor = mindarThree.addAnchor(0);
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshStandardMaterial({
    color: 0x00ffff, transparent: true, opacity: 0.5
});
const plane = new THREE.Mesh(geometry, material);
anchor.group.add(plane);

let currentModelId, currentModel;
let animationMixer;

const loader = new GLTFLoader();
function setModel(modelId) {
    if (modelId === currentModelId) {
        return
    }
    currentModelId = modelId;
    if (currentModel) {
        anchor.group.remove(currentModel);
    }
    loader.loadAsync(modelList[modelId]).then(
        gltf => {
            currentModel = gltf.scene;
            currentModel.scale.multiplyScalar(0.01);
            currentModel.position.z += 1;
            currentModel.rotation.x = Math.PI/2;
            anchor.group.add(currentModel);

            if (gltf.animations.length > 0) {
                animationMixer = new THREE.AnimationMixer(gltf.scene);
                for (const a of gltf.animations) {
                    animationMixer.clipAction(a).play();
                }
            }
        }
    );
}


const clock = new THREE.Clock();

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

const start = async() => {
    await mindarThree.start();

    // Swap models based on qr code param value
    const qrScanner = new QrScanner(
        document.getElementById("qrvid"),
        result => {
            const url = new URL(result.data)
            const i = parseInt(url.searchParams.get("i"));
            console.log(i);
            setModel(i);
        },
        {returnDetailedScanResult: true},
    );
    qrScanner.start();

    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        if (animationMixer) {
            animationMixer.update(delta);
        }
        renderer.render(scene, camera);
    });
}

start();