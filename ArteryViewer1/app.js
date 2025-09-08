'use strict';

console.log('Hello world');
// Set up scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a2a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 14;

// Store initial camera position for reset
const initialCameraPosition = camera.position.clone();
const initialCameraRotation = camera.rotation.clone();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cylinder properties (initial values)
let arteryRadius = 0.5;
let arteryHeight = 6;
const arterySegments = 32;
let arteryZ = 0;

// Materials
const pinkMaterial = new THREE.MeshPhongMaterial({ color: 0xff69b4, flatShading: true });
const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x2196f3, flatShading: true });
const purpleMaterial = new THREE.MeshPhongMaterial({ color: 0x9c27b0, flatShading: true });

// Create 3 long cylinders (arteries) manually
let arteryPink, arteryBlue, arteryPurple;
const horizontalSpacing = 2.2;

function createArteries() {
    // Remove old arteries if they exist
    if (arteryPink) scene.remove(arteryPink);
    if (arteryBlue) scene.remove(arteryBlue);
    if (arteryPurple) scene.remove(arteryPurple);

    const arteryGeometry = new THREE.CylinderGeometry(arteryRadius, arteryRadius, arteryHeight, arterySegments);

    arteryPink = new THREE.Mesh(arteryGeometry, pinkMaterial);
    arteryPink.position.x = -horizontalSpacing;
    arteryPink.position.y = 0;
    arteryPink.position.z = arteryZ;
    scene.add(arteryPink);

    arteryBlue = new THREE.Mesh(arteryGeometry, blueMaterial);
    arteryBlue.position.x = 0;
    arteryBlue.position.y = 0;
    arteryBlue.position.z = arteryZ;
    scene.add(arteryBlue);

    arteryPurple = new THREE.Mesh(arteryGeometry, purpleMaterial);
    arteryPurple.position.x = horizontalSpacing;
    arteryPurple.position.y = 0;
    arteryPurple.position.z = arteryZ;
    scene.add(arteryPurple);
}

createArteries();

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 20;

// Slider controls
const diameterSlider = document.getElementById('diameterSlider');
const lengthSlider = document.getElementById('lengthSlider');
const zSlider = document.getElementById('zSlider');

diameterSlider.addEventListener('input', function() {
    arteryRadius = parseFloat(this.value);
    createArteries();
});

lengthSlider.addEventListener('input', function() {
    arteryHeight = parseFloat(this.value);
    createArteries();
});

zSlider.addEventListener('input', function() {
    arteryZ = parseFloat(this.value);
    // Only update z position, not geometry
    if (arteryPink) arteryPink.position.z = arteryZ;
    if (arteryBlue) arteryBlue.position.z = arteryZ;
    if (arteryPurple) arteryPurple.position.z = arteryZ;
});

// Reset view function
function resetView() {
    camera.position.copy(initialCameraPosition);
    camera.rotation.copy(initialCameraRotation);
    controls.reset();
}

document.getElementById('resetButton').addEventListener('click', resetView);

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();