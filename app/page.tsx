"use client";

import ThreeJSWrapper from '@/components/ThreeJSWrapper';
import { ModelIdsProvider } from '@/contexts/ModelIds';
import { ThreeJSProvider } from '@/contexts/ThreeJS';
import ModelMenu from '@/components/ModelMenu';
import GlobalMenu from '@/components/GlobalMenu';

export default function Home() {

  return (
    <ModelIdsProvider>
      <ThreeJSProvider>
        <ThreeJSWrapper>
          <div id='editArea' className='fixed top-0 left-0 flex flex-col'>
            <GlobalMenu/>
            <ModelMenu/>
          </div>
        </ThreeJSWrapper>
      </ThreeJSProvider>
    </ModelIdsProvider>
  )
}
