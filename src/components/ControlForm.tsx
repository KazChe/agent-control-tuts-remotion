import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type ControlFormData = {
  name: string;
  description: string;
  stages: string;
  selectorPath: string;
  action: string;
  execution: string;
  stepTypes: string;
  evaluatorJson: string[];
};

// Stylized recreation of the console's "Edit Control" modal. Field groups
// are color-coded to match the concept slide: selector = cyan,
// evaluator = purple, so the anatomy maps onto the real form.
export const ControlForm: React.FC<{ control: ControlFormData }> = ({
  control,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = (order: number) =>
    spring({
      frame: frame - 8 - order * 12,
      fps,
      config: { damping: 200 },
      durationInFrames: 22,
    });

  const field = (
    order: number,
    label: string,
    value: React.ReactNode,
    accent?: string,
  ) => {
    const s = appear(order);
    return (
      <div
        style={{
          marginBottom: 26,
          opacity: s,
          transform: `translateY(${(1 - s) * 14}px)`,
        }}
      >
        <div
          style={{
            color: accent ?? theme.dim,
            fontSize: 22,
            fontWeight: accent ? 700 : 500,
            marginBottom: 8,
            fontFamily: theme.fontSans,
            letterSpacing: accent ? 1 : 0,
          }}
        >
          {label}
        </div>
        <div
          style={{
            background: "#0d1117",
            border: `2px solid ${accent ?? theme.panelBorder}`,
            borderRadius: 10,
            padding: "12px 18px",
            fontFamily: theme.fontMono,
            fontSize: 24,
            color: theme.text,
          }}
        >
          {value}
        </div>
      </div>
    );
  };

  const evalS = appear(3);

  return (
    <AbsoluteFill
      style={{
        background: theme.pageBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: theme.fontSans,
      }}
    >
      <div
        style={{
          width: 1560,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${theme.panelBorder}`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          background: "#0f1524",
        }}
      >
        <div
          style={{
            padding: "28px 44px 20px",
            borderBottom: `1px solid ${theme.panelBorder}`,
            color: theme.text,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          Edit Control
        </div>
        <div style={{ display: "flex", gap: 44, padding: "32px 44px 40px" }}>
          <div style={{ width: 640 }}>
            {field(0, "Control name", control.name)}
            {field(1, "Description", control.description)}
            {field(
              2,
              "SELECTOR PATH · which data",
              control.selectorPath,
              theme.cyan,
            )}
            {field(
              4,
              "Stages / Action",
              <span>
                {control.stages}
                {" · "}
                <span style={{ color: theme.red, fontWeight: 700 }}>
                  {control.action}
                </span>
              </span>,
            )}
            {field(
              5,
              "Execution / Step types",
              `${control.execution} · ${control.stepTypes}`,
            )}
          </div>
          <div
            style={{
              flex: 1,
              opacity: evalS,
              transform: `translateY(${(1 - evalS) * 14}px)`,
            }}
          >
            <div
              style={{
                color: theme.purple,
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              EVALUATOR CONFIGURATION · what judgment
            </div>
            <div
              style={{
                background: "#0d1117",
                border: `2px solid ${theme.purple}`,
                borderRadius: 10,
                padding: "20px 24px",
                fontFamily: theme.fontMono,
                fontSize: 24,
                lineHeight: "40px",
                color: theme.text,
                whiteSpace: "pre",
              }}
            >
              {control.evaluatorJson.join("\n")}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
