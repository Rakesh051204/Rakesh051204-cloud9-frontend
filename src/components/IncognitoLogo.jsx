import { useEffect, useRef, useState } from 'react';

/**
 * IncognitoLogo
 * Real traced vector of Stoic's owl mark (potrace'd from the source PNG,
 * not hand-drawn). Pure monochrome — white/gray only, no color accents —
 * to match ChatTopBar's Grok-style surface.
 *
 * Usage (already matches your ChatTopBar.jsx):
 *   <IncognitoLogo size={18} />                 // inside the toggle button
 *   <IncognitoLogo size={14} />                  // inside the incognito banner
 *
 * The parent button already carries active state via the
 * `incognito-toggle--active` class, so this component also accepts an
 * optional `active` prop if you want the mark itself to brighten when on:
 *   <IncognitoLogo size={18} active={incognito} />
 *
 * `bg` should match whatever surface it's sitting on, so the blink lid
 * blends in exactly — top bar is #000000, the banner strip is #0A0A0A.
 */
export default function IncognitoLogo({ size = 32, active = false, bg = '#000000' }) {
  const [blinking, setBlinking] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function scheduleBlink() {
      const delay = 2600 + Math.random() * 3200; // 2.6s - 5.8s, irregular
      timeoutRef.current = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <span className="stoic-owl-wrap" style={{ width: size, height: (size * 184) / 258 }}>
      <svg
        viewBox="0 0 258 184"
        width={size}
        height={(size * 184) / 258}
        className={`stoic-owl-svg${active ? ' is-active' : ''}`}
      >
        {/* Traced directly from the source logo PNG via potrace */}
        <g transform="translate(0,184) scale(0.1,-0.1)">
          <path
            className="owl-mark"
            fillRule="evenodd"
            d="M840 1410 c-17 -61 -15 -159 4 -204 29 -69 56 -95 215 -200 213 -142
            266 -201 338 -385 8 -21 11 -17 37 48 54 138 119 207 331 348 139 93 178 131
            200 192 18 51 18 140 1 196 l-12 40 -8 -40 c-11 -61 -53 -140 -89 -168 -17
            -13 -60 -38 -95 -56 l-62 -31 -40 20 c-130 66 -384 64 -522 -5 -27 -13 -34
            -12 -86 11 -113 50 -164 109 -186 215 l-13 64 -13 -45z M901 972 c-40 -77 -39
            -254 2 -373 15 -41 27 -93 27 -115 1 -51 29 -111 74 -153 38 -37 63 -36 29 2
            -30 32 -45 66 -39 84 5 12 12 10 37 -11 36 -31 49 -26 49 17 0 43 19 22 27
            -29 8 -52 13 -57 125 -131 53 -35 113 -82 132 -103 20 -22 37 -40 39 -40 1 0
            32 28 67 63 36 34 98 80 138 101 40 22 91 55 113 74 32 28 42 32 54 22 12 -10
            16 -9 21 6 16 43 36 81 63 119 50 67 76 165 76 280 0 103 -19 195 -39 195 -7
            0 -26 -12 -44 -27 l-32 -28 16 -45 c45 -127 -50 -268 -188 -278 -31 -2 -72 1
            -89 7 -40 14 -35 21 -95 -134 -26 -66 -50 -124 -54 -129 -9 -10 -42 60 -69
            148 -11 35 -26 79 -35 100 l-15 37 -30 -16 c-42 -21 -124 -19 -170 4 -48 25
            -95 79 -111 126 -12 36 -9 127 5 171 5 16 -2 26 -34 47 -37 25 -41 25 -50 9z
            M1056 858 c-19 -71 11 -139 71 -165 42 -17 98 -12 122 11 13 14 13 18 -3 35
            -13 14 -26 18 -55 14 -47 -6 -71 15 -71 62 0 24 -7 37 -25 49 -31 20 -32 20
            -39 -6z M1711 861 c-17 -13 -22 -23 -16 -40 4 -14 1 -31 -10 -48 -15 -22 -22
            -25 -59 -21 -35 4 -45 2 -56 -15 -10 -17 -10 -23 6 -34 51 -37 141 -17 169 38
            21 40 18 140 -4 139 -3 0 -17 -9 -30 -19z"
          />
        </g>

        {/* Blink lids: filled with the surface color behind the icon, sized
            to the real eye sockets (measured off the source PNG). Scaled to
            0 at rest so the traced eyes show through; on blink they sweep
            up to fully cover the eye like a closing lid. */}
        <g className={`owl-lids${blinking ? ' is-blinking' : ''}`}>
          <ellipse className="owl-lid" cx="109" cy="100" rx="19" ry="20" />
          <ellipse className="owl-lid" cx="163" cy="100" rx="19" ry="20" />
        </g>
      </svg>

      <style>{`
        .stoic-owl-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .owl-mark {
          fill: #C9C9C9; /* matches icon-btn's default #A0A0A0-#E5E5E5 range */
          transition: fill 0.25s ease;
        }
        .stoic-owl-svg.is-active .owl-mark {
          fill: #FFFFFF; /* brighten only, no color accent */
        }
        .icon-btn:hover .owl-mark {
          fill: #FFFFFF;
        }

        .owl-lid {
          fill: ${bg};
          transform-box: fill-box;
          transform-origin: center;
          transform: scaleY(0);
          transition: transform 0.09s ease-in;
        }
        .owl-lids.is-blinking .owl-lid {
          transform: scaleY(1);
          transition: transform 0.06s ease-out;
        }
      `}</style>
    </span>
  );
}