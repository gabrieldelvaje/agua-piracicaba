document.addEventListener("DOMContentLoaded", () => {
  const explore = document.querySelector(".explore-series");
  const target = document.querySelector("#episodios");

  if (!explore || !target) return;

  let activeFrame = null;

  explore.addEventListener("click", (event) => {
    event.preventDefault();

    if (activeFrame) {
      cancelAnimationFrame(activeFrame);
      activeFrame = null;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = body.style.scrollBehavior;

    /* Avoid fighting the site's CSS smooth scrolling on every animation frame. */
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + start;
    const distance = end - start;
    const mobile = window.matchMedia("(max-width: 850px)").matches;
    const duration = mobile ? 680 : 900;
    let startedAt = null;

    /* Fast initial response, then a progressively softer arrival. */
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now) => {
      if (startedAt === null) startedAt = now;

      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = mobile ? easeOutQuart(progress) : easeInOutCubic(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        activeFrame = requestAnimationFrame(animate);
        return;
      }

      window.scrollTo(0, end);
      root.style.scrollBehavior = previousRootBehavior;
      body.style.scrollBehavior = previousBodyBehavior;
      activeFrame = null;
    };

    activeFrame = requestAnimationFrame(animate);
  });
});
