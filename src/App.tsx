import './App.css'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'

function App() {

  return (
    <>
    <div className='canva-container'>
      <Canvas>
        <Scene></Scene>
      </Canvas>
    </div></>
  )
}

export default App
