"use client";
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { CircleBody } from "@/types";

const CIRCLE_RADIUS: number = 45;
const DROP_INTERVAL: number = 400;
const CIRCLE_CONFIG = {
  restitution: 0.5,
  friction: 0.8,
  density: 0.002,
  frictionAir: 0.02,
  frictionStatic: 0.5,
  angularVelocity: 0.05,
  torque: 0.002,
};
const GLOW_CONFIG = {
  innerColor: "rgba(255, 255, 255, 0.1)",
  outerColor: "rgba(255, 255, 255, 0.6)",
  borderColor: "rgba(255, 255, 255, 0.8)",
  borderWidth: 1,
  glowSize: 10,
};

// interface RenderWithText extends Matter.Render {
//   canvas: HTMLCanvasElement;
// }

const CirclePeople = ({ names }: { names: string[] }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  // @ts-expect-error: Object is possibly 'null'.
  const engineRef = useRef<Matter.Engine>();
  const circlesRef = useRef<CircleBody[]>([]);
  const remainingNamesRef = useRef<string[]>([...names]);
  const processedNamesRef = useRef<Set<string>>(new Set());
  const [pixelRatio, setPixelRatio] = useState<number>(1);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    setPixelRatio(window.devicePixelRatio || 1);
    setWindowWidth(window.innerWidth);
  }, []);

  const createCircle = (name: string): CircleBody => {
    const randomX =
      Math.random() * (windowWidth - 2 * CIRCLE_RADIUS - 20) +
      CIRCLE_RADIUS +
      10;
    const randomRotation = Math.random() * Math.PI * 2;
    const { Bodies } = Matter;
    return Bodies.circle(randomX, -CIRCLE_RADIUS, CIRCLE_RADIUS, {
      ...CIRCLE_CONFIG,
      angle: randomRotation,
      angularVelocity: (Math.random() - 0.5) * 0.05,
      render: {
        fillStyle: `hsl(${Math.random() * 360}, 70%, 70%)`,
        // @ts-expect-error: Object is possibly 'null'.
        text: `${name}`,
        textColor: "#866823",
      },
    }) as CircleBody;
  };

  // Process incoming names (ensure each name is added only once)
  useEffect(() => {
    if (!engineRef.current) return;
    const newNames = names.filter(
      (name) => !processedNamesRef.current.has(name)
    );
    newNames.forEach((name) => {
      const circle = createCircle(name);
      Matter.World.add(engineRef.current!.world, circle);
      circlesRef.current.push(circle);
      processedNamesRef.current.add(name);
    });
  }, [names]);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { Engine, World, Bodies } = Matter;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scaledWidth = width * pixelRatio;
    const scaledHeight = height * pixelRatio;

    engineRef.current = Engine.create({
      gravity: { x: 0, y: 0.8 },
    });

    // Create our canvas manually
    const canvas = document.createElement("canvas");
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    sceneRef.current.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) return;

    // Create static walls
    const walls = [
      Bodies.rectangle(width / 2, height + 30, width * 2, 60, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(-30, height / 2, 60, height, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(width + 30, height / 2, 60, height, {
        isStatic: true,
        render: { visible: false },
      }),
    ];
    World.add(engineRef.current.world, walls);

    // Collision event for added natural rotation
    Matter.Events.on(engineRef.current, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as CircleBody;
        const bodyB = pair.bodyB as CircleBody;
        if (!bodyA.isStatic) {
          Matter.Body.setAngularVelocity(
            bodyA,
            bodyA.angularVelocity + (Math.random() - 0.5) * 0.05
          );
        }
        if (!bodyB.isStatic) {
          Matter.Body.setAngularVelocity(
            bodyB,
            bodyB.angularVelocity + (Math.random() - 0.5) * 0.05
          );
        }
      });
    });

    // Add circles at intervals
    const addNewCircle = () => {
      if (remainingNamesRef.current.length > 0) {
        const name = remainingNamesRef.current.shift()!;
        const circle = createCircle(name);
        Matter.World.add(engineRef.current!.world, circle);
        circlesRef.current.push(circle);
        processedNamesRef.current.add(name);
      }
    };
    const intervalId = setInterval(addNewCircle, DROP_INTERVAL);

    // Single main loop for updating physics and rendering
    let animationFrameId: number;
    const renderLoop = () => {
      // Update physics engine (use delta if needed)
      Matter.Engine.update(engineRef.current!, 1000 / 60);

      // Clear canvas
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      // Render each circle with text and glow
      circlesRef.current.forEach((circle: CircleBody) => {
        const { x, y } = circle.position;
        const angle = circle.angle;
        context.save();
        context.translate(x, y);
        context.rotate(angle);

        // Create radial gradient (cache this if many circles share similar styles)
        const gradient = context.createRadialGradient(
          0,
          0,
          CIRCLE_RADIUS - GLOW_CONFIG.glowSize,
          0,
          0,
          CIRCLE_RADIUS
        );
        gradient.addColorStop(0, GLOW_CONFIG.innerColor);
        gradient.addColorStop(1, GLOW_CONFIG.outerColor);

        context.beginPath();
        context.arc(0, 0, CIRCLE_RADIUS, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        context.strokeStyle = GLOW_CONFIG.borderColor;
        context.lineWidth = GLOW_CONFIG.borderWidth;
        context.stroke();

        // Optional: apply a reduced shadow (or remove if not needed)
        context.shadowColor = "rgba(255, 255, 255, 0.5)";
        context.shadowBlur = GLOW_CONFIG.glowSize;
        context.stroke();

        // Reset shadow before drawing text
        context.shadowColor = "transparent";
        context.shadowBlur = 0;

        // Draw text
        context.font = "16px system-ui, sans-serif";
        context.fillStyle = "#b6a681";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(circle.render.text, 0, 0);

        context.restore();
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    // Start the main loop
    renderLoop();

    // Handle resize events (consider debouncing if needed)
    // const handleResize = () => {
    //   const newWidth = window.innerWidth;
    //   const newHeight = window.innerHeight;
    //   const newScaledWidth = newWidth * pixelRatio;
    //   const newScaledHeight = newHeight * pixelRatio;
    //   canvas.width = newScaledWidth;
    //   canvas.height = newScaledHeight;
    //   canvas.style.width = `${newWidth}px`;
    //   canvas.style.height = `${newHeight}px`;

    //   // Update walls positions
    //   Matter.Body.setPosition(walls[0], { x: newWidth / 2, y: newHeight + 30 });
    //   Matter.Body.setPosition(walls[1], { x: -30, y: newHeight / 2 });
    //   Matter.Body.setPosition(walls[2], { x: newWidth + 30, y: newHeight / 2 });
    // };

    // window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(intervalId);
    //   window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      Matter.Events.off(engineRef.current!, "collisionStart");
      // Clean up Matter objects
      Matter.World.clear(engineRef.current!.world, false);
      Matter.Engine.clear(engineRef.current!);
      canvas.remove();
    };
  }, [pixelRatio, windowWidth]);

  return (
    <div
      ref={sceneRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default CirclePeople;
