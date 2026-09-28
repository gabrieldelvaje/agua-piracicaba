(() => {
  const root = document.documentElement;

  try {
    const incoming = sessionStorage.getItem("adr-nav-direction");
    if (incoming) {
      root.dataset.navDirection = incoming;
      sessionStorage.removeItem("adr-nav-direction");
    }
  } catch (_) {}

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".home-episode[href^='episodio-']").forEach((link) => {
      link.addEventListener("click", () => {
        root.dataset.navDirection = "forward";
        try { sessionStorage.setItem("adr-nav-direction", "forward"); } catch (_) {}
      });
    });

    document.querySelectorAll(".next-episode[href^='episodio-']").forEach((link) => {
      link.addEventListener("click", () => {
        root.dataset.navDirection = "forward";
        try { sessionStorage.setItem("adr-nav-direction", "forward"); } catch (_) {}
      });
    });

    if (!document.body.classList.contains("series-home")) {
      document.querySelectorAll("a[href^='index.html']").forEach((link) => {
        link.href = "index.html#episodios";
        link.addEventListener("click", () => {
          root.dataset.navDirection = "back";
          try { sessionStorage.setItem("adr-nav-direction", "back"); } catch (_) {}
        });
      });
    }
  });
})();
