"use client";

import { AmbientLight, Camera, Color, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Renderer, Scene, TextureLoader, Vector3, WebGLRenderer } from 'three';
import React, { ProviderProps, ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { useModelIdsContext } from './ModelIds';

const updateBlackList = ['floor'];

interface ContextType {
    scene: Scene | null;
    camera: PerspectiveCamera | null;
    controls: PointerLockControls | null;
    renderer: Renderer | null;
    loader: GLTFLoader | null;
};
const defaultContextValue = {
    scene: null,
    camera: null,
    controls: null,
    renderer: null,
    loader: null
};
const ThreeJS = createContext<ContextType>(defaultContextValue);

const ThreeJSProvider = ({ children }: { children: ReactNode }) => {
  const inited = useRef(false);
  const [ThreeJSObjects, setThreeJSObjects] = useState<ContextType>(defaultContextValue);
  const { addModelId } = useModelIdsContext();

  useEffect(()=>{
    if(!inited.current) {
        inited.current = true;
    }else{
        return;
    }
    const scene = new Scene();
    const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const controls = new PointerLockControls(camera, document.body);
    const renderer = new WebGLRenderer();
    const loader = new GLTFLoader();

    scene.background = new Color(0x5acabd);
    renderer.setSize( window?.innerWidth, window?.innerHeight );

    const light = new AmbientLight( 0xfafafa ); // soft white light
    const directionalLight = new DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );
    scene.add( light );

    camera.position.set(0, 1, 3); // Adjust the values based on your scene size
    camera.lookAt(new Vector3(0, 1, 0));

    const pointerLockControls = new PointerLockControls(camera, document.body);
    scene.add(pointerLockControls.getObject());

    var textureLoader = new TextureLoader();
    var texture = textureLoader.load('textures/wood.jpg'); // Update with your image path
    const floorGeometry = new PlaneGeometry(1000, 1000, 10, 10); // Adjust size as needed
    const floorMaterial = new MeshBasicMaterial({ map: texture, side: DoubleSide });
    const floor = new Mesh(floorGeometry, floorMaterial);
    addModelId('floor', floor.uuid);
    floor.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    scene.add(floor);

    setThreeJSObjects({
        scene,
        camera,
        controls,
        renderer,
        loader
    });
  }, [addModelId]);

  return (
    <ThreeJS.Provider value={ThreeJSObjects}>
      {children}
    </ThreeJS.Provider>
  );
};

const useThreeJSContext = () => {
  return useContext(ThreeJS);
};

export {
    ThreeJSProvider,
    useThreeJSContext,
    updateBlackList
};