import React from "react";
import hummingbird from "./hummingbird_flower.png";

export default function HummingbirdFlyer({ width = 260, label }) {
  return (
    <div className="hbf-stage" style={{ width, height: width * 0.86 }}>
      <div className="hbf-wrap">
        <img src={hummingbird} alt="Hummingbird drinking from a flower" className="hbf-img" />
        <div className="hbf-sparkle">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="6" cy="6" r="1.6" fill="currentColor" />
            <circle cx="16" cy="14" r="1.1" fill="currentColor" />
            <circle cx="2" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>
      {label && <div className="hbf-label">{label}</div>}

      <style>{`
        .hbf-stage {
          position: relative;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .hbf-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          animation: hbf-fly 3.4s ease-in-out infinite;
        }
        .hbf-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          animation: hbf-flutter 0.15s ease-in-out infinite;
          display: block;
        }
        .hbf-sparkle {
          position: absolute;
          left: 64%;
          top: 26%;
          color: #fff;
          opacity: 0;
          animation: hbf-sparkle 3.4s ease-in-out infinite;
        }
        .hbf-label {
          margin-top: 10px;
          font-size: 13px;
          opacity: 0.7;
        }

        @keyframes hbf-fly {
          0%          { transform: translate(-70px, 8px) rotate(-2deg); }
          22%         { transform: translate(0, 0) rotate(0deg); }
          30%, 48%    { transform: translate(5px, 4px) rotate(2deg); }
          62%         { transform: translate(0, 0) rotate(0deg); }
          80%, 100%   { transform: translate(-70px, 8px) rotate(-2deg); }
        }
        @keyframes hbf-flutter {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(0.985); }
        }
        @keyframes hbf-sparkle {
          0%, 30%   { opacity: 0; }
          34%, 48%  { opacity: 1; }
          52%, 100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hbf-wrap, .hbf-img, .hbf-sparkle { animation: none !important; }
        }
      `}</style>
    </div>
  );
}