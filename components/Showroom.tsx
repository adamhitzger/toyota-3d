"use client"

import { Canvas } from "@react-three/fiber"
import { createXRStore, XR } from "@react-three/xr";
import { Suspense, useRef, useState } from "react"
import { ActionName, Model } from "./Model"
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei"

const COLORS: Array<string> = ["#c8102e", "#ffffff", "#111111", "#1e3a8a", "#9ca3af"]

const store = createXRStore({
  enterGrantedSession: false,
});

export default function ShowroomScene(){
    const [paint, setPaint] = useState("#c8102e")
    const [selected, setSelected] = useState("#c8102e")
    const [animation, setAnimation] = useState<ActionName | null>(null)
    // Latest pick wins when the user clicks again while the car is still driving
    const pendingPaint = useRef<string | null>(null)

    function choosePaint(c: string){
        setSelected(c)
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setPaint(c)
            return
        }
        pendingPaint.current = c === paint ? null : c
        if (animation === null && pendingPaint.current) setAnimation("DriveOut")
    }

    function handleAnimationEnd(name: ActionName){
        if (name === "DriveOut") {
            // Car is off screen: swap the paint while nobody sees it, then bring it back
            if (pendingPaint.current) setPaint(pendingPaint.current)
            pendingPaint.current = null
            setAnimation("DriveIn")
        } else if (name === "DriveIn") {
            setAnimation(pendingPaint.current ? "DriveOut" : null)
        }
    }

    return(
        <main className="relative h-screen flex">
            <Canvas
                shadows
                camera={{
                    position: [6,3,8],
                    fov: 40
                }}
            >
                <XR store={store}>
                <color attach={"background"} args={["white"]}/>
                <Suspense 
                    fallback={null}
                >
                    <Model
                        paintColor={paint}
                        animation={animation}
                        onAnimationEnd={handleAnimationEnd}
                    />
                    
                    <Environment 
                        preset="city" 
                    />
                    {/* Large enough to cover the whole drive path, so the shadow travels with the car */}
                    <ContactShadows
                        position={[0, 0, 0]}
                        opacity={0.6}
                        scale={90}
                        resolution={2048}
                        far={6}
                        blur={2}
                    />
                    <OrbitControls 
                        enablePan={false} 
                        minDistance={20} 
                        maxDistance={35} 
                        maxPolarAngle={Math.PI / 2.1} 
                    />
                </Suspense>
                </XR>
            </Canvas>
            <div className="absolute bottom-6 left-1/2 flex flex-row items-center -translate-x-1/2 gap-3">
                {COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => choosePaint(c)}
                        aria-pressed={c === selected}
                        className={`rounded-full border-2 border-white shadow ${c === selected ? "h-14 w-14" : "h-10 w-10"}`}
                        style={{ background: c }}
                    />
                ))}
            <button
                className="relative border-2 border-black-900 rounded-full w-fit p-2 mx-auto"
                onClick={() => store.enterAR()}
                >   
                Enter AR
            </button>
            </div>
        </main>
    )
}