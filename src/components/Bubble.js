/**
 * Bubble Component
 * Reusable speech/dialog bubble with variant and arrow direction.
 *
 * Usage:
 *   import { renderBubble } from './Bubble.js';
 *   const html = renderBubble({ variant: 'jeopardy', arrow: 'bottom-left', contentHtml: 'Hello' });
 */

export function renderBubble({ variant = 'default', arrow = 'bottom-left', contentHtml = '' } = {}) {
  const safeVariant = String(variant).toLowerCase();
  const safeArrow = String(arrow).toLowerCase();

  return `
    <div class="speechBubble style-${safeVariant} arrow-${safeArrow}" data-ref="bubbleRoot">
      ${contentHtml}
    </div>
  `;
}

export default { renderBubble };
