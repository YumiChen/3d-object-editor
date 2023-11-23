"use client";

import { BoxHelper, Color, MeshStandardMaterial, Raycaster, Scene, Vector2 } from 'three';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { updateBlackList, useThreeJSContext } from '@/contexts/ThreeJS';

import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { canvasId } from '@/constants/elementIds';
import debounce from '@/utils/debounce';
import { useModelIdsContext } from '@/contexts/ModelIds';

export default function ModelMenu() {
    const box = useRef<BoxHelper|null>(null);
    const dragControls = useRef<DragControls|null>(null);
    const { scene, camera, renderer } = useThreeJSContext();
    const { modelIds } = useModelIdsContext();

    const [clickedModel, setClickedModel] = useState<GLTF|null>(null);
    const colorInputRef = useRef(null);

    const selectModel = useCallback((newClickedModel) => {
      if(!newClickedModel || !scene || !camera || !renderer) {
        return;
      }
  
      if(box.current){
        scene.remove(box.current);
        box.current = null;
      }
  
      if(dragControls.current){
        dragControls.current.dispose();
      }
      dragControls.current = new DragControls([newClickedModel], camera, renderer.domElement);
  
      // Event listeners
      dragControls.current?.addEventListener('dragstart', function (event) {
        // Disable rotation during drag
        event.object.rotation.y = 0;
        dragControls.current.enabled = true;
      });
  
      dragControls.current?.addEventListener('dragend', function () {
        dragControls.current.enabled = false;
      });
  
      setClickedModel(newClickedModel);
      box.current = new BoxHelper( newClickedModel, 0xffff00 );          
      scene.add(box.current);
    }, [scene, camera, renderer, setClickedModel]);
    const prevOnDocumentClick = useRef<(event: MouseEvent) => void>(()=>{});
    const onDocumentClick = useCallback((event: MouseEvent) => {
      if(event.target?.id !== canvasId){
        return;
      }
      // Calculate mouse coordinates in normalized device coordinates (NDC)
      var mouse = new Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
      // Raycasting
      var raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
  
      // Check for intersections
      var intersects = raycaster.intersectObjects(scene.children, true);
      var newClickedModel = intersects.find(obj=>(obj.object.isMesh))?.object;
  
      if (newClickedModel && !updateBlackList.find((name)=>(modelIds[name] === newClickedModel?.uuid))) {
        // Handle the click on the object (you can replace this with your logic)
        console.log('Clicked on', newClickedModel);
  
        console.log(box.current && clickedModel
          && newClickedModel?.uuid !== clickedModel.uuid);
  
        if (newClickedModel) {
          selectModel(newClickedModel);
          colorInputRef.current.value = `#${newClickedModel?.material?.color.getHexString()}`;
        }
      }else if(box.current){
        scene.remove(box.current);
        box.current = null;

        setClickedModel(null);
      }else {
        setClickedModel(null);
      }
    }, [camera, scene, modelIds, clickedModel, selectModel]);
    useEffect(()=>{
      document.removeEventListener('click', prevOnDocumentClick.current);
      prevOnDocumentClick.current = onDocumentClick;
      document.addEventListener('click', onDocumentClick, false);
    }, [onDocumentClick]);
  
    const changeColor = useCallback((event: ChangeEvent)=>{
      if(!clickedModel || !event.target){
        return;
      }
      const newColor = new Color(event.target.value);
      const newMaterial = new MeshStandardMaterial({
        color: newColor,
        roughness: clickedModel.material.roughness,
        metalness: clickedModel.material.metalness,
      });
      clickedModel.material = newMaterial;
    }, [clickedModel]);
  
    const removeModel = useCallback(()=>{
        if(!clickedModel) {
            return;
        }
        if(clickedModel.parent){
          clickedModel.parent.remove(clickedModel);
        }
        else scene.remove(clickedModel);
  
        if(box.current){
          scene.remove(box.current);
          box.current = null;
        }
        setClickedModel(null);
    }, [scene, clickedModel, setClickedModel]);
  
    const scaleModel = useCallback((event)=>{
      clickedModel?.scale?.set(event.target.value, event.target.value, event.target.value);
    }, [clickedModel]);
  

  return (
    <div className={`py-1 px-2 flex flex-col bg-neutral-50/20 ${clickedModel? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className='mr-1'>
          <label className='mr-1'>Change Color</label>
          <input type="color" ref={colorInputRef} onChange={debounce(changeColor, 500)}></input>
        </div>
        <div className='mr-1'>
          <label htmlFor="scale"  className='mr-1'>Scale</label>
          <input type="range" id="scale" name="scale" min="0.25" max="5" defaultValue="1" step="0.25" onChange={scaleModel} />
        </div>
        {/* <button className='border-2 border-white' onClick={selectModel.bind(null, clickedModel.parent)}>Select Parent</button> */}
        <button className='border-2 border-white px-2 py-1 rounded-lg my-1' onClick={removeModel}>Remove</button>
      </div>
    );
}
