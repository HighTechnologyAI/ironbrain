import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface StarEntityProps {
  count?: number;
}

const StarEntity = ({ count = 3000 }: StarEntityProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.LineSegments>(null);
  const outerRingRef = useRef<THREE.LineSegments>(null);
  
  const [phase, setPhase] = useState(0); // 0: блуждание, 1: приближение, 2: взгляд в камеру
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([8, 3, -10]);
  
  // Создаем более сложное облако частиц для премиального вида
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Создаем многослойную структуру
      const layer = Math.random();
      let radius, baseSize;
      
      if (layer < 0.3) {
        // Внутреннее ядро
        radius = Math.random() * 1.5 + 0.2;
        baseSize = 0.08;
      } else if (layer < 0.7) {
        // Средний слой с щупальцами  
        radius = Math.random() * 4 + 1.5;
        baseSize = 0.05;
      } else {
        // Внешняя аура
        radius = Math.random() * 8 + 4;
        baseSize = 0.03;
      }
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      // Добавляем "щупальца" и органические выросты
      const tentacle = Math.random() > 0.8;
      const finalRadius = tentacle ? radius * (1.5 + Math.random() * 2) : radius;
      
      positions[i * 3] = finalRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = finalRadius * Math.cos(phi);
      positions[i * 3 + 2] = finalRadius * Math.sin(phi) * Math.sin(theta);
      
      // Размеры частиц для объемности
      sizes[i] = baseSize * (0.5 + Math.random() * 1.5);
      
      // Премиальная цветовая схема
      const intensity = Math.random();
      if (intensity > 0.9) {
        // Золотые акценты
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.2;
      } else if (intensity > 0.7) {
        // Красные энергетические узлы
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.4;
      } else if (intensity > 0.5) {
        // Синие/фиолетовые области
        colors[i * 3] = 0.4;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 1;
      } else {
        // Основной зеленый с вариациями
        colors[i * 3] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.4;
      }
    }
    
    return [positions, colors, sizes];
  }, [count]);

  // Создаем каркас "клетки" и внешнее кольцо
  const [cageGeometry, outerRingGeometry] = useMemo(() => {
    const cageGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 6, 6));
    const ringGeo = new THREE.RingGeometry(8, 8.5, 32);
    return [cageGeo, ringGeo];
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Управление фазами поведения
    setPhaseTimer(prev => prev + state.clock.getDelta());
    
    if (phaseTimer > 15 && phase === 0) {
      // Переход к приближению
      setPhase(1);
      setPhaseTimer(0);
      setTargetPosition([0, 0, 5]);
    } else if (phaseTimer > 3 && phase === 1) {
      // Взгляд в камеру
      setPhase(2);
      setPhaseTimer(0);
    } else if (phaseTimer > 2 && phase === 2) {
      // Возврат к блужданию
      setPhase(0);
      setPhaseTimer(0);
      const side = Math.random() > 0.5 ? 1 : -1;
      setTargetPosition([
        (8 + Math.random() * 4) * side,
        -3 + Math.random() * 6,
        -8 - Math.random() * 5
      ]);
    } else if (phaseTimer > 8 && phase === 0) {
      // Смена позиции во время блуждания
      const side = Math.random() > 0.5 ? 1 : -1;
      const edge = Math.random();
      if (edge < 0.33) {
        // Левый/правый край
        setTargetPosition([
          (7 + Math.random() * 5) * side,
          -2 + Math.random() * 4,
          -6 - Math.random() * 8
        ]);
      } else if (edge < 0.66) {
        // Верхний/нижний край
        setTargetPosition([
          -4 + Math.random() * 8,
          (4 + Math.random() * 3) * side,
          -5 - Math.random() * 10
        ]);
      } else {
        // Дальний план
        setTargetPosition([
          -6 + Math.random() * 12,
          -3 + Math.random() * 6,
          -12 - Math.random() * 8
        ]);
      }
      setPhaseTimer(0);
    }
    
    if (groupRef.current) {
      // Плавное движение к целевой позиции
      groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), 0.01);
      
      // Поворот к камере в фазе 2
      if (phase === 2) {
        const lookTarget = new THREE.Vector3(0, 0, 10);
        groupRef.current.lookAt(lookTarget);
      } else {
        // Органическое вращение во время блуждания
        groupRef.current.rotation.y += 0.003;
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      }
    }
    
    
    if (meshRef.current) {
      // Внутреннее движение частиц
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.05;
      
      // Пульсация в зависимости от фазы
      const intensity = phase === 2 ? 1.5 : 1;
      const scale = intensity * (1 + Math.sin(time * 0.8) * 0.15);
      meshRef.current.scale.setScalar(scale);
    }
    
    if (coreRef.current) {
      // Более драматичная пульсация ядра
      const coreIntensity = phase === 2 ? 2 : 1.2;
      const coreScale = coreIntensity * (1 + Math.sin(time * 2.5) * 0.4);
      coreRef.current.scale.setScalar(coreScale);
      coreRef.current.rotation.x += 0.02;
      coreRef.current.rotation.y += 0.025;
    }
    
    if (cageRef.current) {
      // Медленное вращение клетки с мерцанием
      cageRef.current.rotation.x += 0.004;
      cageRef.current.rotation.y += 0.006;
      cageRef.current.rotation.z += 0.002;
      
      const material = cageRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.4 + Math.sin(time * 1.8) * 0.3;
    }
    
    if (outerRingRef.current) {
      // Внешнее кольцо контроля
      outerRingRef.current.rotation.z += 0.01;
      const ringMaterial = outerRingRef.current.material as THREE.LineBasicMaterial;
      ringMaterial.opacity = 0.2 + Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
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
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Энергетическое ядро */}
      <Sphere ref={coreRef} args={[0.8, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff4080"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      {/* Внутреннее пульсирующее ядро */}
      <Sphere args={[0.4, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ffcc00"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
      
      
      {/* Клетка из данных */}
      <lineSegments ref={cageRef} geometry={cageGeometry}>
        <lineBasicMaterial
          color="#00ff7f"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      
      {/* Внешнее кольцо контроля */}
      <lineSegments ref={outerRingRef} geometry={outerRingGeometry} rotation={[Math.PI / 2, 0, 0]}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      
      {/* Энергетические узлы */}
      {[...Array(8)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.15, 16, 16]}
          position={[
            Math.cos(i * 0.785) * 4,
            Math.sin(i * 0.785) * 3,
            Math.sin(i * 0.6) * 2
          ]}
        >
          <meshBasicMaterial
            color={i % 3 === 0 ? "#ff4080" : i % 3 === 1 ? "#8040ff" : "#40ff80"}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      ))}
    </group>
  );
};

export default StarEntity;