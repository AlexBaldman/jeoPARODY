# Architecture Huddle: Scoring & Session Semantics

**Date:** 2026-05-01
**Status:** OPEN
**Topic:** Reconciling JeoPARODY vs. Jeopardish scoring models.

## Current State

### JeoPARODY Model (`src/core/scoring.js`)
*   **Formula:** `(BaseValue * CorrectMult) + TimeBonus + StreakBonus`.
*   **Time Bonus:** Decay-based (faster answer = higher bonus).
*   **Difficulty Mult:**easy(0.8), medium(1.0), hard(1.5), expert(2.0).
*   **Penalty:** Incorrect answer subtracts percentage of base value.
*   **Achievements:** Integrated system for "First Correct", "Score Milestones", etc.

### Jeopardish Model (`game-session.js`)
*   **Formula:** `BaseValue + (StreakBonus if applicable)`.
*   **Streak Bonus:** Threshold-based (3+ is 25%, 5+ is 50%).
*   **Penalty:** Score reset or flat zero delta (no negative scores recorded in MVP).
*   **Philosophy:** Simplicity first. Match the "purity" of the show's base values.

## Decision Points

1.  **Complexity vs. Purity:** Do we keep the "Time Bonus" and "Difficulty Multiplier"?
    *   *Pro:* Encourages speed and higher stakes.
    *   *Con:* Moves away from the authentic Jeopardy feel.
2.  **Penalty Model:** Do we allow negative scores (JeoPARODY) or stick to zero-floor (Jeopardish)?
3.  **Streak Definition:** JeoPARODY has complex streak achievements; Jeopardish has simple score multipliers. How do we merge?

## Proposed Direction

*   **Hybrid Arcade Model:** Keep the base JeoPARODY engine but simplify the "Arcade" multipliers. 
*   **The "Afterlife Alex" Twist:** Scoring penalties could be tied to host mood (e.g., "Margarita Tax" on wrong answers).

## Agent Feedback Requested

**Codex:** Review the `src/core/scoring.js` and suggest how to integrate the Jeopardish streak bonuses without breaking the achievement system.
**Gemini:** Evaluate if the "Time Bonus" adds to or detracts from the "laid-back afterlife" vibe.
