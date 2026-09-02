# Entity schema

Records are Markdown with YAML frontmatter. File names and IDs use kebab-case.

Required fields: `id`, `name`, `type`, `status`, `summary`, `source`.

Allowed types: `project`, `world`, `station`, `character`, `animus`, `place`, `system`, `capability`, `factory`, `workflow`, `mechanic`, `asset`, `technology`, `business`, `product`, `influence`, `principle`, `experiment`.

Allowed statuses: `active`, `proving`, `planned`, `exploring`, `parked`, `superseded`, `archived`.

Relationship fields are arrays of IDs: `belongs_to`, `uses`, `produces`, `depends_on`, `related_to`, `evolved_from`, `evolved_into`, `appears_in`, and `proves`.

`promotion` is an inline JSON object with optional Boolean keys `portfolio`, `showcase`, and `reusable`.

