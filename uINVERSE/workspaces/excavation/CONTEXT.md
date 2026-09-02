# Excavation — chat and project archaeology pipeline

One job: turn bounded source packets into reviewed Atlas candidates while retaining provenance.

```mermaid
flowchart LR
    I["01 Intake"] --> E["02 Extract"] --> D["03 Deduplicate"] --> R["04 Review"]
```

Each stage reads only its contract and named inputs. The human gate is `04_review/output/approval.md`; nothing enters the Atlas automatically.

