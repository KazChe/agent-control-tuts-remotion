import "./index.css";
import { Composition } from "remotion";
import { BEATS } from "./modules/module02/data";
import { Module02Teaser } from "./modules/module02/Teaser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Module02Teaser"
        component={Module02Teaser}
        durationInFrames={BEATS.total}
        fps={BEATS.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
