// One-shot IntersectionObserver that adds `.is-in-view` to the playground
// frame when it enters the viewport. Observer disconnects after the first hit.
const init = () => {
  const target = document.querySelector<HTMLElement>('.playground');
  if (!target) return;
  if (typeof IntersectionObserver === 'undefined') {
    target.classList.add('is-in-view');
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.disconnect();
          break;
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );
  observer.observe(target);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
