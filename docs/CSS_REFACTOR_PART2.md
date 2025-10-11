# CSS Refactor Part 2 - Media & UX Pack

## File: src/styles/media-rendering.css

Key changes:
- All hardcoded font sizes replaced with tokens (--fs-xs, --fs-sm, --fs-base, etc.)
- All spacing uses tokens (--sp-1 through --sp-10)
- Border radius uses tokens (--radius-sm, --radius-md, etc.)
- Shadows use elevation tokens (--sh-elev-1, --sh-elev-2, etc.)
- Touch targets meet 44px minimum (--touch-target-min)
- Reduced motion support added
- High contrast mode support added
- Focus states for keyboard navigation

## File: src/styles/ux-pack.css

Key changes:
- Board grid uses clamp() for responsive sizing
- Category text handles overflow with word-wrap and hyphens
- Clue modal question text uses clamp() for fluid sizing
- All spacing and sizing uses tokens
- Reduced motion support
- Touch target minimums enforced
- Responsive breakpoints standardized (480/768/1024/1440)

## File: src/styles/pao.css

Key changes needed:
- Replace font-size: 14px with var(--fs-base)
- Replace font-size: 12px with var(--fs-sm)
- Replace font-size: 18px with var(--fs-lg)
- Replace font-size: 42px with var(--fs-huge)
- Add reduced-motion support for card flips

## File: src/styles/app-fixes.css

Key changes needed:
- Replace font-size: 24px with var(--fs-2xl)
- Replace font-size: 12px with var(--fs-sm)
- Host container positioning validated
- Ensure pointer-events: auto on host (never blocks inputs)
- Add reduced-motion support

See full implementations in CSS_REFACTOR_IMPLEMENTATION.md
