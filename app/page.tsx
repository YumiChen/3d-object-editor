"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import AddModel from '../components/AddModel';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';

const ids = {};
const updateBlackList = ['floor'];

const canvasId = 'canvas';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default function Home() {
  const inited = useRef(false);
  const scene = useRef(new THREE.Scene());
  const camera = useRef(new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ));
  const controls = new PointerLockControls(camera.current, document.body);
  const renderer = useRef(new THREE.WebGLRenderer());
  const loader = useRef(new GLTFLoader());
  const box = useRef(null);
  const dragControls = useRef(null);

  const [clickedModel, setClickedModel] = useState<GLTF|null>(null);

  const isMouseWheelPressed = useRef(false);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const selectModel = useCallback((clickedObject) => {
    if(!clickedObject) {
      return;
    }

    if(box.current){
      scene.current.remove(box.current);
      box.current = null;
    }

    if(dragControls.current){
      dragControls.current.dispose();
    }
    dragControls.current = new DragControls([clickedObject], camera.current, renderer.current.domElement);

    // Event listeners
    dragControls.current?.addEventListener('dragstart', function (event) {
      // Disable rotation during drag
      event.object.rotation.y = 0;
      controls.enabled = false;
    });

    dragControls.current?.addEventListener('dragend', function () {
      controls.enabled = true;
    });

    setClickedModel(clickedObject);
    box.current = new THREE.BoxHelper( clickedObject, 0xffff00 );          
    scene.current.add(box.current);
  }, []);
  const prevOnDocumentClick = useRef(()=>{});
  const onDocumentClick = useCallback((event: MouseEvent) => {
    if(event.target?.id !== canvasId){
      return;
    }
    // Calculate mouse coordinates in normalized device coordinates (NDC)
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera.current);

    // Check for intersections
    var intersects = raycaster.intersectObjects(scene.current.children, true);
    var clickedObject = intersects.find(obj=>(obj.object.isMesh))?.object;

    if (clickedObject && !updateBlackList.find((name)=>(ids[name] === clickedObject?.uuid))) {
      // Handle the click on the object (you can replace this with your logic)
      console.log('Clicked on', clickedObject);

      console.log(box.current && clickedModel
        && clickedObject?.uuid !== clickedModel.uuid);

      if (clickedObject && clickedObject) {
        selectModel(clickedObject);
      }
    }else if(box.current){
      scene.current.remove(box.current);
      box.current = null;
    }
  }, [clickedModel]);
  useEffect(()=>{
    document.removeEventListener('click', prevOnDocumentClick.current);
    prevOnDocumentClick.current = onDocumentClick;
    document.addEventListener('click', onDocumentClick, false);
  }, [onDocumentClick]);

  useEffect(()=>{
    if(!inited.current) {
      inited.current = true;
    }else{
      return;
    }
    scene.current.background = new THREE.Color(0x5acabd);
    renderer.current.setSize( window?.innerWidth, window?.innerHeight );

    const light = new THREE.AmbientLight( 0xfafafa ); // soft white light
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.current.add( directionalLight );
    scene.current.add( light );

    // camera.current.position.z = 5;
    camera.current.position.set(0, 1, 3); // Adjust the values based on your scene size
    camera.current.lookAt(new THREE.Vector3(0, 1, 0));

    renderer.current.domElement.setAttribute('id', canvasId);
    document.body.appendChild( renderer.current.domElement );

    // Add pointer lock controls
    const controls = new PointerLockControls(camera.current, document.body);
    scene.current.add(controls.getObject());

    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('textures/wood.jpg'); // Update with your image path
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10); // Adjust size as needed
    const floorMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    ids['floor'] = floor.uuid;
    floor.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    scene.current.add(floor);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
  
    function onWindowResize() {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
    }
  function onDocumentMouseDown(event) {
    if (event.button === 1) {
      isMouseWheelPressed.current = true;
    }
  }
  
  function onDocumentMouseUp(event) {
    if (event.button === 1) {
      isMouseWheelPressed.current = false;
    }
  }
  
  function onDocumentMouseMove(event) {
    if (isMouseWheelPressed.current) {
      var deltaX = event.clientX - mouseX.current;
      var deltaY = event.clientY - mouseY.current;
  
      rotateCamera(deltaX, deltaY);
    }
  
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  }
  
  function rotateCamera(deltaX, deltaY) {
    // Adjust rotation speed as needed
    var rotationSpeed = 0.005;
  
    camera.current.rotation.y -= deltaX * rotationSpeed;
    camera.current.rotation.x -= deltaY * rotationSpeed;
  
    // Clamp vertical rotation to avoid flipping
    camera.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.current.rotation.x));
  }

    var onWheel = function (event: WheelEvent) {
      // Adjust the camera position based on the wheel movement
      var zoomSpeed = 0.01;
      camera.current.position.z += event.deltaY * zoomSpeed;
    };
    document.addEventListener('wheel', onWheel, false);
    window.addEventListener('resize', onWindowResize, false);

    function animate() {
      requestAnimationFrame( animate );
      renderer.current.render( scene.current, camera.current );
    }
    animate();
  }, []);

  const changeColor = useCallback((event: ChangeEvent)=>{
    if(!clickedModel || !event.target){
      return;
    }
    clickedModel.material.color = new THREE.Color(event.target.value);
  }, [clickedModel]);

  
  const removeModel = useCallback(()=>{
      if(!clickedModel) {
          return;
      }
      if(clickedModel.parent){
        clickedModel.parent.remove(clickedModel);
      }
      else scene.current.remove(clickedModel);

      if(box.current){
        scene.current.remove(box.current);
        box.current = null;
      }
      setClickedModel(null);
  }, [clickedModel]);

  const scaleModel = useCallback((event)=>{
    clickedModel?.scale?.set(event.target.value, event.target.value, event.target.value);
  }, [clickedModel]);
  const toggleAxesHelper = useCallback((event)=>{
    if(!event?.target.checked){
      scene.current.remove(scene.current.getObjectByProperty('uuid', ids['axesHelper']));
      delete ids['axesHelper'];
    }else{
      const axesHelper = new THREE.AxesHelper( 5 );
      ids['axesHelper'] = axesHelper.uuid;
      scene.current.add(axesHelper);
    }
  }, []);

  return (
    <div id='editArea' className='fixed top-0 left-0 bg-neutral-50/20 flex flex-col'>
      <ul>
        <li>Long-press mouse wheel key to rotate camers</li>
        <li>Use mouse wheel to zoom in/ out</li>
        <li>Drag items to change position</li>
      </ul>
      <div>
        <label htmlFor="axesHelper">Toggle Axes Helper</label>
        <input id="axesHelper" name="axesHelper" type="checkbox" onChange={toggleAxesHelper}></input>
      </div>
      <AddModel scene={scene.current} loader={loader.current}/>
      {clickedModel && <div className='flex flex-col'>
        <div>
          <label>Change Color</label>
          <input type="color" value={`#${clickedModel?.material?.color.getHexString()}`} onChange={changeColor}></input>
        </div>
        <div>
          <label htmlFor="scale">Scale</label>
          <input type="range" id="scale" name="scale" min="0.25" max="5" defaultValue="1" step="0.25" onChange={scaleModel} />
        </div>
        {/* <button className='border-2 border-white' onClick={selectModel.bind(null, clickedModel.parent)}>Select Parent</button> */}
        <button className='border-2 border-white' onClick={removeModel}>Remove</button>
      </div>}
    </div>
  )
}
