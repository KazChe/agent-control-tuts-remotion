# Episode 6: Actions, and the steer loop

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Sources: docs.agentcontrol.dev concepts/controls (actions), the Python SDK 8.8.0 as
installed (action priority in control_decorators, ControlSteerError, SteeringContext
with its single message field, the Google ADK and Strands integrations), and
gactl-tutorial module 03 (three transfers captured against a local server).
Target about three minutes.

## 1. One match, three outcomes (about 25 s)

A condition matched. Now what. That is the action, and there are exactly three. Observe records the match and lets the request through. Deny stops it. Steer stops it too, but hands the agent a message about what to fix, so it can correct the request and try again. When several controls match on the same step, the SDK reads them in a fixed order. A deny wins over everything. Then steer. Observe matches are only written down. And if any control failed to evaluate at all, nothing runs. That order is the whole policy of the action layer.

## 2. One tool, three controls (about 35 s)

The tutorial's banking agent has one tool, process wire transfer, and three controls on it, all before the call. The first is observe. A list evaluator on the recipient name, turned around with match on no match, so it fires for anyone not on the known list. The second is deny. A list of sanctioned countries on the destination. The third is steer. A JSON schema that allows a small transfer, or a large one carrying a verified two factor flag. Anything else breaks the schema, and the action carries a steering context, a message the agent will read. Notice what the agent's code contains. No threshold, no country list, no verification rule. All of that lives on the server.

## 3. Observe, then deny (about 35 s)

Three transfers. Five hundred dollars to a new recipient. The observe control matched, and the run shows no sign of it. Completed, nothing else. The match is recorded on the server, which is the point of observe, and reading that record is the evidence section later on. Five thousand dollars to a sanctioned country. Denied. The tool never ran, and the reason printed is the evaluator's own message, the value it matched. The observe control matched here too, but deny wins, and the run stops.

## 4. Steer, the loop (about 50 s)

Fifteen thousand dollars, no verification yet. The schema breaks, the steer control fires, and the SDK raises a steer error with the steering context inside it. Now the agent does the work. It parses the message, sees the required action, verify two factor authentication, collects the code, applies the retry flags the control asked for, and calls the tool again. The retry goes through every control again, all three. The schema is satisfied now, nothing matches, and the transfer completes. One thing to be clear about. The platform defines the steering context as one string, a message. The JSON structure inside it, required actions and retry flags, is a convention between whoever writes the policy and whoever writes the agent. And the agent caps its retries. A steer that is never satisfied must not loop forever.

## 5. Steer inside a framework (about 45 s)

If you build on a framework integration, the loop is handled for you. The Google agent development kit plugin takes a steer on a model step and injects the guidance into the model's instructions, prefixed Agent Control guidance, so the next generation sees it. On a tool step it returns the guidance as the tool's response, so the model reads it and decides what to do next. The AWS Strands handler turns a steer match into a guide action in the framework's own steering system. LangChain and LangGraph have no plugin, and the docs show the pattern instead. The decorator goes on a helper inside your tool. The tool catches the control's exception and returns a message as its result, so the model reads it on the next turn. The repo's steer demo is a LangGraph graph. Its node catches the steer, collects the verification, writes the flag into the graph state, and a conditional edge routes back to the same node for the retry. Same server, same control, same message. Only the delivery changes.

## 6. Close (about 25 s)

Observe to watch. Deny to stop. Steer to correct. And a habit worth keeping. Ship a new control as observe first, read what it would have done, then flip it to deny or steer. The definition changes on the server, the agent's code does not. Next, writing an evaluator of your own.
