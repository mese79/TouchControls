var width, height;
var viewAngle = 45,
	near = 1,
	far = 10000;
var aspect;

var renderer, camera, scene, controls, stats;
var sceneObject, intersected;


$(function() {

	if (!Detector.webgl) Detector.addGetWebGLMessage();
	
	var container = $("#container3d");
	startScene(container);

});


function startScene(container) {

	width = window.innerWidth - 50;
	height = window.innerHeight - 80;
	aspect = width / height;

	scene = new THREE.Scene();

	// Load models
	var loader = new THREE.ObjectLoader();

	loader.load("model/model.json", function(object) {
		sceneObject = object;
		// console.log(sceneObject);
		sceneObject.scale.set(13, 13, 13);
		sceneObject.position.set(0, 0, 0);
		scene.add(sceneObject);

		var axes = new THREE.AxisHelper(700);
		scene.add(axes);

		addLights();
		addControls();

		animate();
	});

	function addLights() {
		// Lights
		var ambient = new THREE.AmbientLight(0x404040);
		scene.add(ambient);

		var light1 = new THREE.PointLight(0xffffff);
		light1.position.set(0, 2000, 750);
		light1.intensity = 0.45;
		//light1.castShadow = true;
		scene.add(light1);

		var light2 = new THREE.PointLight(0xFFFFFF);
		light2.position.set(5, 100, -200);
		light2.intensity = 0.4;
		scene.add(light2);
	}

	function addControls() {
		// Camera
		camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
		// Controls
		var options = {
			speedFactor: 0.5,
			delta: 1,
			rotationFactor: 0.002,
			maxPitch: 55,
			hitTest: true,
			hitTestDistance: 40
		};
		controls = new TouchControls(container.parent(), camera, options);
		controls.setPosition(0, 35, 400);
		controls.addToScene(scene);
		// controls.setRotation(0.15, -0.15);
	}

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	container.append(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '10px';
	stats.domElement.style.top = '10px';
	$('body').append(stats.domElement);

	$(window).on("resize", onWindowResize);
}

function animate() {

	requestAnimationFrame(animate);

	controls.update();
	stats.update();

	// Mouse hit-testing:
	var vector = new THREE.Vector3(controls.mouse.x, controls.mouse.y, 1);
	vector.unproject(camera);

	var raycaster = new THREE.Raycaster( controls.fpsBody.position, vector.sub(controls.fpsBody.position).normalize() );

	var intersects = raycaster.intersectObjects(sceneObject.children);
	if (intersects.length > 0) {
		if (intersected != intersects[0].object) {
			if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
			intersected = intersects[0].object;
			// console.log(intersects);
			intersected.currentHex = intersected.material.emissive.getHex();
			intersected.material.emissive.setHex(0xdd0090);
		}
	} else {
		if (intersected) intersected.material.emissive.setHex(intersected.currentHex);
		intersected = null;
	}

	renderer.render(scene, camera);
}

function onWindowResize() {

	width = window.innerWidth - 50;
	height = window.innerHeight - 80;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize(width, height);
}
