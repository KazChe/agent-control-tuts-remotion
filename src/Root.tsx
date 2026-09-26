import "./index.css";
import { Composition } from "remotion";
import { BEATS as BEATS02 } from "./modules/module02/data";
import { Module02Teaser } from "./modules/module02/Teaser";
import { BEATS as BEATS03 } from "./modules/module03/data";
import { Module03Teaser } from "./modules/module03/Teaser";
import { BEATS as BEATS_ACP } from "./teasers/agent-control-pii/data";
import { AgentControlPiiTeaser } from "./teasers/agent-control-pii/Teaser";
import { BEATS as BEATS_TG } from "./teasers/tool-gate/data";
import { ToolGateTeaser } from "./teasers/tool-gate/Teaser";
import { BEATS as BEATS_EP01 } from "./episodes/ep01/data";
import { Ep01WhyControlPlane } from "./episodes/ep01/Episode";
import { BEATS as BEATS_EP02 } from "./episodes/ep02/data";
import { Ep02AnatomyOfAControl } from "./episodes/ep02/Episode";

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
      <Composition
        id="ToolGateTeaser"
        component={ToolGateTeaser}
        durationInFrames={BEATS_TG.total}
        fps={BEATS_TG.fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="Ep01WhyControlPlane"
        component={Ep01WhyControlPlane}
        durationInFrames={BEATS_EP01.total}
        fps={BEATS_EP01.fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="Ep02AnatomyOfAControl"
        component={Ep02AnatomyOfAControl}
        durationInFrames={BEATS_EP02.total}
        fps={BEATS_EP02.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
