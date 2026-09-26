# Episode 4: What a control can see

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Sources: docs.agentcontrol.dev how-to/decorate-llm-tool-calls, components/models (Step),
the Python SDK's step building as checked in the code, and gactl-tutorial module 07.
Target about three minutes.

## 1. The step (about 30 s)

Every control looks at one thing. The step. When a decorated function is called, the SDK builds this object from that one call and sends it to the server to be judged. It is not a trace, and it is not the model. A step has a type, a model call or a tool call. A name. An input, an output once the function has run, and an optional context. That is the whole object. A selector can only reach what is in it, so what ends up in a step decides what a control can ever check.

## 2. How a function becomes a step (about 35 s)

The decorator builds the step from your function. A plain decorated function becomes a model step, named after the function. To make a tool step, the function carries a name attribute, name or tool name, and the decorator sees it. That is also how framework decorators fit. LangChain's tool decorator, Google ADK's tool wrappers, CrewAI tools. They set a name on the function, so you apply them first, on the inside, and the Agent Control decorator on the outside, and the step registers as a tool under the framework's name. The other way round, the decorator sees a plain function and you get a model step. The latest SDK also lets you state the type outright, with a step type parameter on the decorator.

## 3. What input looks like (about 35 s)

Here is where the two step types differ, and it matters. For a model step, the SDK picks one string out of your arguments. It looks for a parameter named input, message, query, text, prompt, content, or user input, and takes the first one it finds. Failing that, the first string argument. Everything else is dropped before the control sees it. For a tool step, the input is the whole argument dictionary, every parameter by name, so a selector can reach any field by path. Same function shape, two very different steps.

## 4. The trap (about 35 s)

Now the trap this creates. The tutorials have a refund limit with an exemption. Supervisors may exceed it. Written on a tool step, the selector reads user id from the input, the not node inverts the match, and the supervisor gets through while everyone else is stopped. The same intent written on a model step never sees user id at all. The list evaluator gets an empty value and answers, empty input, control ignored. The and never fires. Nobody is stopped, the supervisor included, and the control sits enabled and green the whole time. Here are both, run for real.

## 5. Context (about 25 s)

There is a way to hand a control what the decorator cannot see. Instead of decorating, call the evaluation yourself and pass a context object. Whatever you put in it, the caller's id, the conversation so far, a risk level, becomes part of the step, and a selector reaches it by path, context dot user id. The exemption works on any step type that way. It is also how you give a model-backed evaluator the whole conversation to judge.

## 6. Close (about 20 s)

A control sees exactly what the step carries, nothing more. Choose the step type on purpose. Put identity where a selector can reach it. And when the decorator cannot see something, pass it as context. Next, the evaluators themselves.
