import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, MeshReflectorMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/// Scene avec texte 3D, lampe torche qui suit la souris, lac miroir liquide noir et particules scintillantes

interface SceneProps {
  text: string
  color: string
}

interface CharPos {
  x: number
  w: number
}

interface TroikaLayoutRef {
  textRenderInfo?: {
    caretPositions?: Float32Array
  }
}

export default function Scene({ text, color }: SceneProps) {
  const textGroupRef = useRef<THREE.Group>(null)
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const letterGroupRefs = useRef<Array<THREE.Group | null>>([])
  const letterMaterialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([])
  const letterPulseRef = useRef<number[]>([])
  const firstLayerRef = useRef<TroikaLayoutRef | null>(null)
  const charPositionsDirtyRef = useRef(true)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null)
  const [charPositions, setCharPositions] = useState<CharPos[]>([])

  const accentColor = color || '#ff0055'
  const displayText = useMemo(() => (text.trim().length > 0 ? text : 'HELLO'), [text])
  const letters = useMemo(() => [...displayText], [displayText])

  // Reset per-letter state when text changes
  useEffect(() => {
    charPositionsDirtyRef.current = true
    letterPulseRef.current = new Array(letters.length).fill(0)
    letterGroupRefs.current = new Array(letters.length).fill(null)
    letterMaterialRefs.current = new Array(letters.length).fill(null)
  }, [letters])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    document.body.style.cursor = hoveredLetter === null ? 'default' : 'pointer'
    return () => { document.body.style.cursor = 'default' }
  }, [hoveredLetter])

  useFrame((state, delta) => {
    // Poll troika layout data as soon as it's available after a text change
    if (charPositionsDirtyRef.current) {
      const info = firstLayerRef.current?.textRenderInfo
      const cp: Float32Array | undefined = info?.caretPositions
      const n = letters.length
      if (cp && cp.length >= (n + 1)) {
        const stride = Math.round(cp.length / (n + 1))  // typically 3: [x, y, height]
        const positions: CharPos[] = letters.map((_, i) => ({
          x: (cp[i * stride] + cp[(i + 1) * stride]) / 2,
          w: Math.abs(cp[(i + 1) * stride] - cp[i * stride]),
        }))
        setCharPositions(positions)
        charPositionsDirtyRef.current = false
      }
    }
    if (!textGroupRef.current) return

    // Rotation du groupe selon la souris
    textGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      textGroupRef.current.rotation.y, mouse.x * 0.3, 0.2
    )
    textGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      textGroupRef.current.rotation.x, -mouse.y * 0.3, 0.2
    )

    // Lampe torche qui suit la souris
    if (spotLightRef.current) {
      spotLightRef.current.position.set(mouse.x * 4, mouse.y * 3 + 2, 4)
      spotLightRef.current.target.position.set(0, 0, 0)
      spotLightRef.current.target.updateMatrixWorld()
    }

    const flashColor = new THREE.Color('#aef6ff')
    const wobbleTime = state.clock.elapsedTime

    for (let i = 0; i < letters.length; i++) {
      if (letters[i] === ' ') continue

      const pulse = letterPulseRef.current[i] ?? 0
      const nextPulse = THREE.MathUtils.damp(pulse, 0, 7, delta)
      letterPulseRef.current[i] = nextPulse

      const isHovered = hoveredLetter === i

      const letterGroup = letterGroupRefs.current[i]
      if (letterGroup) {
        const targetScale = 1 + nextPulse * 0.5 + (isHovered ? 0.08 : 0)
        const targetY = nextPulse * 0.3 + Math.sin(wobbleTime * 16 + i) * 0.04 * nextPulse
        const targetRotZ = Math.sin(wobbleTime * 12 + i * 0.7) * 0.4 * nextPulse
        letterGroup.scale.setScalar(THREE.MathUtils.lerp(letterGroup.scale.x, targetScale, 0.3))
        letterGroup.position.y = THREE.MathUtils.lerp(letterGroup.position.y, targetY, 0.25)
        letterGroup.rotation.z = THREE.MathUtils.lerp(letterGroup.rotation.z, targetRotZ, 0.25)
      }

      const material = letterMaterialRefs.current[i]
      if (material) {
        const hoverBoost = isHovered ? 0.25 : 0
        const blend = Math.min(1, nextPulse * 0.9 + hoverBoost)
        const targetColor = new THREE.Color(accentColor).lerp(flashColor, blend)
        material.color.lerp(targetColor, 0.25)
        material.emissive.copy(material.color)
        material.emissiveIntensity = THREE.MathUtils.lerp(
          material.emissiveIntensity,
          0.3 + nextPulse * 2.5 + hoverBoost,
          0.3
        )
        const targetOpacity = nextPulse > 0.05 || isHovered ? 1 : 0
        material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.25)
      }
    }
  })

  const handleLetterClick = (index: number) => {
    if (letters[index] === ' ') return
    letterPulseRef.current[index] = Math.max(letterPulseRef.current[index] ?? 0, 1)
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4466ff" />
      <pointLight position={[0, 2, -2]} intensity={0.3} color={accentColor} />

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
        <group ref={textGroupRef}>

          {/* 8 couches du texte complet — espacement naturel de la police + effet 3D en profondeur */}
          {[...Array(8)].map((_, layer) => (
            <Text
              key={layer}
              position={[0, 0, -layer * 0.05]}
              fontSize={1.5}
              maxWidth={10}
              lineHeight={1}
              letterSpacing={0.05}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              font="BebasNeue-Regular.ttf"
              ref={layer === 0 ? firstLayerRef : undefined}
            >
              {displayText}
              <meshStandardMaterial
                color={
                  layer === 0
                    ? accentColor
                    : layer < 4
                    ? new THREE.Color(accentColor).multiplyScalar(0.8 - layer * 0.1).getStyle()
                    : new THREE.Color(accentColor).multiplyScalar(0.4).getStyle()
                }
                emissive={
                  layer === 0
                    ? accentColor
                    : new THREE.Color(accentColor).multiplyScalar(0.3)
                }
                emissiveIntensity={layer === 0 ? 0.5 : 0.2}
                metalness={0.2}
                roughness={0.3}
              />
            </Text>
          ))}

          {/* Zones d'interaction invisibles par lettre + overlay animé au clic/hover */}
          {charPositions.map((pos, index) => {
            if (index >= letters.length || letters[index] === ' ') return null
            const char = letters[index]
            return (
              <group
                key={`letter-${index}`}
                ref={(node) => { letterGroupRefs.current[index] = node }}
                position={[pos.x, 0, 0.15]}
                onClick={() => handleLetterClick(index)}
                onPointerOver={(e) => { e.stopPropagation(); setHoveredLetter(index) }}
                onPointerOut={() => setHoveredLetter((c) => (c === index ? null : c))}
              >
                {/* Plan invisible = zone de clic */}
                <mesh>
                  <planeGeometry args={[Math.max(pos.w * 1.1, 0.25), 1.8]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
                {/* Lettre overlay : invisible au repos, explose et brille au clic */}
                <Text
                  fontSize={1.5}
                  textAlign="center"
                  anchorX="center"
                  anchorY="middle"
                  font="BebasNeue-Regular.ttf"
                >
                  {char}
                  <meshStandardMaterial
                    ref={(node) => { letterMaterialRefs.current[index] = node }}
                    color={accentColor}
                    emissive={accentColor}
                    emissiveIntensity={0}
                    metalness={0.25}
                    roughness={0.28}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </Text>
              </group>
            )
          })}

        </group>
      </Float>

      {/* lac miroir liquide noir sous le texte */}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={5}
          roughness={1}
          depthScale={0.5}
          minDepthThreshold={0.6}
          maxDepthThreshold={1}
          metalness={0.6}
          mirror={1}
        />
      </mesh>

      <Sparkles count={60} scale={10} size={5} speed={0.3} opacity={0.6} color={accentColor} />
    </>
  )
}