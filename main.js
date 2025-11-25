import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import GUI from 'lil-gui';

// シーンの作成
const scene = new THREE.Scene();

// カメラの作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

// レンダラーの作成
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const screenElement = document.querySelector('.tv-screen');
if (screenElement) {
  screenElement.appendChild(renderer.domElement);
} else {
  document.body.appendChild(renderer.domElement);
}

// コントロールの追加
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableRotate = false; // ドラッグ回転を無効化
controls.enablePan = false; // パン操作を無効化
controls.enableZoom = false; // ズーム操作を無効化

// ライトの追加
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// パーティクルの作成
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);
const colorArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i += 3) {
  // ランダムな位置
  posArray[i] = (Math.random() - 0.5) * 10;
  posArray[i + 1] = (Math.random() - 0.5) * 10;
  posArray[i + 2] = (Math.random() - 0.5) * 10;
  
  // グラデーションカラー
  const hue = Math.random();
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  colorArray[i] = color.r;
  colorArray[i + 1] = color.g;
  colorArray[i + 2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// モデルの読み込み
let model;
const loader = new GLTFLoader();
loader.load(
  '/usagi.glb',
  (gltf) => {
    model = gltf.scene;
    model.scale.set(10, 10, 10);
    model.position.y = -1;
    
    // モデルにマテリアルの調整
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = 1.5;
        child.material.metalness = 0.3;
        child.material.roughness = 0.4;
      }
    });
    
    scene.add(model);
    console.log('Model loaded successfully');
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (error) => {
    console.error('An error happened', error);
  }
);

// ポストプロセッシングの設定
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// ウィンドウリサイズ対応
window.addEventListener("resize", () => {
  const screenElement = document.querySelector('.tv-screen');
  const width = screenElement ? screenElement.clientWidth : window.innerWidth;
  const height = screenElement ? screenElement.clientHeight : window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
});

// 初期化時にもサイズ合わせを実行
{
  const screenElement = document.querySelector('.tv-screen');
  if (screenElement) {
    const width = screenElement.clientWidth;
    const height = screenElement.clientHeight;
    renderer.setSize(width, height);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

// マウス追従
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// GUIコントローラーの設定
const gui = new GUI();
gui.title('コントローラー');

// パラメータオブジェクト
const params = {
  modelRotationSpeed: 0.2,
  modelBounceSpeed: 0.5,
  modelBounceAmount: 0.1,
  particleRotationSpeed: 0.05,
  bloomStrength: 1.5,
  bloomRadius: 0.4,
  bloomThreshold: 0.85,
  autoRotate: true,
  autoRotateSpeed: 0.5,
  resetCamera: () => {
    camera.position.set(0, 1, 3);
    controls.target.set(0, 0, 0);
  },
  resetModel: () => {
    if (model) {
      model.rotation.set(0, 0, 0);
      model.position.set(0, -1, 0);
      model.scale.set(10, 10, 10);
    }
  }
};

// モデルコントロール
const modelFolder = gui.addFolder('モデル');
modelFolder.add(params, 'modelRotationSpeed', 0, 1, 0.01).name('回転速度');
modelFolder.add(params, 'modelBounceSpeed', 0, 2, 0.1).name('浮遊速度');
modelFolder.add(params, 'modelBounceAmount', 0, 0.5, 0.01).name('浮遊幅');
modelFolder.add(params, 'resetModel').name('モデルをリセット');
modelFolder.open();

// パーティクルコントロール
const particleFolder = gui.addFolder('パーティクル');
particleFolder.add(params, 'particleRotationSpeed', 0, 0.2, 0.01).name('回転速度');
particleFolder.open();

// エフェクトコントロール
const effectsFolder = gui.addFolder('エフェクト');
effectsFolder.add(params, 'bloomStrength', 0, 3, 0.1).name('Bloom強度').onChange((value) => {
  bloomPass.strength = value;
});
effectsFolder.add(params, 'bloomRadius', 0, 1, 0.01).name('Bloom半径').onChange((value) => {
  bloomPass.radius = value;
});
effectsFolder.add(params, 'bloomThreshold', 0, 1, 0.01).name('Bloomしきい値').onChange((value) => {
  bloomPass.threshold = value;
});
effectsFolder.open();

// カメラコントロール
const cameraFolder = gui.addFolder('カメラ');
cameraFolder.add(params, 'autoRotate').name('自動回転').onChange((value) => {
  controls.autoRotate = value;
});
cameraFolder.add(params, 'autoRotateSpeed', 0, 2, 0.1).name('回転速度').onChange((value) => {
  controls.autoRotateSpeed = value;
});
cameraFolder.add(params, 'resetCamera').name('カメラをリセット');
cameraFolder.open();

// アニメーションループ
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // パーティクルのアニメーション（パラメータ使用）
  particlesMesh.rotation.y = elapsedTime * params.particleRotationSpeed;
  particlesMesh.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
  
  // モデルのアニメーション（パラメータ使用）
  if (model) {
    model.position.y = -1 + Math.sin(elapsedTime * params.modelBounceSpeed) * params.modelBounceAmount;
    model.rotation.y = elapsedTime * params.modelRotationSpeed;
  }
  
  // カメラのマウス追従
  camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
  camera.position.y += (mouse.y * 0.5 + 1 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  
  controls.update();
  composer.render();
}

animate();
