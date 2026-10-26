"use client"

import { Canvas } from "@react-three/fiber"
import { createXRStore, IfInSessionMode, useXR, XR } from "@react-three/xr";
import { ReactNode, Suspense, useRef, useState } from "react"
import { ActionName, Model } from "./Model"
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei"

const COLORS: Array<string> = ["#c8102e", "#ffffff", "#111111", "#1e3a8a", "#9ca3af"]

const store = createXRStore({
  enterGrantedSession: false,
});

// The model is ~18.9 units long, the real GR Corolla is 4.41 m and WebXR works in metres
const AR_SCALE = 4.41 / 18.9

// Any XR session counts: headsets and the desktop emulator report an AR session as "immersive-vr"
// (the store derives mode from environmentBlendMode), so checking for "immersive-ar" alone misses them
const IN_XR = ["immersive-ar", "immersive-vr"] as const

function CarStage({ children }: { children: ReactNode }){
    const inXR = useXR((s) => s.session != null)
    return (
        // In XR the origin is the floor right under the user, so park the car 4 m in front of them
        <group scale={inXR ? AR_SCALE : 1} position={inXR ? [0, 0, -4] : [0, 0, 0]}>
            {children}
        </group>
    )
}

// DOM buttons are not visible on headsets, so in XR the paint picker lives in the scene.
// Pointer events here work with controllers, hands and screen taps on phones.
function XRPaintPicker({ selected, onPick }: { selected: string, onPick: (c: string) => void }){
    const [hovered, setHovered] = useState<string | null>(null)
    const spacing = 0.15
    return (
        // Waist height, an arm's length away, tilted towards the user
        <group position={[0, 0.95, -0.9]} rotation={[-0.45, 0, 0]}>
            <mesh position={[0, 0, -0.012]}>
                <planeGeometry args={[spacing * COLORS.length + 0.04, 0.2]} />
                <meshBasicMaterial color="#0f0f10" transparent opacity={0.55} />
            </mesh>
            {COLORS.map((c, i) => (
                <group
                    key={c}
                    position={[(i - (COLORS.length - 1) / 2) * spacing, 0, 0]}
                    scale={hovered === c ? 1.15 : 1}
                >
                    <mesh
                        rotation={[Math.PI / 2, 0, 0]}
                        onClick={(e) => { e.stopPropagation(); onPick(c) }}
                        onPointerOver={() => setHovered(c)}
                        onPointerOut={() => setHovered((h) => (h === c ? null : h))}
                    >
                        <cylinderGeometry args={[0.05, 0.05, 0.02, 48]} />
                        <meshStandardMaterial color={c} roughness={0.35} metalness={0.2} />
                    </mesh>
                    {c === selected && (
                        <mesh>
                            <torusGeometry args={[0.064, 0.006, 12, 48]} />
                            <meshBasicMaterial color="#f2f2ef" />
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    )
}

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
                {/* A solid background would cover the camera feed / passthrough */}
                <IfInSessionMode deny={IN_XR}>
                    <color attach={"background"} args={["white"]}/>
                </IfInSessionMode>
                <IfInSessionMode allow={IN_XR}>
                    <XRPaintPicker selected={selected} onPick={choosePaint} />
                </IfInSessionMode>
                <Suspense
                    fallback={null}
                >
                    <CarStage>
                        <Model
                            paintColor={paint}
                            animation={animation}
                            onAnimationEnd={handleAnimationEnd}
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
                    </CarStage>

                    <Environment
                        preset="city"
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