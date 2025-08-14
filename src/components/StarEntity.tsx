import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface StarEntityProps {
  count?: number;
}

const StarEntity = ({ count = 2000 }: StarEntityProps) => {
  const meshRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.LineSegments>(null);
  
  // Создаем облако частиц для "тела" монстра
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Создаем органическую форму с концентрацией в центре
      const radius = Math.random() * 3 + 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      // Добавляем "щупальца" - удлиненные области
      const tentacle = Math.random() > 0.7;
      const finalRadius = tentacle ? radius * (2 + Math.random() * 3) : radius;
      
      positions[i * 3] = finalRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = finalRadius * Math.cos(phi);
      positions[i * 3 + 2] = finalRadius * Math.sin(phi) * Math.sin(theta);
      
      // Цвета: от зеленого к фиолетовому с красными акцентами
      const intensity = Math.random();
      if (intensity > 0.8) {
        // Красные "глаза" или энергетические узлы
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.2;
      } else if (intensity > 0.6) {
        // Фиолетовые области
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 1;
      } else {
        // Основной зеленый цвет
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0.4;
      }
    }
    
    return [positions, colors];
  }, [count]);

  // Создаем каркас "клетки"
  const cageGeometry = useMemo(() => {
    const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 8, 8));
    return geometry;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Органическое движение тела монстра
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
      
      // Пульсация
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    
    if (coreRef.current) {
      // Пульсирующее ядро
      const coreScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.rotation.x += 0.01;
      coreRef.current.rotation.y += 0.015;
    }
    
    if (cageRef.current) {
      // Медленное вращение клетки
      cageRef.current.rotation.x += 0.002;
      cageRef.current.rotation.y += 0.003;
      cageRef.current.rotation.z += 0.001;
      
      // Мерцание клетки
      const material = cageRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={[3, 0, -5]}>
      {/* Основное тело монстра */}
      <Points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Энергетическое ядро */}
      <Sphere ref={coreRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff0040"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Клетка из данных */}
      <lineSegments ref={cageRef} geometry={cageGeometry}>
        <lineBasicMaterial
          color="#00ff7f"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      
      {/* Дополнительные энергетические узлы */}
      {[...Array(5)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.1, 16, 16]}
          position={[
            Math.cos(i * 1.26) * 3,
            Math.sin(i * 1.26) * 2,
            Math.sin(i * 0.8) * 2
          ]}
        >
          <meshBasicMaterial
            color={i % 2 === 0 ? "#ff0040" : "#8000ff"}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      ))}
    </group>
  );
};

export default StarEntity;