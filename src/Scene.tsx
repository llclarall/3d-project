import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, MeshReflectorMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

interface SceneProps {
  text: string
  color: string
}

export default function Scene({ text, color }: SceneProps) {
  const textRef = useRef<THREE.Mesh>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)
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
    
    // Rotation du texte
    textRef.current.rotation.y = THREE.MathUtils.lerp(textRef.current.rotation.y, mouse.x * 0.3, 0.2)
    textRef.current.rotation.x = THREE.MathUtils.lerp(textRef.current.rotation.x, -mouse.y * 0.3, 0.2)

    // Lampe torche qui suit la souris
    if (spotLightRef.current) {
      spotLightRef.current.position.x = mouse.x * 4
      spotLightRef.current.position.y = mouse.y * 3 + 2
      spotLightRef.current.position.z = 4
      spotLightRef.current.target.position.set(0, 0, 0)
      spotLightRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4466ff" />
      
      {/* Lampe torche qui suit la souris */}
      <spotLight
        ref={spotLightRef}
        intensity={5}
        angle={-0.8}
        penumbra={0.8}
        decay={3}
        distance={15}
        color={color || '#ff0055'}
        castShadow
      />

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
      <mesh position={[0, -.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={10} 
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.5}
          maxDepthThreshold={1.2}
          metalness={0.6}
          mirror={1}
        />
      </mesh>
    
    <Sparkles count={60} scale={10} size={5} speed={0.3} opacity={0.6} color={color} />
    </>
  )
}