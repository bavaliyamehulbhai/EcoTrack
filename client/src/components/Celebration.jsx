import { useEffect, useRef } from "react";

function Celebration({ trigger }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle class
    class Particle {
      constructor(x, y, angle, spread, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Initial physics
        const velocity = 15 + Math.random() * 15;
        const radAngle = (angle + (Math.random() - 0.5) * spread) * (Math.PI / 180);
        this.vx = Math.cos(radAngle) * velocity;
        this.vy = Math.sin(radAngle) * velocity;
        
        this.gravity = 0.45;
        this.friction = 0.96;
        this.opacity = 1;
        this.size = 6 + Math.random() * 8;
        
        // Rotation and wobble
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
        this.wobble = Math.random() * Math.PI;
        this.wobbleSpeed = 0.08 + Math.random() * 0.08;
        
        // Shape: 60% rectangles, 40% circles
        this.shape = Math.random() > 0.4 ? "rect" : "circle";
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        this.opacity -= 0.012; // slow fade out
        this.rotation += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;
      }

      draw(context) {
        if (this.opacity <= 0) return;
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.scale(Math.sin(this.wobble), 1);
        
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;
        
        if (this.shape === "circle") {
          context.beginPath();
          context.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        context.restore();
      }
    }

    const particles = [];
    const colors = ["#22c55e", "#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];

    // Spawn dual corner cannons
    // Left corner shooting up-right (approx -45 degrees)
    for (let i = 0; i < 75; i++) {
      particles.push(
        new Particle(
          0,
          canvas.height,
          -45,
          35,
          colors[Math.floor(Math.random() * colors.length)]
        )
      );
    }
    // Right corner shooting up-left (approx -135 degrees)
    for (let i = 0; i < 75; i++) {
      particles.push(
        new Particle(
          canvas.width,
          canvas.height,
          -135,
          35,
          colors[Math.floor(Math.random() * colors.length)]
        )
      );
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      let activeParticles = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity > 0) {
          p.update();
          p.draw(ctx);
          activeParticles++;
        }
      }

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
}

export default Celebration;
