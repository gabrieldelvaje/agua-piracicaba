document.addEventListener("DOMContentLoaded", () => {
  const explore = document.querySelector(".explore-series");
  const target = document.querySelector("#episodios");

  if (!explore || !target) return;

  explore.addEventListener("click", (event) => {
    event.preventDefault();

    const start = window.scrollY;
    const end = target.getBoundingClientRect().top + window.scrollY;
    const distance = end - start;
    const duration = 1050;
    let startTime = null;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (time) => {
      if (startTime === null) startTime = time;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  });
});
