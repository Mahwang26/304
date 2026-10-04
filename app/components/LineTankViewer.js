"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SteelTank, HorizontalSteelTank, HORIZONTAL_TANK_SIZE, makeBlobTexture } from "./TankScene";

const HALF_FOV_TAN = Math.tan((30 / 2) * (Math.PI / 180));

// Overall footprint of each tank kind, used to frame it and size its ground shadow.
function tankExtent(tank) {
  if (tank.kind === "horizontal") {
    const { halfWidth, height } = HORIZONTAL_TANK_SIZE;
    return { halfWidth, height, baseYaw: -0.5, sway: 0.2, lift: 0.2, shadow: [halfWidth * 1.25, 1.15] };
  }
  const radius = tank.radius ?? 0.8;
  return { halfWidth: radius, height: tank.bodyTop + 0.28, baseYaw: 0, sway: 0.38, lift: 0.12, shadow: [radius * 1.5, radius * 1.5] };
}

// Tank on a turntable: sways gently on its own and can be dragged to rotate.
function Stage({ tank, drag }) {
  const turntable = useRef();
  const yaw = useRef(0);
  const { camera, size } = useThree();
  const blob = useMemo(makeBlobTexture, []);
  useEffect(() => () => blob.dispose(), [blob]);
  const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const extent = useMemo(() => tankExtent(tank), [tank]);

  // Back the camera off until the tank fits both ways, whatever the viewer's shape.
  const { width, height } = size;
  useEffect(() => {
    const halfH = extent.height / 2 + 0.3;
    const halfW = extent.halfWidth + 0.25;
    const dist = Math.max(halfH / HALF_FOV_TAN, halfW / (HALF_FOV_TAN * (width / height)));
    camera.position.set(0, dist * extent.lift, dist);
    camera.lookAt(0, 0, 0);
  }, [camera, width, height, extent]);

  useFrame((state, dt) => {
    const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * extent.sway;
    yaw.current += (drag.current - yaw.current) * (1 - Math.exp(-dt * 8));
    turntable.current.rotation.y = extent.baseYaw + sway + yaw.current;
  });

  return (
    // Centered on the origin so the camera and the spotlights aim at mid-height.
    <group position={[0, -extent.height / 2, 0]}>
      <group ref={turntable}>
        {tank.kind === "horizontal" ? <HorizontalSteelTank /> : <SteelTank {...tank} labelTheta={0} />}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} scale={[extent.shadow[0], extent.shadow[1], 1]}>
          <circleGeometry args={[1, 64]} />
          <meshBasicMaterial map={blob} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[Math.max(...extent.shadow) * 1.8, 64]} />
        <meshBasicMaterial color="#9fb4c4" alphaMap={blob} transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function LineTankViewer({ tank }) {
  const drag = useRef(0);
  const last = useRef(null);

  return (
    <div
      className={"line-viewer" + (tank.kind === "horizontal" ? " line-viewer--wide" : "")}
      onPointerDown={(e) => {
        last.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (last.current === null) return;
        drag.current += (e.clientX - last.current) * 0.012;
        last.current = e.clientX;
      }}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    >
      <Canvas
        dpr={[1, 2]}
        resize={{ offsetSize: true }}
        camera={{ fov: 30, position: [0, 0.9, 7.4] }}
        gl={{ antialias: true, alpha: true, toneMappingExposure: 0.9 }}
      >
        <hemisphereLight args={["#9aa3ad", "#0a0a0a", 0.2]} />
        <directionalLight position={[0, 3, 10]} intensity={0.5} />
        <spotLight position={[-3.6, 5.2, 4.6]} intensity={170} angle={0.6} penumbra={1} decay={2} distance={18} />
        <spotLight position={[3.4, 3.8, -3.2]} intensity={170} angle={0.6} penumbra={1} decay={2} distance={16} />
        <Stage tank={tank} drag={drag} />
      </Canvas>
    </div>
  );
}
