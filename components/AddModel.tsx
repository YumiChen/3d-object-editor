import { useCallback } from 'react'
import { Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const modelPathMap: Record<string, string> = {
    'SOFA': 'sofa_chair/scene.gltf'
};

export default function AddModel({
  loader,
  scene,
}: {
    loader: GLTFLoader,
    scene: Scene,
}) {
    const addModel = useCallback((modelName: string)=>{        
        loader.load(modelPathMap[modelName], function ( gltf ) {
            gltf.scene.position.set(0, 0.5, 0);
            scene.add( gltf.scene );
        }, undefined, function ( error ) {
            console.error( error );
        } );
    }, [scene]);

  return (<>
        <span>Add Model</span>
        <ul>
            <li>
                <button className='border-2 border-white' onClick={addModel.bind(null, 'SOFA')}>Sofa</button>
            </li>
        </ul>
    </>);
}
