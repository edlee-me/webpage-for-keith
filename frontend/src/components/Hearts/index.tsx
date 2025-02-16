"use client";
// CirclePeople.tsx
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { CircleBody } from "@/types";

// const NAMES: string[] = [
//   "Alice",
//   "Bob",
//   "Charlie",
//   "Diana",
//   "Eric",
//   "Frank",
//   "Grace",
//   "Henry",
//   "Ivy",
//   "Jack",
// ];
const CIRCLE_RADIUS: number = 50;
const DROP_INTERVAL: number = 400;
const CIRCLE_CONFIG = {
  restitution: 0.1, // Reduced from 0.6 - controls bounciness
  friction: 0.8, // Increased from 0.1 - more friction with other circles
  density: 0.002, // Increased from 0.001 - makes circles heavier
  frictionAir: 0.02, // Increased air resistance
  frictionStatic: 0.5, // Added static friction
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

interface RenderWithText extends Matter.Render {
  canvas: HTMLCanvasElement;
}

// CirclePeople.tsx
// ... (previous imports and constants remain the same)

const CirclePeople = ({ names }: { names: string[] }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  // @ts-expect-error: engineRef is initialized in useEffect
  const engineRef = useRef<Matter.Engine>();
  const circlesRef = useRef<CircleBody[]>([]);
  const remainingNamesRef = useRef<string[]>([...names]);
  //   const pixelRatio = window.devicePixelRatio || 1;
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
    const randomRotation = Math.random() * Math.PI * 2; // Random initial rotation

    const { Bodies } = Matter;
    return Bodies.circle(randomX, -CIRCLE_RADIUS, CIRCLE_RADIUS, {
      ...CIRCLE_CONFIG,
      angle: randomRotation,
      // angularVelocity: (Math.random() - 0.5) * 0.1, // Random initial spin
      angularVelocity: (Math.random() - 0.5) * 0.05,
      render: {
        fillStyle: `hsl(${Math.random() * 360}, 70%, 70%)`,
        //@ts-expect-error: text is not part of the default render options
        text: `${name}`,
        textColor: "#866823",
      },
    }) as CircleBody;
  };

  useEffect(() => {
    if (!engineRef.current) return;

    // Find new names that haven't been processed
    const newNames = names.filter(
      (name) => !processedNamesRef.current.has(name)
    );

    const { World } = Matter;

    // Create circles for new names
    newNames.forEach((name) => {
      const circle = createCircle(name);
      World.add(engineRef.current!.world, circle);
      circlesRef.current.push(circle);
      processedNamesRef.current.add(name);
    });
  }, [names]); // React to names changes

  useEffect(() => {
    if (!sceneRef.current) return;

    const { Engine, Render, World, Bodies, Runner } = Matter;

    // Get actual canvas dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scaledWidth = width * pixelRatio;
    const scaledHeight = height * pixelRatio;

    engineRef.current = Engine.create({
      gravity: { x: 0, y: 0.8 },
    });

    const render: RenderWithText = Render.create({
      element: sceneRef.current,
      engine: engineRef.current,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
        pixelRatio: pixelRatio,
      },
    });

    // Set canvas size accounting for pixel ratio
    render.canvas.width = scaledWidth;
    render.canvas.height = scaledHeight;
    render.canvas.style.width = `${width}px`;
    render.canvas.style.height = `${height}px`;

    // Invisible walls with adjusted positions
    const walls = [
      // Ground
      Bodies.rectangle(width / 2, height + 30, width * 2, 60, {
        isStatic: true,
        render: { visible: false },
      }),
      // Left wall
      Bodies.rectangle(-30, height / 2, 60, height, {
        isStatic: true,
        render: { visible: false },
      }),
      // Right wall
      Bodies.rectangle(width + 30, height / 2, 60, height, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    World.add(engineRef.current.world, walls);

    const renderText = () => {
      const context = render.canvas.getContext("2d");
      if (!context) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      circlesRef.current.forEach((circle: CircleBody) => {
        const { x, y } = circle.position;
        const angle = circle.angle;

        context.save();
        context.translate(x, y);
        context.rotate(angle);

        // Create gradient for inner glow
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

        // Draw circle with inner glow
        context.beginPath();
        context.arc(0, 0, CIRCLE_RADIUS, 0, Math.PI * 2);
        context.fillStyle = gradient;
        context.fill();

        // Draw border
        context.strokeStyle = GLOW_CONFIG.borderColor;
        context.lineWidth = GLOW_CONFIG.borderWidth;
        context.stroke();

        // Add extra glow effect
        context.shadowColor = "rgba(255, 255, 255, 0.5)";
        context.shadowBlur = GLOW_CONFIG.glowSize;
        context.stroke();

        // Reset shadow before drawing text
        context.shadowColor = "transparent";
        context.shadowBlur = 0;

        // Draw text
        // context.font = `${14}px Arial`;
        context.font = `${16}px system-ui, sans-serif`;
        context.fillStyle = "#b6a681";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(circle.render.text, 0, 0);

        context.restore();
      });

      requestAnimationFrame(renderText);
    };

    // Add collision handling for more natural rotation
    Matter.Events.on(engineRef.current!, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA as CircleBody;
        const bodyB = pair.bodyB as CircleBody;

        // Reduced rotation on collision
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

    Matter.Events.on(render, "afterRender", () => {
      renderText();
    });

    const runner = Runner.create();
    Runner.run(runner, engineRef.current);
    Render.run(render);

    const addNewCircle = () => {
      if (remainingNamesRef.current.length > 0) {
        const name = remainingNamesRef.current.shift()!;
        const circle = createCircle(name);
        World.add(engineRef.current!.world, circle);
        circlesRef.current.push(circle);
        processedNamesRef.current.add(name);
      }
    };

    const intervalId = setInterval(addNewCircle, DROP_INTERVAL);

    const handleResize = (): void => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newScaledWidth = newWidth * pixelRatio;
      const newScaledHeight = newHeight * pixelRatio;

      render.canvas.width = newScaledWidth;
      render.canvas.height = newScaledHeight;
      render.canvas.style.width = `${newWidth}px`;
      render.canvas.style.height = `${newHeight}px`;
      render.options.width = newWidth;
      render.options.height = newHeight;

      // Update walls positions
      walls[0].position.x = newWidth / 2;
      walls[1].position.x = -30;
      walls[2].position.x = newWidth + 30;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
      Matter.Events.off(render, "afterRender");
      Render.stop(render);
      Runner.stop(runner);
      if (engineRef.current) {
        // @ts-expect-error: World.clear is not part of the default Matter.Engine
        World.clear(engineRef.current.world);
        Engine.clear(engineRef.current);
      }
      render.canvas.remove();
    };
  }, [pixelRatio]);

  return (
    <>
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
    </>
  );
};

export default CirclePeople;
