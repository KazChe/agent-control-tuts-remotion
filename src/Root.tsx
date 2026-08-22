import "./index.css";
import { Composition } from "remotion";
import { BEATS as BEATS02 } from "./modules/module02/data";
import { Module02Teaser } from "./modules/module02/Teaser";
import { BEATS as BEATS03 } from "./modules/module03/data";
import { Module03Teaser } from "./modules/module03/Teaser";
import { BEATS as BEATS_ACP } from "./teasers/agent-control-pii/data";
import { AgentControlPiiTeaser } from "./teasers/agent-control-pii/Teaser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Module02Teaser"
        component={Module02Teaser}
        durationInFrames={BEATS02.total}
        fps={BEATS02.fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="Module03Teaser"
        component={Module03Teaser}
        durationInFrames={BEATS03.total}
        fps={BEATS03.fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="AgentControlPiiTeaser"
        component={AgentControlPiiTeaser}
        durationInFrames={BEATS_ACP.total}
        fps={BEATS_ACP.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
