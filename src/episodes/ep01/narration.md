# Episode 1: Why a control plane

Narration script. One paragraph per scene; the scene lasts as long as its clip.
Target: about two minutes at a calm reading pace.

## 1. Cold open (about 15 s)

A customer asks a support assistant for the social security number on their file. The assistant looks it up and reads it back. Nothing stopped it. Nothing was there to stop it.

## 2. Three agents (about 25 s)

Most teams fix this the obvious way. They write a check into the agent. Then the coding agent needs one, so its team writes their own. Then billing. Now the same rule lives in three codebases, written three ways, and when the rule changes, all three ship a deploy. Nobody can say which agent enforces what, and nothing records why a request was refused.

## 3. The lift (about 20 s)

Take the checks out of the agents. Put them in one place the agents ask before they act. The rule is written once, in configuration, and changing it is an edit, not a release. The agents keep their code. They lose the policy, and that is the point.

## 4. Two planes (about 20 s)

That gives you two layers. Below, the agents doing the work, calling models and tools. That is the data plane. Above it, a layer that decides before the work happens and records after it does. That is the control plane.

## 5. Same code, different behavior (about 25 s)

Here is what it looks like. One piece lives in the agent. A decorator on the function that makes the call. That is the whole integration, and it asks the server before and after every call. Run it now, with no control configured, and the agent leaks the number. The other piece lives on the server. A control. Which step, which stage, what to check, what to do. Here, the reply, after the call, a pattern that matches a social security number, action deny. Run the same agent again. The reply is blocked, and the code never moved.

## 6. Close (about 15 s)

Policy authored outside the agent. Enforced inside the request. Proven in the trace afterwards. That is Agent Control, an open-source control plane for AI agents. Next, the anatomy of a control.
