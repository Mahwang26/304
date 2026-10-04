import { LOGO_BOX, LOGO_PATH } from "../lib/logo";

// Brand mark. Takes the surrounding text color, so it works on light and dark backgrounds.
export default function Logo({ className }) {
  return (
    <svg
      className={className}
      viewBox={`${LOGO_BOX.x} ${LOGO_BOX.y} ${LOGO_BOX.width} ${LOGO_BOX.height}`}
      role="img"
      aria-label="304"
      fill="currentColor"
    >
      <path d={LOGO_PATH} fillRule="evenodd" />
    </svg>
  );
}
