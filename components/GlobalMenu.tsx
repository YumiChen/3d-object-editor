import { useModelIdsContext } from '@/contexts/ModelIds';
import { useThreeJSContext } from '@/contexts/ThreeJS';
import { useCallback } from 'react'
import { AxesHelper } from 'three';
import AddModel from './AddModel';

export default function GlobalMenu() {
    const { scene } = useThreeJSContext();
    const { modelIds, addModelId, removeModelId } = useModelIdsContext();

    const toggleAxesHelper = useCallback((event) => {
        const prevAxesHelper = scene?.getObjectByProperty('uuid', modelIds['axesHelper']);
        if(event?.target.checked){
            const axesHelper = new AxesHelper( 5 );
            addModelId('axesHelper', axesHelper.uuid);
            scene?.add(axesHelper);
        }else if(prevAxesHelper){
            scene?.remove(prevAxesHelper);
            removeModelId('axesHelper');
        }
      }, [scene, modelIds]);

  return (<div className='py-1 px-2 bg-neutral-50/20'>
        <ul className='list-disc list-inside'>
            <li>Long-press mouse wheel key to rotate camers</li>
            <li>Use mouse wheel to zoom in/ out</li>
            <li>Drag items to change position</li>
        </ul>
        <div className='flex align-middle'>
            <label htmlFor="axesHelper" className='mr-1'>Toggle Axes Helper</label>
            <input id="axesHelper" name="axesHelper" type="checkbox" onChange={toggleAxesHelper}></input>
        </div>
        <AddModel />
    </div>);
}
