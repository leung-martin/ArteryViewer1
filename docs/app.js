'use strict';

//write to console version 0.1
console.log('Version 0.0.7');

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2a2a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 5);
camera.rotation.set(0, 0, 0);

// Store initial camera position for reset
const initialCameraPosition = camera.position.clone();
const initialCameraRotation = camera.rotation.clone();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cylinder properties (initial values)
let arteryRadius = 0.04;
let arteryHeight = 4;
const arterySegments = 32;
let arteryZ = -0.8;

// Materials
const aArteryMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000, flatShading: true }); // Dark red
const bArteryMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000, flatShading: true }); // Dark red
const cArteryMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000, flatShading: true }); // Dark red
const highlightMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: true }); // Highlight material

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedArtery = null;
let originalMaterial = null;

// Create 3 long cylinders (arteries) manually
let aArtery, bArtery, cArtery;
const horizontalSpacing = 2.2;

function createArteries() {
    // Store current selection before recreating arteries
    let currentSelection = null;
    if (selectedArtery === aArtery) currentSelection = 'A';
    else if (selectedArtery === bArtery) currentSelection = 'B';
    else if (selectedArtery === cArtery) currentSelection = 'C';
    
    // Remove old arteries if they exist
    if (aArtery) {
        if (Array.isArray(aArtery)) {
            aArtery.forEach(mesh => scene.remove(mesh));
        } else {
            scene.remove(aArtery);
        }
    }
    if (bArtery) scene.remove(bArtery);
    if (cArtery) scene.remove(cArtery);
    
    // Reset selection temporarily when recreating arteries
    selectedArtery = null;
    originalMaterial = null;

    // A Arteries: two parallel vertical veins shaped like brackets ) (

    const aArteryFullPath2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.6, 6.5, arteryZ + 0.5),
        new THREE.Vector3(-0.3, 6, arteryZ + 0.6),
        new THREE.Vector3(-0.3, 5.5, arteryZ + 0.7),
        new THREE.Vector3(-0.3, 5, arteryZ + 0.8),
        new THREE.Vector3(-0.6, 4.5, arteryZ + 0.9)
    ]);

    const aArteryFullPath1 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.6, 6.5, arteryZ + 0.5),
        new THREE.Vector3(0.3, 6, arteryZ + 0.6),
        new THREE.Vector3(0.3, 5.5, arteryZ + 0.7),
        new THREE.Vector3(0.3, 5, arteryZ + 0.8),
        new THREE.Vector3(0.6, 4.5, arteryZ + 0.9)
    ]);

    // C Artery: horizontal vein with M shape, offset in y
    const cArteryFullPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 4, arteryZ),
        new THREE.Vector3(-0.5, 4.1, arteryZ + 1.8),
        new THREE.Vector3(0, 4, arteryZ + 2),
        new THREE.Vector3(0.5, 4.1, arteryZ + 1.8),
        new THREE.Vector3(1, 4, arteryZ)
    ]);

    // B Artery: horizontal vein with M shape
    const bArteryFullPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 2.5, arteryZ - 0.2),
        new THREE.Vector3(-1, 2.6, arteryZ + 0.1),
        new THREE.Vector3(0, 2.5, arteryZ + 0.4),
        new THREE.Vector3(1, 2.6, arteryZ + 0.1),
        new THREE.Vector3(2, 2.5, arteryZ - 0.2)
    ]);


    // Use arteryHeight to determine how much of the curve to use (min 2 points)
    function getPartialCurve(curve, height) {
        const totalPoints = 64;
        const percent = Math.max(0.1, Math.min(height / 6, 1)); // 6 is default max height
        
        // Sample points along the full curve
        const points = curve.getPoints(totalPoints);
        
        // Calculate how many points to use based on height
        const numPoints = Math.max(2, Math.floor(points.length * percent));
        
        // Calculate start and end indices to grow from center outward
        const centerIndex = Math.floor(points.length / 2);
        const halfRange = Math.floor(numPoints / 2);
        
        const startIndex = Math.max(0, centerIndex - halfRange);
        const endIndex = Math.min(points.length - 1, centerIndex + halfRange);
        
        // Take points from center outward
        const partialPoints = points.slice(startIndex, endIndex + 1);
        
        return new THREE.CatmullRomCurve3(partialPoints);
    }

    const aArteryPath1 = getPartialCurve(aArteryFullPath1, arteryHeight);
    const aArteryPath2 = getPartialCurve(aArteryFullPath2, arteryHeight);
    const bArteryPath = getPartialCurve(bArteryFullPath, arteryHeight);
    const cArteryPath = getPartialCurve(cArteryFullPath, arteryHeight);

    // TubeGeometry for veins
    const veinSegments = 64;
    const aArteryMesh1 = new THREE.Mesh(
        new THREE.TubeGeometry(aArteryPath1, veinSegments, arteryRadius, arterySegments, false),
        aArteryMaterial
    );
    const aArteryMesh2 = new THREE.Mesh(
        new THREE.TubeGeometry(aArteryPath2, veinSegments, arteryRadius, arterySegments, false),
        aArteryMaterial
    );
    aArtery = [aArteryMesh1, aArteryMesh2];
    scene.add(aArteryMesh1);
    scene.add(aArteryMesh2);

    bArtery = new THREE.Mesh(
        new THREE.TubeGeometry(bArteryPath, veinSegments, arteryRadius, arterySegments, false),
        bArteryMaterial
    );
    scene.add(bArtery);

    cArtery = new THREE.Mesh(
        new THREE.TubeGeometry(cArteryPath, veinSegments, arteryRadius, arterySegments, false),
        cArteryMaterial
    );
    scene.add(cArtery);
    
    // Restore selection after recreating arteries
    if (currentSelection) {
        const selectedArteryDisplay = document.getElementById('selectedArtery');
        
        if (currentSelection === 'A') {
            selectedArtery = aArtery;
            originalMaterial = aArtery.map(mesh => mesh.material);
            aArtery.forEach(mesh => {
                mesh.material = highlightMaterial;
            });
            selectedArteryDisplay.textContent = 'Selected: A Arteries';
            selectedArteryDisplay.style.display = 'block';
            document.getElementById('sliders').style.display = 'block';
        } else if (currentSelection === 'B') {
            selectedArtery = bArtery;
            originalMaterial = bArtery.material;
            bArtery.material = highlightMaterial;
            selectedArteryDisplay.textContent = 'Selected: B Artery';
            selectedArteryDisplay.style.display = 'block';
            document.getElementById('sliders').style.display = 'block';
        } else if (currentSelection === 'C') {
            selectedArtery = cArtery;
            originalMaterial = cArtery.material;
            cArtery.material = highlightMaterial;
            selectedArteryDisplay.textContent = 'Selected: C Artery';
            selectedArteryDisplay.style.display = 'block';
            document.getElementById('sliders').style.display = 'block';
        }
    }
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

// Hamburger menu functionality
document.getElementById('menuButton').addEventListener('click', function() {
    const menuItems = document.getElementById('menuItems');
    menuItems.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('hamburgerMenu');
    const menuItems = document.getElementById('menuItems');
    
    if (!menu.contains(event.target)) {
        menuItems.classList.remove('show');
    }
});

// Menu item event listeners
document.getElementById('resetViewButton').addEventListener('click', function() {
    resetView();
    document.getElementById('menuItems').classList.remove('show'); // Close menu after action
});

document.getElementById('aboutButton').addEventListener('click', function() {
    document.getElementById('aboutModal').style.display = 'block';
    document.getElementById('menuItems').classList.remove('show'); // Close menu after action
});

// About modal functionality
document.getElementById('closeAbout').addEventListener('click', function() {
    document.getElementById('aboutModal').style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('aboutModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Mouse interaction for artery selection
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    // Only process clicks if not clicking on UI elements
    if (event.target.tagName === 'CANVAS') {
        // Update mouse position
        onMouseMove(event);
        
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Get all artery meshes
        const arteryMeshes = [];
        if (aArtery && Array.isArray(aArtery)) {
            arteryMeshes.push(...aArtery);
        }
        if (bArtery) arteryMeshes.push(bArtery);
        if (cArtery) arteryMeshes.push(cArtery);
        
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(arteryMeshes);
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const selectedArteryDisplay = document.getElementById('selectedArtery');
            
            // Only reset if we're selecting a different artery
            let newSelection = null;
            
            // Check if clicked mesh is one of the A arteries
            if (aArtery && aArtery.includes(clickedMesh)) {
                newSelection = 'A';
            } else if (clickedMesh === bArtery) {
                newSelection = 'B';
            } else if (clickedMesh === cArtery) {
                newSelection = 'C';
            }
            
            // Only change selection if it's different from current
            let currentSelection = null;
            if (selectedArtery === aArtery) currentSelection = 'A';
            else if (selectedArtery === bArtery) currentSelection = 'B';
            else if (selectedArtery === cArtery) currentSelection = 'C';
            
            if (newSelection !== currentSelection) {
                // Reset previously selected artery
                if (selectedArtery) {
                    if (Array.isArray(selectedArtery)) {
                        // Reset both A arteries
                        selectedArtery.forEach((mesh, index) => {
                            if (originalMaterial && originalMaterial[index]) {
                                mesh.material = originalMaterial[index];
                            }
                        });
                    } else {
                        // Reset single artery
                        if (originalMaterial) {
                            selectedArtery.material = originalMaterial;
                        }
                    }
                }
                
                // Set new selection
                if (newSelection === 'A') {
                    // Select both A arteries
                    selectedArtery = aArtery;
                    originalMaterial = aArtery.map(mesh => mesh.material);
                    aArtery.forEach(mesh => {
                        mesh.material = highlightMaterial;
                    });
                    console.log('Selected: A Arteries');
                    selectedArteryDisplay.textContent = 'Selected: A Arteries';
                    selectedArteryDisplay.style.display = 'block';
                    // Show sliders menu
                    document.getElementById('sliders').style.display = 'block';
                } else if (newSelection === 'B') {
                    // Select B artery
                    selectedArtery = bArtery;
                    originalMaterial = bArtery.material;
                    bArtery.material = highlightMaterial;
                    console.log('Selected: B Artery');
                    selectedArteryDisplay.textContent = 'Selected: B Artery';
                    selectedArteryDisplay.style.display = 'block';
                    // Show sliders menu
                    document.getElementById('sliders').style.display = 'block';
                } else if (newSelection === 'C') {
                    // Select C artery
                    selectedArtery = cArtery;
                    originalMaterial = cArtery.material;
                    cArtery.material = highlightMaterial;
                    console.log('Selected: C Artery');
                    selectedArteryDisplay.textContent = 'Selected: C Artery';
                    selectedArteryDisplay.style.display = 'block';
                    // Show sliders menu
                    document.getElementById('sliders').style.display = 'block';
                }
            }
        }
        // Note: Removed the else clause that was deselecting on empty clicks
    }
}

// Add event listeners for mouse interaction
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);


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
                opacity: 0.3,    // translucent
                side: THREE.FrontSide,


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