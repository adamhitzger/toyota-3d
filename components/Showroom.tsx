"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense, useState } from "react"
import { Model } from "./Model"
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei"

const COLORS: Array<string> = ["#c8102e", "#ffffff", "#111111", "#1e3a8a", "#9ca3af"]

export default function ShowroomScene(){
    const [paint, setPaint] = useState("#c8102e")
    return(
        <main className="relative h-screen flex">
            <Canvas
                shadows
                camera={{
                    position: [6,3,8],
                    fov: 40
                }}
            >
                <color attach={"background"} args={["white"]}/>
                <Suspense 
                    fallback={null}
                >
                    <Model
                        paintColor={paint} 
                    />
                    
                    <Environment 
                        preset="city" 
                    />
                    <ContactShadows 
                        position={[0, 0, 0]} 
                        opacity={0.6} 
                        scale={10} 
                        blur={2} 
                    />
                    <OrbitControls 
                        enablePan={false} 
                        minDistance={20} 
                        maxDistance={35} 
                        maxPolarAngle={Math.PI / 2.1} 
                    />
                </Suspense>
            </Canvas>
            <div className="absolute bottom-6 left-1/2 flex flex-row items-center -translate-x-1/2 gap-3">
                {COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => setPaint(c)}
                        className={`rounded-full border-2 border-white shadow ${c === paint ? "h-14 w-14" : "h-10 w-10"}`}
                        style={{ background: c }}
                    />
                ))}
            </div>
        </main>
    )
}