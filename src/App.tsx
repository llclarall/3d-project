import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import './App.css'


function App() {
  const [inputText, setInputText] = useState('MMI 3')
  const [textColor, setTextColor] = useState('#ff0055')

  return (
    <div className="container">
      {/* Scène 3D (R3F) */}
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Scene text={inputText} color={textColor} />
      </Canvas>

      {/* Interface UI (HTML) */}
      <div className="ui-panel">
        <h1>✨ Typo 3D Explorer</h1>
        
        <div className="input-group">
          <label>Texte</label>
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value.substring(0, 15))}
            placeholder="Tapez quelque chose..."
            maxLength={15}
          />
        </div>

        <div className="input-group">
          <label>Couleur</label>
          <input 
            type="color" 
            value={textColor} 
            onChange={(e) => setTextColor(e.target.value)} 
          />
        </div>
        
        <p className="hint">Bougez la souris pour incliner le texte</p>
      </div>
    </div>
  )
}

export default App