// CSS owns the animation. One shared observer triggers each entrance once;
// it never hides content that has not yet been observed.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const observed = new WeakSet();
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-revealed');
    observer.unobserve(entry.target);
  }
}, { threshold: .12 }) : null;

export function observeReveals(root = document) {
  if (!observer || motion.matches) return;
  const groups = [
    ['.section-heading h2, .story-copy h2, .reviews-copy h2, .faq-layout > h2, .about-body h2, .closing h2', 'text-reveal'],
    ['.cake-card, .story-photo, .steps li, .review-image', 'scroll-reveal']
  ];
  for (const [selector, className] of groups) {
    root.querySelectorAll(selector).forEach(element => {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add(className);
      observer.observe(element);
    });
  }
}
motion.addEventListener('change', () => { if (!motion.matches) observeReveals(); });
