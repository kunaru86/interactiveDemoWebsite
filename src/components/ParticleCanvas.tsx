import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Float, Text, useVideoTexture, Grid } from '@react-three/drei';
import { XR, Controllers, Hands } from '@react-three/xr';

const fragmentShader = `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  // Core glow
  float strength = pow(1.0 - (dist * 2.0), 3.0);
  gl_FragColor = vec4(uColor * 1.5, strength * vAlpha);
}
`;

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
attribute float aRandom;
attribute float aSize;
varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // Base floating motion
  pos.x += sin(uTime * 0.3 + aRandom * 100.0) * 0.4;
  pos.y += cos(uTime * 0.4 + aRandom * 100.0) * 0.4;
  pos.z += sin(uTime * 0.5 + aRandom * 100.0) * 0.4;
  
  // Scroll distortion
  pos.y += uScroll * 15.0; 
  pos.y = mod(pos.y + 15.0, 30.0) - 15.0;

  // Mouse repulsion mapping
  vec2 mouseWorld = uMouse * 10.0; 
  float distToMouse = length(pos.xy - mouseWorld);
  
  if (distToMouse < 4.0) {
    float force = (4.0 - distToMouse) / 4.0;
    vec2 dir = normalize(pos.xy - mouseWorld);
    pos.xy += dir * force * 4.0;
    pos.z += force * 5.0;
  }

  // Gentle Spiral effect
  float angle = uTime * 0.05 + length(pos.xz) * 0.2;
  float s = sin(angle);
  float c = cos(angle);
  pos.x = pos.x * c - pos.z * s;
  pos.z = pos.x * s + pos.z * c;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Size attenuation
  gl_PointSize = (aSize * 45.0) / max(-mvPosition.z, 0.1);
  gl_Position = projectionMatrix * mvPosition;
  
  // Twinkling effect
  vAlpha = 0.4 + (sin(uTime * 2.0 + aRandom * 20.0) * 0.5 + 0.5) * 0.6;
}
`;

function ParticleSwarm() {
  const count = 30000;
  
  const [positions, randoms, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const size = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
        const u = Math.random() * Math.PI * 2;
        const r = 2 + Math.pow(Math.random(), 2) * 12;
        
        pos[i*3] = r * Math.cos(u);
        pos[i*3+1] = (Math.random() - 0.5) * 35;
        pos[i*3+2] = r * Math.sin(u) + (Math.random() - 0.5) * 8;
       
        rnd[i] = Math.random();
        size[i] = Math.random() * 2.5 + 0.5;
    }
    return [pos, rnd, size];
  }, [count]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const mouse = useRef(new THREE.Vector2(0, 0));
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const scrollRef = useRef(0);
  const targetScroll = useRef(0);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    let rafId: number;
    const updateScroll = () => {
      targetScroll.current = window.scrollY / window.innerHeight;
      rafId = requestAnimationFrame(updateScroll);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(updateScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useFrame((state) => {
    mouse.current.lerp(targetMouse.current, 0.05);
    scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, targetScroll.current, 0.05);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse.value.copy(mouse.current);
      materialRef.current.uniforms.uScroll.value = scrollRef.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uScroll: { value: 0 },
          uColor: { value: new THREE.Color('#ff3300') }
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}

function VideoPanel({ url, position, rotation }: { url: string, position: [number, number, number], rotation: [number, number, number] }) {
  const texture = useVideoTexture(url, { crossOrigin: 'Anonymous', muted: true, loop: true, playsInline: true });
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[2.4, 1.35]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function ImmersiveContent() {
  return (
    <group position={[0, 1.5, -3]}>
      <Float speed={1.5} floatIntensity={0.5}>
        <Text
          fontSize={0.8}
          color="#ffffff"
          position={[0, 1.2, 0]}
          font="https://fonts.gstatic.com/s/syncopate/v12/pe0sMIuPIYBCpEV5eFdCBfe_.woff"
          letterSpacing={0.1}
          anchorY="bottom"
        >
          RUSH XR
        </Text>
        <Text
          fontSize={0.12}
          color="#ff3300"
          position={[0, 1.0, 0]}
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwJNsU.woff"
          letterSpacing={0.2}
          anchorY="top"
        >
          WELCOME TO THE SPATIAL DOMAIN
        </Text>
      </Float>

      <Suspense fallback={
        <mesh position={[-3, 0, -1]} rotation={[0, 0.5, 0]}>
          <planeGeometry args={[2.4, 1.35]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      }>
        <VideoPanel 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" 
          position={[-3, 0, -1]} 
          rotation={[0, 0.5, 0]} 
        />
      </Suspense>

      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.4, 1.35]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      }>
        <VideoPanel 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]} 
        />
      </Suspense>

      <Suspense fallback={
        <mesh position={[3, 0, -1]} rotation={[0, -0.5, 0]}>
          <planeGeometry args={[2.4, 1.35]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      }>
        <VideoPanel 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" 
          position={[3, 0, -1]} 
          rotation={[0, -0.5, 0]} 
        />
      </Suspense>
    </group>
  )
}


export default function ParticleCanvas() {
  return (
    <div className="fixed inset-0 z-0 bg-[#020202] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: false, alpha: false }}>
        <XR>
          <Controllers />
          <Hands />
          <fog attach="fog" args={['#020202', 8, 25]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <group position={[0, 0, -5]}>
            <ParticleSwarm />
          </group>
          <Suspense fallback={null}>
            <ImmersiveContent />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
