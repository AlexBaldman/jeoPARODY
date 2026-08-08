# Asset Library — Build the System That Builds the System

**Status:** PRESSURE_TEST

Every generated/imported image, sprite, sound, avatar, prop, texture, animation, document, or creative artifact should eventually become first-class durable project data automatically.

## Desired lifecycle

```text
GENERATE / IMPORT
→ STORE ORIGINAL BYTES
→ REGISTER STABLE ID + METADATA
→ RECORD PROVENANCE / SOURCE
→ TAG SEMANTIC IDENTITY
→ DECLARE WORLD + PROJECTION USES
→ DERIVE OPTIMIZED VARIANTS
→ BUILD INGESTS AUTOMATICALLY
→ STAGE / WORLDS CAN DISCOVER IT
```

## Minimal manifest direction

```json
{
  "id": "asset:...",
  "type": "image|sprite|audio|...",
  "createdAt": "...",
  "source": "generated|uploaded|derived|photograph|...",
  "provenance": {},
  "semanticRole": [],
  "tags": [],
  "worlds": [],
  "projections": [],
  "variants": [],
  "relationships": [],
  "rights": {},
  "sourceRefs": []
}
```

## Early specimens to register

1. Stool Samples amber pixel mosquito mascot.
2. Zeke Discovers series/concept board.
3. Zeke Discovers art-style exploration board.
4. Real-life indoor-playground reference photo that visually echoes the Tall Tree scale/composition and can seed a transformed story/level.
5. Future Archimedes dog references, sprites, animations, and concept art.

## Russian-doll principle

Asset handling itself should become reusable infrastructure. Repeated manual placement is evidence for an asset registrar. The registrar should eventually be usable by generators, agents, editors, games, and Excavation Station.

## Guardrail

Do not block jeoPARODY's playable-spine work on building a grand DAM/CMS. Establish stable conventions first; automate only after the pattern is proven.

## Next lead domino

Implement the smallest machine-readable manifest + validation convention that can register one real Stage asset and the mosquito specimen without changing runtime behavior.
