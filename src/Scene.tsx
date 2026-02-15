import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Center, Float } from '@react-three/drei'
import * as THREE from 'three'

interface SceneProps {
  text: string
  color: string
}

export default function Scene({ text, color }: SceneProps) {
  const textRef = useRef<THREE.Group>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // Écoute les mouvements de souris sur tout le document
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convertir les coordonnées en valeurs normalisées (-1 à 1)
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animation : Le texte suit doucement le curseur de la souris
  useFrame(() => {
    if (!textRef.current) return
    
    const targetRotationY = mouse.x * 0.5
    const targetRotationX = -mouse.y * 0.5
    
    textRef.current.rotation.y = THREE.MathUtils.lerp(textRef.current.rotation.y, targetRotationY, 0.1)
    textRef.current.rotation.x = THREE.MathUtils.lerp(textRef.current.rotation.x, targetRotationX, 0.1)
  })

  return (
    <>
      {/* Lumières pour donner du relief au texte */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#4466ff" />
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1.5}
        castShadow
      />

      {/* Float : Animation automatique de haut en bas */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <Center position={[0, 0, 0]} ref={textRef}>
          <Text
            fontSize={1.5}
            color={color || "#ff0055"}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={0.07}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
            font="BebasNeue-Regular.ttf"
          >
            {text || "hello"}
          </Text>
        </Center>
      </Float>
    </>
  )
}