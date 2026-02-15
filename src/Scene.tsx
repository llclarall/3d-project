import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface SceneProps {
  text: string
  color: string
}

export default function Scene({ text, color }: SceneProps) {
  const textRef = useRef<THREE.Mesh>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (!textRef.current) return
    
    textRef.current.rotation.y = THREE.MathUtils.lerp(textRef.current.rotation.y, mouse.x * 0.2, 0.1)
    textRef.current.rotation.x = THREE.MathUtils.lerp(textRef.current.rotation.x, -mouse.y * 0.2, 0.1)
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#4466ff" />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <Text
          ref={textRef}
          position={[0, 0, 0]}
          fontSize={1.5}
          color={color || '#ff0055'}
          maxWidth={10}
          lineHeight={1}
          letterSpacing={0.05}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          font='BebasNeue-Regular.ttf'
        >
          {text || 'HELLO'}
        </Text>
      </Float>

      {/* Lac miroir liquide noir sous le texte */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[500, 200]}
          resolution={1024}
          mixBlur={2}
          mixStrength={60}
          roughness={0.3}
          depthScale={1.5}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.5}
          color="#000000"
          metalness={0.8}
          mirror={0.7}
        />
      </mesh>
    </>
  )
}