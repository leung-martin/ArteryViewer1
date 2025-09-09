'use strict';

//write to console version 0.1
console.log('Version 0.0.6');

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
let arteryRadius = 0.1;
let arteryHeight = 6;
const arterySegments = 32;
let arteryZ = -1;

// Materials
const pinkMaterial = new THREE.MeshPhongMaterial({ color: 0xff69b4, flatShading: true });
const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x2196f3, flatShading: true });
const purpleMaterial = new THREE.MeshPhongMaterial({ color: 0x9c27b0, flatShading: true });

// Create 3 long cylinders (arteries) manually
let arteryPink, arteryBlue, arteryPurple;
const horizontalSpacing = 2.2;

function createArteries() {
    // Remove old arteries if they exist
    if (arteryPink) {
        if (Array.isArray(arteryPink)) {
            arteryPink.forEach(mesh => scene.remove(mesh));
        } else {
            scene.remove(arteryPink);
        }
    }
    if (arteryBlue) scene.remove(arteryBlue);
    if (arteryPurple) scene.remove(arteryPurple);

    // Pink: two parallel vertical veins shaped like brackets ) (
    const pinkFullPath1 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.1, 6, arteryZ),
        new THREE.Vector3(0.4, 5, arteryZ),
        new THREE.Vector3(0.4, 4, arteryZ),
        new THREE.Vector3(0.4, 3, arteryZ),
        new THREE.Vector3(1.1, 2, arteryZ)
    ]);
    const pinkFullPath2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.0, 6, arteryZ),
        new THREE.Vector3(-0.3, 5, arteryZ),
        new THREE.Vector3(-0.3, 4, arteryZ),
        new THREE.Vector3(-0.3, 3, arteryZ),
        new THREE.Vector3(-1.0, 2, arteryZ)
    ]);

    // Blue: horizontal vein with M shape
    const blueFullPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 2.5, arteryZ),
        new THREE.Vector3(-1, 2, arteryZ + 0.2),
        new THREE.Vector3(0, 2.5, arteryZ + 0.1),
        new THREE.Vector3(1, 2, arteryZ + 0.2),
        new THREE.Vector3(2, 2.5, arteryZ)
    ]);
    // Purple: horizontal vein with M shape, offset in y
    const purpleFullPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 3.5, arteryZ),
        new THREE.Vector3(-1, 3, arteryZ + 0.2),
        new THREE.Vector3(0,  3.5, arteryZ + 0.1),
        new THREE.Vector3(1,  3, arteryZ + 0.2),
        new THREE.Vector3(2,  3.5, arteryZ)
    ]);

    // Use arteryHeight to determine how much of the curve to use (min 2 points)
    function getPartialCurve(curve, height) {
        const totalPoints = 64;
        const percent = Math.max(0.1, Math.min(height / 6, 1)); // 6 is default max height
        
        // Sample points along the full curve
        const points = curve.getPoints(totalPoints);
        
        // Take only the portion we want based on height
        const numPoints = Math.max(2, Math.floor(points.length * percent));
        const partialPoints = points.slice(0, numPoints);
        
        return new THREE.CatmullRomCurve3(partialPoints);
    }

    const pinkPath1 = getPartialCurve(pinkFullPath1, arteryHeight);
    const pinkPath2 = getPartialCurve(pinkFullPath2, arteryHeight);
    const bluePath = getPartialCurve(blueFullPath, arteryHeight);
    const purplePath = getPartialCurve(purpleFullPath, arteryHeight);

    // TubeGeometry for veins
    const veinSegments = 64;
    const pinkMesh1 = new THREE.Mesh(
        new THREE.TubeGeometry(pinkPath1, veinSegments, arteryRadius, arterySegments, false),
        pinkMaterial
    );
    const pinkMesh2 = new THREE.Mesh(
        new THREE.TubeGeometry(pinkPath2, veinSegments, arteryRadius, arterySegments, false),
        pinkMaterial
    );
    arteryPink = [pinkMesh1, pinkMesh2];
    scene.add(pinkMesh1);
    scene.add(pinkMesh2);

    arteryBlue = new THREE.Mesh(
        new THREE.TubeGeometry(bluePath, veinSegments, arteryRadius, arterySegments, false),
        blueMaterial
    );
    scene.add(arteryBlue);

    arteryPurple = new THREE.Mesh(
        new THREE.TubeGeometry(purplePath, veinSegments, arteryRadius, arterySegments, false),
        purpleMaterial
    );
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
    createArteries();
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

// FBX Loader
const fbxLoader = new THREE.FBXLoader();
fbxLoader.load('narizBoca.fbx', function (object) {
    object.position.set(0, 0, -5); // Adjust position as needed
    object.scale.set(5.0, 5.0, 5.0); // Adjust scale as needed

    object.traverse(function (child) {
        console.log('Traversing child:', child.type, child.name || '(no name)', child);
        if (child.isMesh) {
            console.log('Found mesh:', child.name || '(no name)', '— setting material to light grey, translucent, double-sided');
            child.material = new THREE.MeshPhongMaterial({
                color: 0xcccccc, // light grey
                transparent: true,
                opacity: 0.5,    // translucent
                side: THREE.DoubleSide,
                depthWrite: false
            });
        } else {
            console.log('Not a mesh:', child.type, child.name || '(no name)');
        }
    });
    scene.add(object);
}, undefined, function (error) {
    console.error('Error loading FBX:', error);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();