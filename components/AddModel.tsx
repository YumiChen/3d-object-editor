import { useCallback, useRef } from 'react'

import { useModelIdsContext } from '@/contexts/ModelIds';
import { useThreeJSContext } from '@/contexts/ThreeJS';

const modelPathMap: Record<string, string> = {
    'SOFA': 'sofa_chair/scene.gltf'
};

const AddModel = () => {
    const { loader, scene } = useThreeJSContext();
    const { addModelId } = useModelIdsContext();
    const counter = useRef<Record<string, number>>({
        'SOFA': 0
    });
    const addModel = useCallback((modelName: string)=>{        
        loader?.load(modelPathMap[modelName], function ( gltf ) {
            gltf.scene.position.set(0, 0.5, 0);
            scene?.add( gltf.scene );
            
            addModelId(`${modelName}_${counter.current[modelName]}`, gltf.scene.uuid);
            counter.current[modelName]++;
        }, undefined, function ( error ) {
            console.error( error );
        } );
    }, [addModelId, loader, scene]);

  return (<>
        <span>Add Model</span>
        <ul>
            <li>
                <button className='border-2 border-white px-2 py-1 rounded-lg my-1' onClick={addModel.bind(null, 'SOFA')}>Sofa</button>
            </li>
        </ul>
    </>);
}

export default AddModel;