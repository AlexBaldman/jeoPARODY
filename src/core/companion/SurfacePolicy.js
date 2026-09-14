const SURFACE_POLICIES = Object.freeze({
  watch: {
    semanticDetail: 1,
    maxConcurrentAnimations: 1,
    captions: 'minimal',
    interaction: ['tap', 'crown', 'haptic'],
    prefersLoopingIdle: true,
  },
  phone: {
    semanticDetail: 2,
    maxConcurrentAnimations: 2,
    captions: 'compact',
    interaction: ['tap', 'gesture', 'voice'],
    prefersLoopingIdle: true,
  },
  tablet: {
    semanticDetail: 3,
    maxConcurrentAnimations: 3,
    captions: 'standard',
    interaction: ['tap', 'gesture', 'keyboard', 'voice'],
    prefersLoopingIdle: true,
  },
  desktop: {
    semanticDetail: 4,
    maxConcurrentAnimations: 4,
    captions: 'standard',
    interaction: ['pointer', 'keyboard', 'voice'],
    prefersLoopingIdle: true,
  },
  tv: {
    semanticDetail: 3,
    maxConcurrentAnimations: 4,
    captions: 'large',
    interaction: ['remote', 'voice'],
    prefersLoopingIdle: true,
  },
});

export function getSurfacePolicy(surface = 'desktop') {
  return SURFACE_POLICIES[surface] ?? SURFACE_POLICIES.desktop;
}

export function resolveAnimationForSurface(animation, surface = 'desktop') {
  if (!animation) return null;
  const policy = getSurfacePolicy(surface);
  const variants = animation.variants ?? {};
  return variants[surface] ?? variants.compact ?? variants.default ?? animation;
}

export { SURFACE_POLICIES };
