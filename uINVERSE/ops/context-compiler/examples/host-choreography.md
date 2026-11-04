# First real Context Compiler target

Task: **Improve host choreography**

Seed contract:

```text
jeoparody
stage-runtime
```

Expected first-order context includes the active jeoPARODY world and Stage Runtime plus their directly declared graph neighbors. The packet must point the worker toward canonical sources rather than restating those sources as a second authority.

The current repository also contains concrete runtime evidence that `HostSystem` owns identity/personality/mood/image/semantic reactions while `HostStageActor` owns responsive position, scale, movement, footer occlusion, choreography, and speech-bubble tail tracking. That code/doc ownership is intentionally **not guessed into the Atlas by this proof**. A later ownership-ratchet should add explicit graph relationships only after the schema for code/test ownership is reviewed.

This restraint is part of the proof: a context compiler should expose what the graph knows and make missing knowledge visible, not silently hallucinate a more complete graph.
