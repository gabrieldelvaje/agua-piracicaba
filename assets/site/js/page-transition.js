(() => {
  const DURATION = 1250;
  let busy = false;

  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function isPrimaryClick(event) {
    return event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
  }

  function forceManualScroll() {
    document.documentElement.classList.add("page-flow-manual-scroll");
    document.body.classList.add("page-flow-active");
  }

  function scrollFrame(y) {
    window.scrollTo({ top: y, left: 0, behavior: "auto" });
  }

  function animateScroll(targetY, done) {
    forceManualScroll();

    const startY = window.scrollY;
    const distance = targetY - startY;
    let startedAt = null;

    function frame(now) {
      if (startedAt === null) startedAt = now;

      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / DURATION, 1);
      scrollFrame(startY + distance * ease(progress));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        scrollFrame(targetY);
        window.setTimeout(done, 90);
      }
    }

    requestAnimationFrame(() => requestAnimationFrame(frame));
  }

  function episodeStage(link) {
    const stage = document.createElement("section");
    stage.className = "page-flow-stage page-flow-stage--episode";

    const image = link.querySelector(".home-episode-image");
    if (image) {
      stage.style.backgroundImage =
        "linear-gradient(180deg,rgba(0,0,0,.30),rgba(0,0,0,.72)),url('" +
        image.src +
        "')";
    }

    const kicker =
      link.querySelector(".home-episode-meta")?.textContent?.trim() || "Episódio";
    const title = link.querySelector("h3")?.textContent?.trim() || "";

    stage.innerHTML =
      '<div class="page-flow-stage-inner">' +
        '<p class="page-flow-stage-kicker">' + kicker + '</p>' +
        '<h2 class="page-flow-stage-title">' + title + '</h2>' +
      '</div>';

    return stage;
  }

  function homeStage() {
    const stage = document.createElement("section");
    stage.className = "page-flow-stage page-flow-stage--home";
    stage.innerHTML =
      '<div class="page-flow-stage-inner">' +
        '<h2 class="page-flow-home-title">Episódios</h2>' +
        '<div class="page-flow-home-grid">' +
          '<div style="background-image:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.72)),url(\'assets/site/cards/episodio-1-abandonado.jpg\')"><span>Por que está faltando água em Piracicaba?</span></div>' +
          '<div style="background-image:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.72)),url(\'assets/site/cards/episodio-2-caixao.jpg\')"><span>O desvio que mudou o Rio Piracicaba</span></div>' +
          '<div style="background-image:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.72)),url(\'assets/site/cards/episodio-3-rio-seco.jpg\')"><span>Por que Piracicaba foi buscar água no Corumbataí?</span></div>' +
          '<div style="background-image:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.72)),url(\'assets/site/cards/episodio-4-boia-rio.jpg\')"><span>O que acontece nas margens do Piracicaba?</span></div>' +
        '</div>' +
      '</div>';

    return stage;
  }

  function goDown(link) {
    if (busy) return;
    busy = true;
    forceManualScroll();

    const stage = episodeStage(link);
    document.body.appendChild(stage);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetY = stage.getBoundingClientRect().top + window.scrollY;
        animateScroll(targetY, () => {
          window.location.assign(link.href);
        });
      });
    });
  }

  function goUp(url) {
    if (busy) return;
    busy = true;
    forceManualScroll();

    const oldY = window.scrollY;
    const stage = homeStage();
    document.body.insertBefore(stage, document.body.firstChild);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const addedHeight = stage.getBoundingClientRect().height;
        scrollFrame(oldY + addedHeight);

        requestAnimationFrame(() => {
          animateScroll(0, () => {
            window.location.assign(url);
          });
        });
      });
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !isPrimaryClick(event)) return;

    if (
      document.body.classList.contains("series-home") &&
      link.matches(".home-episode[href^='episodio-']")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goDown(link);
      return;
    }

    if (
      !document.body.classList.contains("series-home") &&
      link.getAttribute("href")?.startsWith("index.html")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const homeUrl = new URL("index.html#episodios", window.location.href).href;
      goUp(homeUrl);
      return;
    }

    if (link.matches(".next-episode[href^='episodio-']")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goDown(link);
    }
  }, true);
})();
