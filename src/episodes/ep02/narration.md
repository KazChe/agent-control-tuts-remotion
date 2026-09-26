# Episode 2: The anatomy of a control

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Source: docs.agentcontrol.dev, concepts, controls. Target about two and a half minutes.

## 1. One control, three parts (about 20 s)

Here is the control from last time. It blocked a social security number in a reply. Look at it as three answers to three questions. When do we check. What do we check, and how. And what do we do when the check matches. Agent Control calls those the scope, the condition, and the action. Every control is those three parts, nothing more.

## 2. Scope (about 25 s)

Scope. Scope is when, and on which step. A request passes through a step, a model call or a tool call. A control can watch it before the step runs or after. That choice is called the stage. Before is pre. A deny there means the function never runs. After is post. The function has already run, and a deny holds its output back. So scope names three things. The step type, model or tool. Optionally the step name. And the stage. The number was blocked at post, because it was in the reply.

## 3. A condition, one leaf (about 25 s)

Condition. A condition is what and how. The most basic one has two parts. A selector picks a piece of the step, the input, the output, or a field inside them by path. An evaluator judges that piece. A regular expression, a list of values, a JSON schema, a sequel check, or one you write yourself. The evaluator answers with matched, true or false, plus a confidence and a message. Matched means the condition holds. It says nothing yet about what happens next.

## 4. Composing conditions (about 30 s)

One leaf is often not enough. Conditions compose. This control from the tutorials has two branches under an and. The input must mention sending something outside the company, and the output must contain an account number. The first probe asks about an account internally. The output branch matches, the input branch does not, so the control stays quiet. The second probe asks to share with an external auditor. Both branches match, and the reply is blocked. Or and not are the other two nodes. Not is how you write an exemption, and we will cover it in an upcoming section.

## 5. Action (about 30 s)

Action. Action is what to do when the condition matches. Observe is the quiet one. The request goes through untouched, and the match is written down, which control, which step, what it saw. Think of it as a log line, or a rule running in report-only mode. You use it to watch a new rule before you let it block anything, and to keep an audit trail of things worth knowing about. Deny stops the request. Steer sends the agent a message about what to fix, and the agent can correct itself and try again. When several controls match at once, deny wins over everything else.

## 6. Close (about 15 s)

Scope, when. Condition, what and how. Action, what to do. Every control you will ever write is those three parts. Next, what happens on the wire when a step runs.
