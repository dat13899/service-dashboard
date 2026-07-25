import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D background scene — floating geometry + particle field.
 * Renders behind all page content as a fixed background layer.
 * Uses instanced particles for performance.
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
      mesh.current.rotation.y = clock.getElapsedTime() * 0.03;
      mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#34d399" transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}

function FloatingTorus({ color = '#34d399', position = [0, 0, 0], scale = 1, speed = 0.5 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.2 * speed;
      ref.current.rotation.y = clock.getElapsedTime() * 0.3 * speed;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.08}
          wireframe
          distort={0.15}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function Icosahedron() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.15;
      ref.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={[2.5, -1, -2]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color="#34d399"
          wireframe
          transparent
          opacity={0.12}
          emissive="#34d399"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} color="#34d399" />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <FloatingTorus color="#34d399" position={[-1.8, 0.8, -1]} scale={0.8} speed={0.7} />
        <FloatingTorus color="#10b981" position={[2, -0.5, -2]} scale={0.5} speed={1.1} />
        <Icosahedron />
        <ParticleField count={500} />
      </Canvas>
    </div>
  );
}
