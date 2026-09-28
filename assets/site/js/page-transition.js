(() => {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = 500;

  function samePrimaryButton(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function navigateWithTransition(url, exitClass, enterDirection) {
    if (REDUCED) {
      window.location.href = url;
      return;
    }

    try {
      sessionStorage.setItem("adr-page-enter", enterDirection);
    } catch (_) {}

    document.body.classList.add(exitClass);
    window.setTimeout(() => {
      window.location.href = url;
    }, DURATION);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const enterDirection = document.documentElement.dataset.pageEnter;

    if (document.body.classList.contains("series-home") && enterDirection === "from-top") {
      const episodes = document.querySelector("#episodios");
      if (episodes) {
        window.scrollTo(0, episodes.offsetTop);
      }
    }

    document.querySelectorAll(".home-episode[href^='episodio-']").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!samePrimaryButton(event)) return;
        event.preventDefault();
        navigateWithTransition(link.href, "page-exit-up", "from-bottom");
      });
    });

    document.querySelectorAll("a[href^='index.html']").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!samePrimaryButton(event)) return;
        if (document.body.classList.contains("series-home")) return;

        event.preventDefault();
        const homeUrl = new URL("index.html#episodios", window.location.href).href;
        navigateWithTransition(homeUrl, "page-exit-down", "from-top");
      });
    });

    document.querySelectorAll(".next-episode[href^='episodio-']").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!samePrimaryButton(event)) return;
        event.preventDefault();
        navigateWithTransition(link.href, "page-exit-up", "from-bottom");
      });
    });
  });
})();
