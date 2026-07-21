// Scene, camera, renderer, skybox setup.
import * as THREE from "three";

export function createScene() {
  const scene = new THREE.Scene();

  // Simple sky-colored background as a skybox placeholder.
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 30, 120);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.7, 5); // eye height ~1.7

  const canvas = document.getElementById("game-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444422, 0.9);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.position.set(20, 30, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -40;
  sunLight.shadow.camera.right = 40;
  sunLight.shadow.camera.top = 40;
  sunLight.shadow.camera.bottom = -40;
  scene.add(sunLight);

  // Ground plane placeholder
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7c3a });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // A few placeholder cubes so the world isn't empty/featureless
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xc2a15b });
  for (let i = 0; i < 8; i++) {
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(
      (Math.random() - 0.5) * 40,
      0.5,
      (Math.random() - 0.5) * 40
    );
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}
