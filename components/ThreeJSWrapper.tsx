"use client";

import { ReactNode, useEffect, useRef } from 'react'

import { canvasId } from '@/constants/elementIds';
import { useThreeJSContext } from '@/contexts/ThreeJS';

export default function ThreeJSWrapper({
    children
}: { children: ReactNode; }) {
    const {
        scene,
        camera,
        renderer,
    } = useThreeJSContext();
    const isMouseWheelPressed = useRef(false);
    const mouseX = useRef(0);
    const mouseY = useRef(0);

    useEffect(() => {
        if (!scene || !camera || !renderer) {
          return;
        }

        function onWindowResize() {
            if(!camera || !renderer){
                return;
            }
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);

        function rotateCamera(deltaX: number, deltaY: number) {
            if(!camera) {
                return;
            }
            // Adjust rotation speed as needed
            const rotationSpeed = 0.005;
        
            camera.rotation.y -= deltaX * rotationSpeed;
            camera.rotation.x -= deltaY * rotationSpeed;
        
            // Clamp vertical rotation to avoid flipping
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        }
        function onDocumentMouseDown(event: MouseEvent) {
            if (event.button === 1) {
                isMouseWheelPressed.current = true;
            }
        }
        function onDocumentMouseUp(event: MouseEvent) {
            if (event.button === 1) {
                isMouseWheelPressed.current = false;
            }
        }
        function onDocumentMouseMove(event: MouseEvent) {
            if (isMouseWheelPressed.current) {
            const deltaX = event.clientX - mouseX.current;
            const deltaY = event.clientY - mouseY.current;
        
            rotateCamera(deltaX, deltaY);
            }
        
            mouseX.current = event.clientX;
            mouseY.current = event.clientY;
        }
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);

        const onWheel = function (event: WheelEvent) {
            // Adjust the camera position based on the wheel movement
            const zoomSpeed = 0.01;
            camera.position.z += event.deltaY * zoomSpeed;
        };
        document.addEventListener('wheel', onWheel, false);

        
        renderer.domElement.setAttribute('id', canvasId);
        document.body.appendChild( renderer.domElement );

        function animate() {
            if(!renderer || !scene || !camera) {
                return;
            }
            requestAnimationFrame( animate );
            renderer.render( scene, camera );
        }
        animate();
    }, [scene, camera, renderer]);

  return (<>
        {children}
    </>);
}
