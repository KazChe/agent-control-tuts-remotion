import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { theme } from "../theme";

// Plays a screen recording (e.g. the Playwright UI walkthrough from
// scripts/record-ui.mjs) inside the same window chrome as the other panels.
export const UiClip: React.FC<{ src: string; urlLabel: string }> = ({
  src,
  urlLabel,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: theme.pageBg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 1560,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            background: theme.chrome,
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: 10,
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div
              key={c}
              style={{ width: 16, height: 16, borderRadius: 8, background: c }}
            />
          ))}
          <div
            style={{
              flex: 1,
              margin: "0 160px",
              background: "#0d1117",
              borderRadius: 10,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.dim,
              fontFamily: theme.fontMono,
              fontSize: 21,
            }}
          >
            {urlLabel}
          </div>
        </div>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{ width: 1560, display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};
