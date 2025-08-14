import { useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import StarEntity from './StarEntity';

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
}

const AnimatedStarfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const numStars = 200;
      starsRef.current = [];
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 1000,
          prevX: 0,
          prevY: 0,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      starsRef.current.forEach((star) => {
        star.prevX = star.x / star.z * 100;
        star.prevY = star.y / star.z * 100;

        star.z -= 2;
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
          star.z = 1000;
        }

        const x = star.x / star.z * 100;
        const y = star.y / star.z * 100;

        const opacity = Math.max(0, 1 - star.z / 1000);
        const size = Math.max(0, (1 - star.z / 1000) * 2);

        // Star color with green accent
        ctx.fillStyle = `rgba(0, 255, 127, ${opacity})`;
        ctx.fillRect(x, y, size, size);

        // Trail effect
        if (opacity > 0.5) {
          ctx.strokeStyle = `rgba(0, 255, 127, ${opacity * 0.3})`;
          ctx.lineWidth = size * 0.5;
          ctx.beginPath();
          ctx.moveTo(star.prevX, star.prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'rgb(10, 10, 10)' }}
      />
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <StarEntity />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AnimatedStarfield;