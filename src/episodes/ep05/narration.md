# Episode 5: Evaluators

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Sources: docs.agentcontrol.dev concepts/evaluators (overview, built-in evaluators,
custom evaluators, Galileo Luna), the agent-control-evaluators 8.8.0 package as
installed, and gactl-tutorial module 02 (probes 1a to 3b captured on the demo cluster,
the exercise 2 sql control captured against a local server). Target about three minutes.

## 1. One contract (about 25 s)

Every condition ends in an evaluator, and every evaluator answers the same way. It gets the piece the selector picked out of the step, and it returns four things. Matched, true or false. A confidence between zero and one. A message saying why. And metadata, whatever it wants to record for the audit trail. That is the whole contract. Regex, list, JSON, sequel, Luna, or one you write yourself, the control plane cannot tell them apart. The four in the box are deterministic, so their confidence is always one. A model backed evaluator is where that number starts to mean something.

## 2. Regex and list (about 40 s)

The two text evaluators. Regex takes a pattern and matches when the pattern is found anywhere in the text. It runs on a linear time engine, so a bad pattern cannot stall the server, and the only flag is ignore case. List takes values and a match mode. Exact, the whole string. Contains, the value as a whole word, so acmecorp inside a longer word does not count. Starts with, and ends with. Logic any or all, and a case toggle. Here is the tutorial's competitor control. List, on the input, before the model runs. Is AcmeCorp better than you. The value is found, the condition holds, and the request is denied before anything is generated.

## 3. The same evaluator, turned around (about 25 s)

List has one more switch. Match on. By default the control fires when a value is found. Set match on to no match, and it fires when none of the values are present. That turns a blocklist into an allowlist. Require the word approved in a reply. Or restrict a step to a handful of tool names. Same evaluator, inverted. One thing to remember from last time. When the selected value is empty, list does not fire either way. It answers, empty input, control ignored.

## 4. JSON and sequel, the rule breakers (about 45 s)

Now the polarity flips. Regex and list match when something is found. JSON and sequel match when a rule is broken. The JSON evaluator takes a schema, required fields, types, ranges, patterns. The schema describes what is allowed, and the evaluator matches on the violation. The tutorial's refund limit says amount below one thousand. Two hundred and fifty passes the schema, nothing matches, the tool runs. Five thousand breaks it, the evaluator matches, and the tool never runs. Sequel goes further. It parses the statement with a real sequel parser, in the dialect you name, and checks what it finds. Blocked or allowed operations. Whole categories, like DDL. Table and schema lists. A required limit, a maximum limit, join and union counts. Here is a fourth control, from the module's exercise. Drop and delete are blocked on the run query tool. A select goes through. A delete does not.

## 5. Where it runs (about 35 s)

Two things about running them. First, where. A control says execution, server or SDK. Server means the evaluator runs on the Agent Control server, and the built-ins live there already, nothing to install in your agent. SDK means it runs inside your agent's process, which you need when the evaluator, or something it depends on, lives only in the agent's environment. We will get there with custom evaluators. Second, how. The server keeps one instance per evaluator name and configuration, and reuses it across requests. That is why an evaluator must not keep per request state. And each one declares a timeout, ten seconds by default, fifteen for JSON. An evaluator's config can carry its own, as Luna's does.

## 6. Beyond the box (about 25 s)

The four built-ins are deterministic. They cannot judge tone, intent, or whether a reply is on topic. For that there are model backed evaluators, and they arrive as add on packages that register through the same plug in mechanism. Luna, from Galileo, is one, and there are others in the contrib directory. So is anything you write yourself, which is an upcoming section. One contract. Four built-ins. Two polarities, found or broken. Next, what happens after a match. The actions, and the steer loop.
