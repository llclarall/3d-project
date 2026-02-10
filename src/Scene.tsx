import { OrbitControls } from "@react-three/drei"

export function Scene() {
  return (
    <>
    <mesh>
        <boxGeometry args={[1, 1, 1]}></boxGeometry>
        <meshBasicMaterial color="orange"></meshBasicMaterial>
    </mesh>

    <OrbitControls enableZoom={true} enablePan={true} enableRotate={true}></OrbitControls>
    </>
  )
}