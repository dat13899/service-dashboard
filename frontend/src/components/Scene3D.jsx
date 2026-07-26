import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * 3D background scene — floating geometry + particle field.
 * Renders behind all page content as a fixed background layer.
 * Mobile: reduced particles (150), lower DPR, simplified geometry.
 */
function ParticleField({ count = 400 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.02;
      mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.03;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#00d4ff" transparent opacity={0.3} depthWrite={false} />
    </points>
  );
}

function FloatingTorus({ color = '#00d4ff', position = [0, 0, 0], scale = 1, speed = 0.5, opacity = 0.08 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.15 * speed;
      ref.current.rotation.y = clock.getElapsedTime() * 0.2 * speed;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 64, 12]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={opacity}
          wireframe
          distort={0.12}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  const { isMobile } = useMediaQuery();
  const particleCount = isMobile ? 120 : 400;

  if (isMobile) {
    // Mobile: lightweight — single torus, minimal particles
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1]}
          style={{ background: 'transparent' }}
          performance={{ min: 0.3 }}
        >
          <ambientLight intensity={0.2} color="#00d4ff" />
          <FloatingTorus color="#00d4ff" position={[0, 0.3, -1]} scale={0.7} speed={0.5} opacity={0.06} />
          <ParticleField count={particleCount} />
        </Canvas>
      </div>
    );
  }

  // Desktop: full scene
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} color="#00d4ff" />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <FloatingTorus color="#00d4ff" position={[-1.8, 0.8, -1]} scale={0.8} speed={0.7} />
        <FloatingTorus color="#00a8e0" position={[2, -0.5, -2]} scale={0.5} speed={1.1} />
        <ParticleField count={particleCount} />
      </Canvas>
    </div>
  );
}
