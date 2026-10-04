export const CINEMATIC_EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

// JS twin of a CSS cubic-bezier, so the WebGL camera and the CSS layers follow the same curve.
export function cubicBezier(x1, y1, x2, y2) {
  const sample = (a1, a2, t) => {
    const u = 1 - t;
    return 3 * u * u * t * a1 + 3 * u * t * t * a2 + t * t * t;
  };
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (sample(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return sample(y1, y2, (lo + hi) / 2);
  };
}

export const cinematicEase = cubicBezier(0.16, 1, 0.3, 1);
