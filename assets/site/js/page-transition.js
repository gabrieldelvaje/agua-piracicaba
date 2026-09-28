(() => {
  const DURATION = 720;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let navigating = false;

  function primaryClick(event){
    return event.button === 0 &&
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function finishHomePosition(){
    if (!document.body.classList.contains("series-home")) return;
    if (window.location.hash !== "#episodios") return;

    const target = document.getElementById("episodios");
    if (!target) {
      document.documentElement.classList.remove("transition-target-home");
      return;
    }

    history.scrollRestoration = "manual";
    window.scrollTo(0, target.offsetTop);

    requestAnimationFrame(() => {
      window.scrollTo(0, target.offsetTop);
      document.documentElement.classList.remove("transition-target-home");
    });
  }

  function transitionTo(url, direction){
    if (navigating) return;
    navigating = true;

    if (reduced) {
      window.location.href = url;
      return;
    }

    const frame = document.createElement("iframe");
    frame.className = "page-transition-frame " + (direction === "down" ? "from-bottom" : "from-top");
    frame.setAttribute("aria-hidden","true");
    frame.tabIndex = -1;
    frame.src = url;
    document.body.appendChild(frame);

    const currentClass = direction === "down" ? "transition-current-up" : "transition-current-down";

    const start = () => {
      requestAnimationFrame(() => {
        document.body.classList.add(currentClass);
        frame.classList.add("is-ready");
      });

      window.setTimeout(() => {
        window.location.href = url;
      }, DURATION + 70);
    };

    let started = false;
    const startOnce = () => {
      if (started) return;
      started = true;
      start();
    };

    frame.addEventListener("load", startOnce, {once:true});
    window.setTimeout(startOnce, 350);
  }

  document.addEventListener("DOMContentLoaded", () => {
    finishHomePosition();

    document.querySelectorAll(".home-episode[href^='episodio-']").forEach(link => {
      link.addEventListener("click", event => {
        if (!primaryClick(event)) return;
        event.preventDefault();
        transitionTo(link.href, "down");
      });
    });

    document.querySelectorAll(".next-episode[href^='episodio-']").forEach(link => {
      link.addEventListener("click", event => {
        if (!primaryClick(event)) return;
        event.preventDefault();
        transitionTo(link.href, "down");
      });
    });

    document.querySelectorAll("a[href*='index.html']").forEach(link => {
      if (document.body.classList.contains("series-home")) return;

      link.addEventListener("click", event => {
        if (!primaryClick(event)) return;
        event.preventDefault();

        const homeUrl = new URL("index.html#episodios", window.location.href).href;
        transitionTo(homeUrl, "up");
      });
    });
  });
})();
