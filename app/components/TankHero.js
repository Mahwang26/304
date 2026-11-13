"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CINEMATIC_EASE_CSS } from "../lib/ease";
import FocusCallouts from "./FocusCallouts";
import Logo from "./Logo";

const TankScene = dynamic(() => import("./TankScene"), { ssr: false });

function Spotlight() {
  return (
    <svg className="spotlight" viewBox="0 0 3787 2842" fill="none" aria-hidden="true">
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="white"
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter id="spotlight-blur" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

const INTRO_SECONDS = 3.4;

// `ranges` and `callouts` come from the catalog, per tank: { acero, plastico }.
export default function TankHero({ ranges, callouts }) {
  const router = useRouter();
  const plasticoLabel = useRef(null);
  const aceroLabel = useRef(null);
  // [glow, shade] elements per tank; separate so each blends directly with the canvas.
  const plasticoFx = useRef([]);
  const aceroFx = useRef([]);
  const canvasWrap = useRef(null);
  const edge = useRef(null);
  const streak = useRef(null);
  const copy = useRef(null);
  // Shared with the WebGL scene: progress 1 means "no intro / finished".
  const intro = useRef({ pending: false, progress: 1, duration: INTRO_SECONDS, warmupFrames: 3 });
  const cssAnims = useRef([]);
  const [phase, setPhase] = useState("pending");
  const section = useRef(null);
  // Which tank the camera is zoomed onto ("plastico" | "acero" | null). A ref, not state,
  // so the per-frame scene reads it without re-rendering; mirrored to data-focus for CSS.
  const focus = useRef(null);

  // Set once the camera has finished zooming onto a tank: { id, anchors } or null.
  const [settled, setSettled] = useState(null);
  // Where a tank leads. A section of this same page ("/#acero") is scrolled to directly:
  // pushing a hash the address already has would do nothing, so a second click (or one after
  // arriving from the "Acero Inoxidable" link) would stay put.
  const goTo = useCallback(
    (href) => {
      const section = href.startsWith("/#") ? document.getElementById(href.slice(2)) : null;
      if (!section) {
        router.push(href);
        return;
      }
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      history.replaceState(history.state, "", href);
    },
    [router]
  );

  const handleSettle = useCallback((id, anchors) => {
    setSettled(id ? { id, anchors } : null);
  }, []);

  const setFocus = useCallback((id) => {
    focus.current = id;
    if (!section.current) return;
    if (id) section.current.dataset.focus = id;
    else delete section.current.dataset.focus;
  }, []);

  // Plays every time the home screen mounts (once per visit, not on scroll);
  // skipped for reduced-motion users.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the user's motion setting is only known in the browser
      setPhase("done");
      return;
    }
    intro.current = { ...intro.current, pending: true, progress: 0, warmupFrames: 3 };
    setPhase("playing");
  }, []);

  // CSS layers are created paused and scrubbed from the scene's frame-by-frame progress,
  // so a slow frame (shader compile, background tab) can't desync them or skip the start.
  const startCssIntro = useCallback(() => {
    const d = INTRO_SECONDS * 1000;
    const anims = [];
    const add = (anim) => {
      anim.pause();
      anims.push(anim);
      return anim;
    };
    add(canvasWrap.current.animate(
      [
        {
          transform: "scale(1.12) rotate(-3deg)",
          filter: "blur(0px) contrast(1) brightness(0.9)",
        },
        { filter: "blur(1.6px) contrast(1.04) brightness(0.94)", offset: 0.22 },
        { transform: "none", filter: "blur(0px) contrast(1.15) brightness(1.05)" },
      ],
      { duration: d, easing: CINEMATIC_EASE_CSS, fill: "both" }
    ));
    add(edge.current.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: d * 0.75,
      easing: CINEMATIC_EASE_CSS,
      fill: "both",
    }));
    add(streak.current.animate(
      [
        { transform: "translateX(-140%) skewX(-14deg)", opacity: 0 },
        { opacity: 0.9, offset: 0.35 },
        { opacity: 0.6, offset: 0.7 },
        { transform: "translateX(140%) skewX(-14deg)", opacity: 0 },
      ],
      { duration: d * 0.55, delay: d * 0.06, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" }
    ));
    add(copy.current.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: d * 0.3, delay: d * 0.62, easing: CINEMATIC_EASE_CSS, fill: "both" }
    ));
    cssAnims.current = anims;
  }, []);

  const scrubCssIntro = useCallback((progress) => {
    const t = progress * INTRO_SECONDS * 1000;
    for (const anim of cssAnims.current) anim.currentTime = t;
    if (progress >= 1) {
      // Hand control back to the stylesheet (its resting values match the last keyframes),
      // so later CSS states like the focus mode can take effect. The attribute is set
      // directly first so the "playing" start pose can't flash in before React re-renders.
      if (section.current) section.current.dataset.intro = "done";
      for (const anim of cssAnims.current) anim.cancel();
      cssAnims.current = [];
      setPhase("done");
    }
  }, []);

  return (
    <section
      className="tank-hero"
      data-intro={phase}
      ref={section}
      onPointerLeave={() => setFocus(null)}
      // Keyboard users get the same close-up: tabbing out of the hero clears it.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(null);
      }}
    >
      <Spotlight />
      <div className="tank-hero-canvas" ref={canvasWrap} aria-hidden="true">
        <TankScene
          labels={{ plastico: plasticoLabel, acero: aceroLabel }}
          lightFx={{ plastico: plasticoFx, acero: aceroFx }}
          onSelect={goTo}
          intro={intro}
          focus={focus}
          onFocus={setFocus}
          onIntroStart={startCssIntro}
          onIntroProgress={scrubCssIntro}
          onSettle={handleSettle}
        />
      </div>
      {[plasticoFx, aceroFx].flatMap((fx, i) =>
        ["glow", "shade"].map((kind, j) => (
          <div
            key={`${i}-${kind}`}
            className={`tank-light tank-light-${kind}`}
            ref={(el) => {
              fx.current[j] = el;
            }}
            aria-hidden="true"
          />
        ))
      )}
      <div className="reveal-edge" ref={edge} aria-hidden="true" />
      <div className="reveal-streak" ref={streak} aria-hidden="true" />

      <div className="tank-hero-copy" ref={copy}>
        <p className="tank-hero-eyebrow">
          <Logo />
        </p>
        <h1 className="tank-hero-title">Elegí tu tanque</h1>
        <p className="tank-hero-lead">Tanques de acero y plástico de la mejor calidad.</p>
      </div>

      <p className="tank-focus-hint" aria-hidden="true">
        Hacé clic en el tanque para ver su catálogo · Sacá el mouse del recuadro para volver
      </p>

      <Link
        href="/plastico"
        ref={plasticoLabel}
        className="tank-label"
        onFocus={() => intro.current.progress >= 1 && setFocus("plastico")}
      >
        <strong>Plástico</strong>
        <small>Polietileno · {ranges.plastico}</small>
      </Link>
      {/* Each set follows its tank's label in the DOM so Tab goes label → its callout cards. */}
      <FocusCallouts id="plastico" items={callouts.plastico} settled={settled} />
      <Link
        href="/#acero"
        ref={aceroLabel}
        className="tank-label"
        onClick={(e) => {
          e.preventDefault();
          goTo("/#acero");
        }}
        onFocus={() => intro.current.progress >= 1 && setFocus("acero")}
      >
        <strong>Acero inoxidable</strong>
        <small>AISI 304 · {ranges.acero}</small>
      </Link>
      <FocusCallouts id="acero" items={callouts.acero} settled={settled} />
    </section>
  );
}
