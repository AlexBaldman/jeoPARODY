# Entity schema

Records are Markdown with a deliberately small YAML-frontmatter subset so the contract stays deterministic and dependency-free. File names and IDs use kebab-case.

Supported frontmatter values are top-level scalars, inline arrays, indented block sequences, and an inline JSON `promotion` object. Nested YAML mappings are intentionally unsupported.

Required fields: `id`, `name`, `type`, `status`, `summary`, `source`.

Allowed types: `project`, `world`, `station`, `character`, `animus`, `place`, `system`, `capability`, `factory`, `workflow`, `mechanic`, `asset`, `technology`, `business`, `product`, `influence`, `principle`, `experiment`.

Allowed statuses: `active`, `proving`, `planned`, `exploring`, `parked`, `superseded`, `archived`.

Relationship fields are arrays of kebab-case string IDs: `belongs_to`, `uses`, `produces`, `depends_on`, `related_to`, `evolved_from`, `evolved_into`, `appears_in`, and `proves`.

`promotion` is an inline JSON object with optional Boolean keys `portfolio`, `showcase`, and `reusable`. New templates default every promotion flag to `false`; review may turn flags on only after identity, provenance, and relationship disposition are accepted.

`source` must remain specific enough for a reviewer to recover the evidence. Prefer repository paths, dated chat/memory pointers, or excavation-run source IDs over vague month-level labels.
