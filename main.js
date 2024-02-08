/*
  Adapted from: https://threejs.org/examples/?q=light#webgl_lights_hemisphere

  Alternate sky shader: https://threejs.org/examples/?q=shader#webgl_shaders_sky 

  To get started:
  - only the first time on the command line run:
      npm install 
  - open up two terminals. One will run our websockets in app.js, in the first terminal do:
      npm run start
  - Every time you develop / test, it will use the websockets running by the app.js:
      npm run dev
  - To build your static site:
      npm run build
  - The finished site will be run out of the dist folder with:
      npm run start

*/

//import three.js
import * as THREE from 'three';
//add Orbit controls
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { skyMat } from './skyMaterial.js';

let scene, camera, renderer, controls;
let geometry, material, cube;

let dirLight;

// Create connection to Node.JS Server
const socket = io();

//initialize then call animation loop
init();
animate();

function init() {
  //Create our scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color().set( 255, 0, 0 );//set scene background color
  scene.fog = new THREE.Fog( scene.background, 1, 5000 );//create fog

  //Create a camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );
  camera.position.set(5,5,5);

  //Create our renderer
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // camera user interaction controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;//hard coded, how far can zoom in
  controls.maxDistance = 100;//hard coded, how far can zoom out
  controls.target = new THREE.Vector3(0, 2, 0);//hard coded, just above ground level
  controls.maxPolarAngle = Math.PI / 2;
  controls.update();

  //We will add lights

  //directional light
  dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( - 1, 1.75, 1 );//angle the light
  dirLight.position.multiplyScalar( 20 );// move it back... or do it in one line
  
  //Cast shadows from directional light
  //https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow
  dirLight.castShadow = true;
  //higher resolution shadows
  dirLight.shadow.mapSize.width = 1024;//power of 2
  dirLight.shadow.mapSize.height = 1024;
  //add to scene
  scene.add( dirLight );

  //see where your directional light is
  const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
  scene.add( dirLightHelper );
  //Create a helper for the shadow camera (optional)
  const helper = new THREE.CameraHelper( dirLight.shadow.camera );
  scene.add( helper );

  //Hemisphere light
  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
  // hemiLight.color.set( 44, 44, 180 );//rgb 
  // hemiLight.groundColor.set( 240, 234, 211 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 50, 0 );
  scene.add( hemiLight );

  const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
  scene.add( hemiLightHelper );

  // console.log(skyMat);
  skyMat.uniforms[ 'topColor' ].value.copy( hemiLight.color );
  scene.fog.color.copy(skyMat.uniforms[ 'bottomColor' ].value );

  const skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );

  //skyMat is our shader material imported from skyMaterial.js
  const sky = new THREE.Mesh( skyGeo, skyMat );
  scene.add( sky );


  //Add the ground
  const groundMat = new THREE.MeshLambertMaterial( { color: 0xffffff } );
  groundMat.color.setHSL( 0.095, 1, 0.75 );
  const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
  const groundMesh = new THREE.Mesh(groundGeometry, groundMat);
  groundMesh.rotateX(-Math.PI / 2);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);//add to three.js scene



  //Our first Cube
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

  //once you have lights you can use this material
  const diffuseColor = new THREE.Color("rgb(255, 0, 255)");
  material = new THREE.MeshPhysicalMaterial( {
    color: diffuseColor,
    metalness: 0.8,
    roughness: 0.5,
    reflectivity: 0.5
  } );
  
  cube = new THREE.Mesh( geometry, material );
  cube.position.y = 3;
  cube.castShadow = true;
  scene.add( cube );

  cube.name = "My Cube";
  console.log(scene,scene.getObjectByName("My Cube"));

  //add event listener, when window is resized call onWindowResize callback
  window.addEventListener('resize', onWindowResize );
  window.addEventListener('keydown', onKeyDown ); 
}

function animate() {
	requestAnimationFrame( animate );//manually call request next animation frame

  //update / animate objects
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

  //render the scene
	renderer.render( scene, camera );
}

function onKeyDown(event) {

  // console.log(event.key);//https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  if (event.key === "h") {
    emitData();
  }

}

function onWindowResize() {
  
  //Make our application full screen
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

}

function emitData(){
  socket.emit("message", {
   hello: "Hello World"
 });
}


function onMessageEvent(data){
  //log out the message
  console.log(data.hello);
}


//Events we are listening for
// Connect to Node.JS Server
socket.on("connect", () => {
 console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
 console.log(socket.id);
});

// Callback function to recieve message from Node.JS
socket.on("message", (data) => {
 console.log(data);

 onMessageEvent(data);

});
