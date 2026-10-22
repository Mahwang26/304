"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cinematicEase } from "../lib/ease";
import { LOGO_BOX, LOGO_NAVY, LOGO_PATH } from "../lib/logo";

const TANK_X = 2.3;

const PLASTIC_R = 0.85;
const PLASTIC_BODY_TOP = 1.95;
const PLASTIC_COLLAR_R = 0.5;
const PLASTIC_COLLAR_TOP = 2.4;

// Smooth rotomolded tank: rounded foot, straight wall, sloped shoulder and a raised collar for the lid.
function plasticProfile(radius = PLASTIC_R, bodyTop = PLASTIC_BODY_TOP, collarR = PLASTIC_COLLAR_R) {
  const collarTop = bodyTop + PLASTIC_COLLAR_TOP - PLASTIC_BODY_TOP;
  const pts = [new THREE.Vector2(0, 0)];
  const foot = 0.07;
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * (Math.PI / 2);
    pts.push(new THREE.Vector2(radius - foot + foot * Math.sin(a), foot - foot * Math.cos(a)));
  }
  pts.push(new THREE.Vector2(radius, bodyTop));
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    const ease = Math.sin((t * Math.PI) / 2);
    pts.push(new THREE.Vector2(radius - (radius - collarR - 0.02) * t, bodyTop + 0.3 * ease));
  }
  pts.push(new THREE.Vector2(collarR + 0.02, bodyTop + 0.3));
  pts.push(new THREE.Vector2(collarR, bodyTop + 0.32));
  pts.push(new THREE.Vector2(collarR, collarTop));
  pts.push(new THREE.Vector2(collarR - 0.07, collarTop));
  pts.push(new THREE.Vector2(collarR - 0.07, collarTop - 0.04));
  pts.push(new THREE.Vector2(0, collarTop - 0.04));
  return pts;
}

function makeStickerTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 192;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f4f4f2";
  ctx.fillRect(0, 0, 128, 192);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(12, 14, 104, 16);
  ctx.fillStyle = "#9a9a9a";
  for (let y = 44; y < 180; y += 14) ctx.fillRect(12, y, 60 + ((y * 7) % 44), 5);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const STEEL_R = 0.8;
const STEEL_BODY_TOP = 1.9;
const STEEL_BANDS = [0.2, 0.57, 0.94, 1.31, 1.68];

// Flat-bottomed domestic tank: straight wall with pairs of rolled ridges, rolled rim and shallow dome.
// `roundBottom` swaps the flat base for a dished one that hangs below y = 0, shaped like
// the top's shoulder: for tanks that stand on legs instead of on the floor.
function steelProfile(radius = STEEL_R, bodyTop = STEEL_BODY_TOP, bands = STEEL_BANDS, roundBottom = false) {
  const pts = [];
  if (roundBottom) {
    pts.push(new THREE.Vector2(0, -0.215));
    for (let i = 20; i >= 1; i--) {
      const a = (i / 20) * (Math.PI / 2);
      pts.push(new THREE.Vector2(radius - 0.3 + 0.3 * Math.cos(a), -0.045 - 0.17 * Math.sin(a)));
    }
    pts.push(new THREE.Vector2(radius, -0.045), new THREE.Vector2(radius + 0.012, -0.02), new THREE.Vector2(radius, 0.03));
  } else {
    pts.push(new THREE.Vector2(0, 0), new THREE.Vector2(radius - 0.03, 0), new THREE.Vector2(radius, 0.03));
  }
  const ridge = (y) =>
    bands.reduce((sum, c) => {
      const a = Math.exp(-(((y - (c - 0.035)) / 0.011) ** 2));
      const b = Math.exp(-(((y - (c + 0.035)) / 0.011) ** 2));
      return sum + 0.013 * (a + b);
    }, 0);
  for (let y = 0.035; y <= bodyTop; y += 0.004) {
    pts.push(new THREE.Vector2(radius + ridge(y), y));
  }
  pts.push(new THREE.Vector2(radius + 0.012, bodyTop + 0.02));
  pts.push(new THREE.Vector2(radius, bodyTop + 0.045));
  for (let i = 1; i <= 20; i++) {
    const a = (i / 20) * (Math.PI / 2);
    pts.push(new THREE.Vector2(radius - 0.3 + 0.3 * Math.cos(a), bodyTop + 0.045 + 0.17 * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(0, bodyTop + 0.215));
  return pts;
}

// Brand mark for the tanks, shown through an alpha-tested material. On the plastic tank the
// navy logo is printed straight onto the wall; on steel it sits on an off-white plate,
// because navy disappears against the metal's dark reflections.
const LABEL_ASPECT = LOGO_BOX.width / LOGO_BOX.height;
const PLATE_ASPECT = 2.5;

function makeLabelTexture(plate = false) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = Math.round(1024 / (plate ? PLATE_ASPECT : LABEL_ASPECT));
  const ctx = c.getContext("2d");
  if (plate) {
    ctx.fillStyle = "#f2f0ea";
    ctx.beginPath();
    ctx.roundRect(0, 0, c.width, c.height, 44);
    ctx.fill();
  }
  const pad = plate ? 62 : 10;
  const k = Math.min((c.width - pad * 2) / LOGO_BOX.width, (c.height - pad * 2) / LOGO_BOX.height);
  const dx = (c.width - LOGO_BOX.width * k) / 2 - LOGO_BOX.x * k;
  const dy = (c.height - LOGO_BOX.height * k) / 2 - LOGO_BOX.y * k;
  ctx.setTransform(k, 0, 0, k, dx, dy);
  ctx.fillStyle = LOGO_NAVY;
  ctx.fill(new Path2D(LOGO_PATH), "evenodd");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// White cement disc: speckled color map + radial alpha so it melts into the dark background.
function makeCementTextures() {
  const size = 512;
  const color = document.createElement("canvas");
  color.width = color.height = size;
  const cc = color.getContext("2d");
  cc.fillStyle = "#e4e3df";
  cc.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 70;
    const g = cc.createRadialGradient(x, y, 0, x, y, r);
    const shade = Math.random() > 0.5 ? "255,255,255" : "150,148,142";
    g.addColorStop(0, `rgba(${shade},0.12)`);
    g.addColorStop(1, `rgba(${shade},0)`);
    cc.fillStyle = g;
    cc.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const img = cc.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  cc.putImageData(img, 0, 0);

  const alpha = document.createElement("canvas");
  alpha.width = alpha.height = size;
  const ac = alpha.getContext("2d");
  const g = ac.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.35, "#ffffff");
  g.addColorStop(0.75, "#555555");
  g.addColorStop(1, "#000000");
  ac.fillStyle = g;
  ac.fillRect(0, 0, size, size);

  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  return { map, alphaMap: new THREE.CanvasTexture(alpha) };
}

function CementPad({ position, radius = 2.1, materialRef }) {
  const { map, alphaMap } = useMemo(makeCementTextures, []);
  useEffect(() => () => {
    map.dispose();
    alphaMap.dispose();
  }, [map, alphaMap]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[radius, 96]} />
      <meshStandardMaterial
        ref={materialRef}
        map={map}
        alphaMap={alphaMap}
        transparent
        depthWrite={false}
        roughness={0.95}
      />
    </mesh>
  );
}

// Proportions are configurable so catalog pages can show the narrow (XSlim) variant.
// `labelTheta` is the angle the printed logo faces (0 = straight at +z).
export function PlasticTank({
  radius = PLASTIC_R,
  bodyTop = PLASTIC_BODY_TOP,
  collarR = PLASTIC_COLLAR_R,
  labelHeight = 0.42,
  labelTheta = 0.05,
  ...props
}) {
  const geometry = useMemo(() => new THREE.LatheGeometry(plasticProfile(radius, bodyTop, collarR), 128), [radius, bodyTop, collarR]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const label = useMemo(makeLabelTexture, []);
  const sticker = useMemo(makeStickerTexture, []);
  useEffect(() => () => {
    label.dispose();
    sticker.dispose();
  }, [label, sticker]);
  const cream = { color: "#efe5c6", roughness: 0.5, metalness: 0 };
  const collarTop = bodyTop + PLASTIC_COLLAR_TOP - PLASTIC_BODY_TOP;
  const lidY = collarTop - 0.04;
  const lidR = collarR - 0.08;
  const labelArc = (labelHeight * LABEL_ASPECT) / radius;
  const stickerArc = 0.1275 / radius;
  return (
    <group {...props}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...cream} />
      </mesh>

      <mesh position={[0, lidY + 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[lidR, lidR + 0.01, 0.06, 64]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.55} />
      </mesh>
      <mesh position={[0, lidY + 0.075, 0]} castShadow>
        <cylinderGeometry args={[lidR * 0.24, lidR * 0.29, 0.03, 32]} />
        <meshStandardMaterial color="#141414" roughness={0.5} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.sin(a) * lidR * 0.62, lidY + 0.08, Math.cos(a) * lidR * 0.62]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[0.035, 0.035, lidR * 0.48]} />
            <meshStandardMaterial color="#111111" roughness={0.5} />
          </mesh>
        );
      })}

      <group rotation={[0, 2.3, 0]}>
        <mesh position={[0, bodyTop + 0.24, collarR + 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.24, 0.14]} />
          <meshStandardMaterial {...cream} />
        </mesh>
      </group>
      <group rotation={[0, -0.45, 0]}>
        <mesh position={[0, collarTop - 0.05, collarR + 0.002]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>
      </group>

      <mesh position={[0, bodyTop - 0.53, 0]}>
        <cylinderGeometry
          args={[radius + 0.004, radius + 0.004, labelHeight, 64, 1, true, labelTheta - labelArc / 2, labelArc]}
        />
        <meshStandardMaterial map={label} alphaTest={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, bodyTop - 0.15, 0]}>
        <cylinderGeometry
          args={[radius + 0.004, radius + 0.004, 0.19, 24, 1, true, labelTheta - labelArc / 2 + labelArc * 0.33, stickerArc]}
        />
        <meshStandardMaterial map={sticker} roughness={0.6} />
      </mesh>
    </group>
  );
}

// Proportions are configurable so catalog pages can show other models of the same family.
// `labelBand` is the index of the band gap that carries the logo plate; `labelTheta` is the
// angle the plate faces (0 = straight at +z).
export function SteelTank({
  radius = STEEL_R,
  bodyTop = STEEL_BODY_TOP,
  bands = STEEL_BANDS,
  labelBand = 2,
  labelTheta = -0.03,
  labelOffsetY = 0,
  roundBottom = false,
  ...props
}) {
  const geometry = useMemo(
    () => new THREE.LatheGeometry(steelProfile(radius, bodyTop, bands, roundBottom), 160),
    [radius, bodyTop, bands, roundBottom]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  const label = useMemo(() => makeLabelTexture(true), []);
  useEffect(() => () => label.dispose(), [label]);
  const env = useStudioEnvMap();
  const metal = { envMap: env, envMapIntensity: 0.5, metalness: 1 };
  const lidY = bodyTop + 0.215;
  const labelY = (bands[labelBand] + bands[labelBand + 1]) / 2 + labelOffsetY;
  const labelArc = (0.27 * PLATE_ASPECT) / radius;
  const lidR = radius - 0.33;
  const nozzles = [-2.3, 2.5].map((a) => [Math.sin(a) * (radius - 0.18), bodyTop + 0.13, Math.cos(a) * (radius - 0.18)]);
  return (
    <group {...props}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#e6e9ec" roughness={0.26} {...metal} />
      </mesh>
      <mesh position={[0, lidY + 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[lidR, lidR + 0.02, 0.06, 96]} />
        <meshStandardMaterial color="#dfe3e7" roughness={0.22} {...metal} />
      </mesh>
      <mesh position={[0, lidY + 0.065, 0]} castShadow>
        <cylinderGeometry args={[lidR - 0.05, lidR - 0.01, 0.015, 96]} />
        <meshStandardMaterial color="#eef0f2" roughness={0.18} {...metal} />
      </mesh>
      {nozzles.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.08, 24]} />
          <meshStandardMaterial color="#c9ced3" roughness={0.3} {...metal} />
        </mesh>
      ))}
      <mesh position={[0, labelY, 0]}>
        <cylinderGeometry
          args={[radius + 0.004, radius + 0.004, 0.27, 64, 1, true, labelTheta - labelArc / 2, labelArc]}
        />
        <meshStandardMaterial map={label} alphaTest={0.5} roughness={0.5} metalness={0} />
      </mesh>
      <group rotation={[0, -0.6, 0]}>
        <mesh position={[0, 0.09, radius + 0.002]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.01, 20]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Light positions relative to the tank: straight overhead at rest (short shadow around the base),
// upper-left in front on hover (shadow stretches right and back).
// The light orbits the tank at a fixed distance and height: straight in front at rest
// (shadow hidden behind the tank), sweeping left on hover until it sits 45° front-left,
// which throws the shadow 45° back-right.
const LIGHT_DISTANCE = 4.5;
const LIGHT_HEIGHT = 5;
const LIGHT_END_ANGLE = Math.PI / 4;
const SWEEP_IN_SECONDS = 2.6;
const SWEEP_OUT_SECONDS = 1.4;

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

// Ramp that stays at 0 until `from`, then eases up to 1 at the end of the reveal.
function rampAfter(e, from) {
  return smoothstep(Math.min(1, Math.max(0, (e - from) / (1 - from))));
}

const RIM_MAX = 170;
const RIM_POSITION = [-2.4, 4.4, -2.8];

// Tower line: a short, round-bottomed steel tank raised on three hairpin ("V") legs. Each
// leg is two arms that leave the tank's lower rim at separate points and meet in a rounded
// tip on the floor. Neighbouring legs are tied by a brace between the arms that face each other.
export const TOWER_STAND = { height: 1.05, footR: 1.04 };
const TOWER_LEG_ANGLES = [Math.PI / 3, Math.PI, (5 * Math.PI) / 3]; // from +z: front-right, back, front-left
const TOWER_ARM_SPREAD = 0.4; // radians between a leg's center line and each of its arms
const TOWER_BRACE_Y = 0.56; // fraction of the stand height where the braces sit

const onCircle = (angle, r, y) => new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r);

export function TowerSteelTank({ radius = STEEL_R, ...tank }) {
  const env = useStudioEnvMap();
  const metal = { color: "#c9ced3", roughness: 0.3, metalness: 1, envMap: env, envMapIntensity: 0.5 };
  const { height: h, footR } = TOWER_STAND;

  const { legGeometries, braces } = useMemo(() => {
    const tube = 0.027;
    // Each arm runs from the tank's lower rim down to the leg's foot.
    const legs = TOWER_LEG_ANGLES.map((angle) => {
      const foot = onCircle(angle, footR, tube);
      const arms = [-1, 1].map((side) => onCircle(angle + side * TOWER_ARM_SPREAD, radius + 0.004, h - 0.03));
      return { foot, arms };
    });
    const legGeometries = legs.map(({ foot, arms: [a, b] }) => {
      const path = new THREE.CurvePath();
      const nearA = foot.clone().lerp(a, 0.09);
      const nearB = foot.clone().lerp(b, 0.09);
      path.add(new THREE.LineCurve3(a, nearA));
      path.add(new THREE.QuadraticBezierCurve3(nearA, foot, nearB));
      path.add(new THREE.LineCurve3(nearB, b));
      return new THREE.TubeGeometry(path, 96, tube, 12, false);
    });
    // Point of an arm at the brace height.
    const atBrace = (leg, armIndex) => {
      const top = leg.arms[armIndex];
      const y = h * TOWER_BRACE_Y;
      return leg.foot.clone().lerp(top, (y - leg.foot.y) / (top.y - leg.foot.y));
    };
    // Arm 1 of each leg faces arm 0 of the next one around the tank.
    const braces = legs.map((leg, i) => {
      const from = atBrace(leg, 1);
      const to = atBrace(legs[(i + 1) % legs.length], 0);
      const dir = to.clone().sub(from);
      return {
        mid: from.clone().add(to).multiplyScalar(0.5),
        length: dir.length(),
        quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
      };
    });
    return { legGeometries, braces };
  }, [h, footR, radius]);
  useEffect(() => () => legGeometries.forEach((g) => g.dispose()), [legGeometries]);

  return (
    <group>
      {legGeometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} castShadow>
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      {braces.map((b, i) => (
        <mesh key={i} position={b.mid} quaternion={b.quat} castShadow>
          <cylinderGeometry args={[0.016, 0.016, b.length, 12]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}

      <SteelTank radius={radius} {...tank} roundBottom position={[0, h, 0]} />
    </group>
  );
}

// Horizontal tank on its support frame (Horizonte line). The shell is a lathe around the
// tank's long axis, laid on its side: inside the rotated group, local +Y runs along the
// tank and local +X points up.
const HORIZ_R = 0.75;
const HORIZ_HALF = 0.9;
const HORIZ_CAP = 0.28;
const HORIZ_RIDGES = [-0.74, -0.38, 0.38, 0.74];
const HORIZ_CENTER_Y = 0.9;
const HORIZ_FRAME = { x: 0.78, z: 0.72, tube: 0.045, top: 0.66, cradle: 0.127 };
export const HORIZONTAL_TANK_SIZE = { halfWidth: HORIZ_HALF + HORIZ_CAP, height: HORIZ_CENTER_Y + HORIZ_R + 0.12 };

function horizontalProfile() {
  const pts = [];
  const cap = (i) => {
    const a = (i / 24) * (Math.PI / 2);
    return [HORIZ_R * Math.sin(a), HORIZ_HALF + HORIZ_CAP * Math.cos(a)];
  };
  for (let i = 0; i <= 24; i++) {
    const [r, y] = cap(i);
    pts.push(new THREE.Vector2(r, -y));
  }
  const bump = (y, c, w) => Math.exp(-(((y - c) / w) ** 2));
  const ridges = (y) =>
    HORIZ_RIDGES.reduce((sum, c) => sum + 0.011 * (bump(y, c - 0.04, 0.01) + bump(y, c, 0.01) + bump(y, c + 0.04, 0.01)), 0);
  const rims = (y) => 0.014 * (bump(y, -HORIZ_HALF + 0.03, 0.02) + bump(y, HORIZ_HALF - 0.03, 0.02));
  for (let y = -HORIZ_HALF + 0.004; y < HORIZ_HALF; y += 0.004) {
    pts.push(new THREE.Vector2(HORIZ_R + ridges(y) + rims(y), y));
  }
  for (let i = 24; i >= 0; i--) {
    const [r, y] = cap(i);
    pts.push(new THREE.Vector2(r, y));
  }
  return pts;
}

export function HorizontalSteelTank(props) {
  const geometry = useMemo(() => new THREE.LatheGeometry(horizontalProfile(), 160), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // The plate wraps around the shell, so the artwork is turned to read along the tank.
  const label = useMemo(() => {
    const tex = makeLabelTexture(true);
    tex.center.set(0.5, 0.5);
    tex.rotation = -Math.PI / 2;
    return tex;
  }, []);
  useEffect(() => () => label.dispose(), [label]);
  const env = useStudioEnvMap();
  const metal = { envMap: env, envMapIntensity: 0.5, metalness: 1 };
  const frameMetal = { color: "#a4a8ad", roughness: 0.5, metalness: 0.7, envMap: env, envMapIntensity: 0.35 };

  const plateWidth = 0.6;
  const plateArc = plateWidth / PLATE_ASPECT / HORIZ_R;
  const { x: fx, z: fz, tube: t, top, cradle } = HORIZ_FRAME;
  const bars = [
    // legs
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ size: [t, top + t / 2, t], pos: [sx * fx, (top + t / 2) / 2, sz * fz] }))),
    // long rails: floor, cradle height and top
    ...[t / 2, cradle, top].flatMap((y) => [-1, 1].map((sz) => ({ size: [fx * 2 + t, t, t], pos: [0, y, sz * fz] }))),
    // cross rails: floor ends, plus the cradle the shell rests on
    ...[-1, 1].map((sx) => ({ size: [t, t, fz * 2], pos: [sx * fx, t / 2, 0] })),
    ...[-fx, 0, fx].map((x) => ({ size: [t, t, fz * 2], pos: [x, cradle, 0] })),
  ];

  return (
    <group {...props}>
      <group position={[0, HORIZ_CENTER_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#e6e9ec" roughness={0.26} {...metal} />
        </mesh>
        {/* inspection hatch on top */}
        <mesh position={[HORIZ_R - 0.005, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.62, 0.46]} />
          <meshStandardMaterial color="#dfe3e7" roughness={0.24} {...metal} />
        </mesh>
        <mesh position={[HORIZ_R + 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.07, 64]} />
          <meshStandardMaterial color="#dfe3e7" roughness={0.22} {...metal} />
        </mesh>
        <mesh position={[HORIZ_R + 0.095, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.23, 0.23, 0.025, 64]} />
          <meshStandardMaterial color="#eef0f2" roughness={0.18} {...metal} />
        </mesh>
        <mesh>
          <cylinderGeometry
            args={[HORIZ_R + 0.004, HORIZ_R + 0.004, plateWidth, 24, 1, true, 0.5 - plateArc / 2, plateArc]}
          />
          <meshStandardMaterial map={label} alphaTest={0.5} roughness={0.5} metalness={0} />
        </mesh>
      </group>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial {...frameMetal} />
        </mesh>
      ))}
    </group>
  );
}

export function makeBlobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.55, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// Two light-independent blob shadows: a small dark contact shadow hugging the base
// and a wide, faint ambient one that grounds the tank.
function GroundShadows({ radius, contact, ambient }) {
  const tex = useMemo(makeBlobTexture, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <circleGeometry args={[radius * 2.6, 64]} />
        <meshBasicMaterial ref={ambient} map={tex} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <circleGeometry args={[radius * 1.25, 64]} />
        <meshBasicMaterial ref={contact} map={tex} transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// Hovering focuses the tank (camera zooms onto it, its key light sweeps); click navigates.
// Also ramps its rim light / ground shadows / CSS light overlay with the reveal, and pins
// its HTML label and light overlay to the tank on screen each frame.
function ClickableTank({
  id,
  focus,
  onFocus,
  position,
  padY,
  onSelect,
  label,
  lightFx,
  height,
  radius,
  intro,
  children,
}) {
  const body = useRef();
  const bodyMaterials = useRef(null);
  const pad = useRef();
  const light = useRef();
  const target = useRef();
  const rim = useRef();
  const rimTarget = useRef();
  const contact = useRef();
  const ambient = useRef();
  const sweep = useRef(0);
  const dim = useRef(0);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    light.current.target = target.current;
    rim.current.target = rimTarget.current;
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((state, dt) => {
    const focused = focus.current === id;
    if (reducedMotion) {
      sweep.current = focused ? 1 : 0;
    } else if (focused) {
      sweep.current = Math.min(1, sweep.current + dt / SWEEP_IN_SECONDS);
    } else {
      sweep.current = Math.max(0, sweep.current - dt / SWEEP_OUT_SECONDS);
    }
    const e = smoothstep(sweep.current);
    const theta = e * LIGHT_END_ANGLE;

    // When the other tank is focused, this one fades into the dark so the close-up stays clean.
    const other = focus.current !== null && !focused;
    dim.current += ((other ? 1 : 0) - dim.current) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
    const lit = 1 - 0.85 * dim.current;
    const fade = 1 - dim.current;

    // Fade the whole tank (not just its light: the steel keeps reflecting the room).
    if (!bodyMaterials.current) {
      bodyMaterials.current = [];
      body.current.traverse((o) => {
        if (o.isMesh) bodyMaterials.current.push(o);
      });
    }
    for (const mesh of bodyMaterials.current) {
      // Only transparent while actually fading, so the opaque tank keeps normal draw order.
      mesh.material.transparent = fade < 0.999;
      mesh.material.opacity = fade;
      mesh.castShadow = fade > 0.5;
      mesh.visible = fade > 0.02;
    }
    pad.current.opacity = fade;

    // Reveal-driven lighting: key light brightens early, rim light and shadows build up later.
    const reveal = cinematicEase(intro.current.progress);
    const l = light.current;
    l.position.set(-Math.sin(theta) * LIGHT_DISTANCE, LIGHT_HEIGHT, Math.cos(theta) * LIGHT_DISTANCE);
    l.intensity = (110 + 70 * e) * (0.55 + 0.45 * reveal) * lit;
    rim.current.intensity = RIM_MAX * rampAfter(reveal, 0.25) * lit;
    contact.current.opacity = 0.55 * rampAfter(reveal, 0.4) * fade;
    ambient.current.opacity = 0.25 * rampAfter(reveal, 0.3) * fade;

    const { width: W, height: H } = state.size;
    const toScreen = (x, y, z) => {
      anchor.set(position[0] + x, y, position[2] + z).project(state.camera);
      return [((anchor.x + 1) / 2) * W, ((1 - anchor.y) / 2) * H];
    };

    const fxEls = lightFx.current;
    if (fxEls.length) {
      const [, top] = toScreen(0, height, 0);
      const [, bottom] = toScreen(0, 0, radius);
      const [left] = toScreen(-radius, height / 2, 0);
      const [right] = toScreen(radius, height / 2, 0);
      const w = right - left;
      const h = bottom - top;
      const transform = `translate(${left}px, ${top}px) scale(${w / 100}, ${h / 100})`;
      const opacity = String(rampAfter(reveal, 0.15) * (1 - dim.current));
      for (const fxEl of fxEls) {
        if (!fxEl) continue;
        fxEl.style.transform = transform;
        fxEl.style.opacity = opacity;
      }
    }

    const el = label.current;
    if (!el) return;
    const [lx, ly] = toScreen(0, 0, 0.9);
    el.style.transform = `translate(${lx}px, ${ly + 12}px) translate(-50%, 0)`;
    // While another tank is focused this one is (mostly) off screen: hide its label.
    const visible = intro.current.progress >= 0.85 && (!focus.current || focused);
    el.style.opacity = visible ? "1" : "0";
    el.style.pointerEvents = visible ? "" : "none";
    el.dataset.hover = focused ? "true" : "false";
  });

  return (
    <group position={position}>
      <spotLight
        ref={light}
        position={[0, LIGHT_HEIGHT, LIGHT_DISTANCE]}
        intensity={110}
        angle={0.65}
        penumbra={1}
        decay={2}
        distance={16}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={14}
        shadow-blurSamples={24}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <object3D ref={target} position={[0, 0.7, 0]} />
      <spotLight
        ref={rim}
        position={RIM_POSITION}
        intensity={0}
        angle={0.45}
        penumbra={1}
        decay={2}
        distance={14}
      />
      <object3D ref={rimTarget} position={[0.3, height * 0.6, 0]} />
      <CementPad position={[0, padY, 0]} radius={1.9} materialRef={pad} />
      <GroundShadows radius={radius} contact={contact} ambient={ambient} />
      <group
        ref={body}
        onClick={(e) => {
          e.stopPropagation();
          if (intro.current.progress < 1) return;
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (intro.current.progress < 1) return;
          document.body.style.cursor = "pointer";
          if (focus.current !== id) onFocus(id);
        }}
        // Focus is sticky: the zoom moves the tank out from under the cursor, so un-hovering
        // must not unfocus it (that would bounce the camera). It clears when the pointer
        // leaves the hero or clicks empty space.
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        {children}
      </group>
    </group>
  );
}

// Reflections only for the steel, so the mouse light stays the dominant light source.
function useStudioEnvMap() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return env;
}

// Wide spacing on landscape screens; closer together on portrait so the tanks don't shrink.
function useTankX() {
  const size = useThree((s) => s.size);
  return size.width / size.height < 1 ? 1.15 : TANK_X;
}

// Seconds-ish time constant of the hover zoom: larger = slower, more progressive.
const FOCUS_ZOOM_RATE = 2.2;
// How close (world units) the camera must get to the close-up pose to count as settled.
const SETTLE_EPSILON = 0.04;
// Tank-body heights of the callout anchors, top to bottom (one per model card).
const CALLOUT_HEIGHTS = { acero: [1.62, 1.2, 0.78, 0.36], plastico: [1.62, 1.2, 0.78, 0.36] };

// Final framing adapts to the viewport. While the intro runs, the camera starts between
// the tanks and pulls back to that framing on the cinematic curve. Afterwards it eases
// toward a close-up of the focused tank (framed off-center) or back to the overview.
function ResponsiveCamera({ intro, focus, onIntroStart, onIntroProgress, onSettle }) {
  const { camera, size, scene } = useThree();
  const tankX = useTankX();
  const settled = useRef(null);
  const poses = useMemo(
    () => ({
      finalPos: new THREE.Vector3(),
      finalLook: new THREE.Vector3(0, 1.05, 0),
      macroPos: new THREE.Vector3(),
      macroLook: new THREE.Vector3(),
      focusDistance: 6,
      focusOffset: 0,
      focusPos: new THREE.Vector3(),
      focusLook: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    []
  );
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Depends on width/height only: the `size` object also carries scroll offsets, and
  // re-running this on scroll would yank the camera back to the overview.
  const { width, height } = size;
  useEffect(() => {
    const aspect = width / height;
    // Back off until both tanks (plus margin) fit the horizontal field of view.
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const z = Math.max(9.6, (tankX + 1.1) / (halfFov * aspect));
    poses.finalPos.set(0, 4.4, z);

    // Close-up: the tank fills ~70% of the height and sits on a side third of the frame
    // (aiming the camera beside it). Portrait screens can't fit it off-center, so
    // there it stays centered and the camera backs off enough to keep it whole.
    const distance = Math.max(6.6, 1.5 / (halfFov * aspect));
    const halfWidth = distance * halfFov * aspect;
    poses.focusDistance = distance;
    poses.focusOffset = aspect < 1 ? 0 : Math.min(halfWidth * 0.42, halfWidth - 1.1);

    // Start low and close in the gap between the tanks, facing the back wall, so neither
    // tank is in frame; the pull-back reveals them from the sides.
    poses.macroPos.set(0, 1.2, 1);
    poses.macroLook.set(0, 1.25, -3);

    if (scene.fog) {
      scene.fog.near = z + 1;
      scene.fog.far = z + 8;
    }

    // No intro running and no tank focused (reduced motion, or a resize afterwards): jump to
    // the overview instead of drifting in. A focused close-up just eases to its new framing.
    if (!intro.current.pending && intro.current.progress >= 1 && !focus.current) {
      camera.position.copy(poses.finalPos);
      poses.look.copy(poses.finalLook);
      camera.lookAt(poses.look);
    }
  }, [camera, width, height, scene, tankX, poses, intro, focus]);

  useFrame((_, dt) => {
    const it = intro.current;
    if (it.pending) {
      // Hold on the opening frame until the tab is visible and the first frames
      // (shader compilation) are out of the way.
      if (document.hidden) return;
      if (it.warmupFrames > 0) {
        it.warmupFrames -= 1;
      } else {
        it.pending = false;
        onIntroStart();
      }
    } else if (it.progress < 1) {
      // Advance per frame with a capped step: a stalled frame slows the intro instead of skipping it.
      it.progress = Math.min(1, it.progress + Math.min(dt, 1 / 30) / it.duration);
      onIntroProgress(it.progress);
    }
    if (it.progress < 1) {
      const e = cinematicEase(it.progress);
      camera.position.lerpVectors(poses.macroPos, poses.finalPos, e);
      poses.look.lerpVectors(poses.macroLook, poses.finalLook, e);
      camera.lookAt(poses.look);
      return;
    }

    let targetPos = poses.finalPos;
    let targetLook = poses.finalLook;
    if (focus.current) {
      // Plastic is framed on the right third, steel on the left third
      // (aiming the camera to the opposite side of the tank).
      const plastic = focus.current === "plastico";
      const x = plastic ? -tankX : tankX;
      const aimX = plastic ? x - poses.focusOffset : x + poses.focusOffset;
      // Aim a bit below mid-height so the tank sits higher and its label stays in frame.
      poses.focusLook.set(aimX, 0.9, 0);
      poses.focusPos.set(aimX, 1.95, poses.focusDistance);
      targetPos = poses.focusPos;
      targetLook = poses.focusLook;
    }
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * FOCUS_ZOOM_RATE);
    camera.position.lerp(targetPos, k);
    poses.look.lerp(targetLook, k);
    camera.lookAt(poses.look);

    // Report when the close-up has come to rest, with the on-screen positions of the
    // callout anchor points on the tank (so HTML callouts can be drawn to them).
    const resting =
      focus.current &&
      camera.position.distanceTo(targetPos) < SETTLE_EPSILON &&
      poses.look.distanceTo(targetLook) < SETTLE_EPSILON
        ? focus.current
        : null;
    if (resting !== settled.current) {
      settled.current = resting;
      let anchors = null;
      if (resting) {
        camera.updateMatrixWorld();
        const plastic = resting === "plastico";
        const x = plastic ? -tankX : tankX;
        const r = plastic ? PLASTIC_R : STEEL_R;
        const side = plastic ? -1 : 1; // callouts sit on the empty side of the frame
        const points = CALLOUT_HEIGHTS[resting].map((h) => new THREE.Vector3(x + side * r * 0.8, h, r * 0.6));
        anchors = points.map((p) => {
          p.project(camera);
          return [((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height];
        });
      }
      onSettle(resting, anchors);
    }
  });
  return null;
}

function Tanks({ labels, lightFx, onSelect, intro, focus, onFocus }) {
  const x = useTankX();
  return (
    <>
      <ClickableTank
        id="plastico"
        focus={focus}
        onFocus={onFocus}
        position={[-x, 0, 0]}
        padY={0.002}
        label={labels.plastico}
        lightFx={lightFx.plastico}
        height={PLASTIC_COLLAR_TOP + 0.08}
        radius={PLASTIC_R}
        intro={intro}
        onSelect={() => onSelect("/plastico")}
      >
        <PlasticTank />
      </ClickableTank>
      <ClickableTank
        id="acero"
        focus={focus}
        onFocus={onFocus}
        position={[x, 0, 0]}
        padY={0.003}
        label={labels.acero}
        lightFx={lightFx.acero}
        height={STEEL_BODY_TOP + 0.3}
        radius={STEEL_R}
        intro={intro}
        onSelect={() => onSelect("/#acero")}
      >
        <SteelTank labelBand={3} />
      </ClickableTank>
    </>
  );
}

// Photo-studio sweep: floor curving seamlessly into the back wall, so there's no horizon line.
function Cyclorama() {
  const geometry = useMemo(() => {
    const FLOOR_FRONT = 12;
    const FLOOR_BACK = -2.2;
    const R = 3;
    const floorLen = FLOOR_FRONT - FLOOR_BACK;
    const arcLen = (Math.PI / 2) * R;
    const total = floorLen + arcLen + 10;
    const g = new THREE.PlaneGeometry(50, total, 1, 160);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const s = (pos.getY(i) / total + 0.5) * total;
      let y;
      let z;
      if (s <= floorLen) {
        y = 0;
        z = FLOOR_FRONT - s;
      } else if (s <= floorLen + arcLen) {
        const a = (s - floorLen) / R;
        y = R - R * Math.cos(a);
        z = FLOOR_BACK - R * Math.sin(a);
      } else {
        y = R + (s - floorLen - arcLen);
        z = FLOOR_BACK - R;
      }
      pos.setXYZ(i, pos.getX(i), y, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#3a3a3a" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function TankScene({
  labels,
  lightFx,
  onSelect,
  intro,
  focus,
  onFocus,
  onIntroStart,
  onIntroProgress,
  onSettle,
}) {
  return (
    <Canvas
      onPointerMissed={() => onFocus(null)}
      shadows="variance"
      dpr={[1, 2]}
      // Measure layout size, not the bounding box: the intro scales/rotates the wrapper with CSS,
      // which would otherwise make the canvas size itself too large until the next scroll.
      resize={{ offsetSize: true }}
      camera={{ fov: 32, position: [0, 1.9, 7.4] }}
      gl={{ antialias: true, alpha: true, toneMappingExposure: 0.8 }}
    >
      <fog attach="fog" args={["#0a0a0a", 9, 17]} />
      <ResponsiveCamera
        intro={intro}
        focus={focus}
        onIntroStart={onIntroStart}
        onIntroProgress={onIntroProgress}
        onSettle={onSettle}
      />
      <hemisphereLight args={["#9aa3ad", "#0a0a0a", 0.12]} />
      <directionalLight position={[-3, 4, -4]} intensity={0.25} />
      <directionalLight position={[0, 3, 10]} intensity={0.45} />

      <Tanks
        labels={labels}
        lightFx={lightFx}
        onSelect={onSelect}
        intro={intro}
        focus={focus}
        onFocus={onFocus}
      />

      <Cyclorama />
    </Canvas>
  );
}
