import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MindARThree} from 'mindar-image-three';

const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./data/marker.mind"
});

const {renderer, scene, camera} = mindarThree;
renderer.shadowMap.enabled = true;
const anchor = mindarThree.addAnchor(0);
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.MeshStandardMaterial( {color: 0x00ffff, transparent: true, opacity: 0.5} );
const plane = new THREE.Mesh(geometry, material);
anchor.group.add(plane);

const clock = new THREE.Clock();
const animationMixers = [];

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

const loader = new GLTFLoader();
loader.loadAsync("resources/flamingo.glb").then(
    gltf => {
        const model = gltf.scene;
        model.scale.multiplyScalar(0.01);
        model.position.z += 1;
        model.rotation.x = Math.PI/2;
        anchor.group.add(model);

        if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const a of gltf.animations) {
                mixer.clipAction(a).play();
            }
            animationMixers.push(mixer);
        }
    }
);

const start = async() => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        for (const mixer of animationMixers) {
            mixer.update(delta);
        }
        renderer.render(scene, camera);
    });
}

start();