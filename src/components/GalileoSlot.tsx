import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

// Placeholder for a Galileo console recording that has not been captured
// yet. Swap for <UiClip src="..." urlLabel="..."> once the Playwright
// footage exists (see scripts/record-ui.mjs for the recording pattern).
export const GalileoSlot: React.FC<{ label: string; detail: string }> = ({
  label,
  detail,
}) => (
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
        height: 880,
        borderRadius: 16,
        border: `3px dashed ${theme.panelBorder}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 22,
        fontFamily: theme.fontSans,
      }}
    >
      <div style={{ fontSize: 30, color: theme.cyan, fontFamily: theme.fontMono }}>
        [ Galileo console recording ]
      </div>
      <div style={{ fontSize: 44, fontWeight: 700, color: theme.text }}>
        {label}
      </div>
      <div style={{ fontSize: 28, color: theme.dim, maxWidth: 1100, textAlign: "center" }}>
        {detail}
      </div>
    </div>
  </AbsoluteFill>
);
