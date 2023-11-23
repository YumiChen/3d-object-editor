import { useThreeJSContext } from '@/contexts/ThreeJS';
import { useCallback } from 'react'

const modelPathMap: Record<string, string> = {
    'SOFA': 'sofa_chair/scene.gltf'
};

const AddModel = () => {
    const { loader, scene } = useThreeJSContext();
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
                <button className='border-2 border-white px-2 py-1 rounded-lg my-1' onClick={addModel.bind(null, 'SOFA')}>Sofa</button>
            </li>
        </ul>
    </>);
}

export default AddModel;