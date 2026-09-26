# Episode 3: The request flow

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Sources: docs.agentcontrol.dev concepts/architecture, how-to/decorate-llm-tool-calls,
and the SDK behavior checked in the code. Target about two and a half minutes.

## 1. Two lanes, two moments (about 25 s)

Two lanes. On the left, your agent's process. The function, the decorator, the SDK. On the right, the Agent Control server. The controls, the engine that evaluates them, and the record of every decision. Traffic crosses the line at two moments. Once at startup, when the agent registers itself and fetches the controls that apply to it. And at every decorated call, before it runs and after.

## 2. One call, in order (about 30 s)

Here is one call. The agent is about to run a step. The SDK sends the pre controls across, the engine evaluates each one, and an answer comes back. If any deny control matched, the function never runs, and the caller gets an error naming the control. Otherwise the function runs. Then the post controls cross with the output, and the same thing happens. A deny here holds the output back. Two round trips per call, and the agent's code knows about neither of them.

## 3. Where the evaluator runs (about 25 s)

Each control says where its evaluator runs. Server execution is the default. The evaluator lives on the server, nothing is installed in the agent, and a change to the control is a change in one place. SDK execution moves the evaluator into the agent's process. You use it when the evaluator needs something only the agent has, a credential, a local model, a package you wrote. The control still lives on the server. Only the judging moves.

## 4. When things fail (about 25 s)

What if the line goes dark? If the server cannot be reached, the call is blocked, not waved through. If an evaluator on a deny control errors, the call is blocked too. When Agent Control cannot judge a call, it does not guess. It blocks. That is the right default for a guardrail. It also means every call waits for an answer, and when the server is slow, the call waits up to the evaluation timeout and is then blocked.

## 5. The three timeouts (about 30 s)

Where is that timeout? There are three, in layers. First, on the control itself. Each evaluator accepts a timeout in milliseconds, ten seconds by default, and a slow judgment stops there. Second, on the server. If an evaluator carries no timeout of its own, the server applies one from its environment, thirty seconds by default. Third, in the agent. The SDK's connection to the server has its own limit, thirty seconds by default, and that is the one that ends the wait when the server is not there at all. Set the first one per control, and keep all three shorter than what your agent can afford to wait.

## 6. Policy without a deploy (about 20 s)

One more arrow. The SDK fetches the controls at startup and refreshes them on an interval you choose. Change a control on the server, and a running agent picks it up on the next refresh. No restart, no deploy. That is what the first section showed, seen from the other side of the line.

## 7. Close (about 20 s)

Register once. Ask before, ask after. Block when it cannot judge. Refresh on a timer. And one more thing crosses the line. Every decision also lands next to the trace of the work it governed, in a third place. In this deployment that is Galileo, and we will read one there in the evidence section. Next, what a control can actually see when it looks at a step.
