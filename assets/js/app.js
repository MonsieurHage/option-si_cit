/* =========================================================
   Option SI / CIT — Institution Saint Jean Douai
   Navigation, interactions et quiz
   ========================================================= */

(function () {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const slides = $$(".slide");
  const total = slides.length;

  const body        = document.body;
  const chapterEl   = $("#chapterLabel");
  const progressBar = $("#progressBar");
  const currentNum  = $("#currentNum");
  const totalNum    = $("#totalNum");
  const btnPrev     = $("#btnPrev");
  const btnNext     = $("#btnNext");
  const btnMenu     = $("#btnMenu");
  const btnHelp     = $("#btnHelp");
  const btnFull     = $("#btnFull");
  const menu        = $("#menu");
  const help        = $("#help");
  const menuList    = $("#menuList");
  const deck        = $("#deck");

  const COLORS = ["#2C5BD0", "#7B3FB0", "#1FA79B", "#3FA24B", "#F07C22", "#EE7FA5", "#F2B841", "#2C5BD0", "#7B3FB0", "#F2B841", "#163A8A", "#1FA79B"];

  let index = 0;
  let lastFocus = null;

  totalNum.textContent = String(total).padStart(2, "0");

  /* ---------------------------------------------------------
     Navigation
     --------------------------------------------------------- */

  function readHash() {
    const m = window.location.hash.match(/#\/(\d+)/);
    if (!m) return 0;
    const n = parseInt(m[1], 10) - 1;
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), total - 1) : 0;
  }

  function writeHash(i) {
    const target = "#/" + (i + 1);
    if (window.location.hash !== target) {
      history.replaceState(null, "", target);
    }
  }

  function goTo(i, opts = {}) {
    i = Math.min(Math.max(i, 0), total - 1);
    if (i === index && opts.force !== true) {
      if (opts.hash !== false) writeHash(i);
      return;
    }

    index = i;
    slides.forEach((s, n) => {
      const active = n === i;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
      s.inert = !active;
      if (active) {
        s.scrollTop = 0;
      }
    });

    const slide = slides[i];
    const dark = slide.dataset.theme === "dark";
    body.classList.toggle("is-dark", dark);
    document.documentElement.style.setProperty("--tint", slide.dataset.tint || "#163A8A");

    chapterEl.textContent = slide.dataset.chapter || "";
    currentNum.textContent = String(i + 1).padStart(2, "0");
    progressBar.style.width = (total === 1 ? 100 : (i / (total - 1)) * 100) + "%";

    btnPrev.disabled = i === 0;
    btnNext.disabled = i === total - 1;

    if (opts.hash !== false) writeHash(i);

    // Focus management for keyboard / screen readers
    if (opts.focus) {
      const focusable = slide.querySelector("h1, h2, button, a");
      if (focusable) {
        focusable.setAttribute("tabindex", "-1");
        focusable.focus({ preventScroll: true });
      }
    }

  }

  function next() { goTo(index + 1, { focus: true }); }
  function prev() { goTo(index - 1, { focus: true }); }

  btnNext.addEventListener("click", next);
  btnPrev.addEventListener("click", prev);

  window.addEventListener("hashchange", () => {
    if (location.hash === "#deck") return;
    const i = readHash();
    if (i !== index) goTo(i, { hash: false, focus: true });
  });

  /* ---------------------------------------------------------
     Sommaire
     --------------------------------------------------------- */

  slides.forEach((slide, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu__link";
    btn.dataset.goto = String(i);
    btn.innerHTML =
      '<span class="menu__num">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<span class="menu__bar" style="--c:' + (COLORS[i % COLORS.length]) + '"></span>' +
      "<span>" + (slide.dataset.chapter || "Diapositive") + "</span>";
    btn.addEventListener("click", () => {
      closeOverlays();
      goTo(i, { focus: true });
    });
    li.appendChild(btn);
    menuList.appendChild(li);
  });

  /* ---------------------------------------------------------
     Overlays (sommaire / aide)
     --------------------------------------------------------- */

  let openOverlay = null;

  function open(overlay, opener) {
    lastFocus = opener || document.activeElement;
    openOverlay = overlay;
    overlay.hidden = false;
    const closeBtn = overlay.querySelector("[data-close]:not(.overlay__scrim)");
    if (closeBtn) closeBtn.focus();
    if (overlay === menu) {
      $$(".menu__link", menu).forEach((b) =>
        b.classList.toggle("is-current", Number(b.dataset.goto) === index)
      );
    }
  }

  function closeOverlays() {
    [menu, help].forEach((o) => (o.hidden = true));
    openOverlay = null;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  btnMenu.addEventListener("click", () => open(menu, btnMenu));
  btnHelp.addEventListener("click", () => open(help, btnHelp));

  $$("[data-close]").forEach((el) => {
    el.addEventListener("click", closeOverlays);
  });

  [menu, help].forEach((overlay) => {
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeOverlays();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = $$(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        overlay
      ).filter((el) => !el.hidden && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  });

  /* ---------------------------------------------------------
     Plein écran
     --------------------------------------------------------- */

  btnFull.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const on = Boolean(document.fullscreenElement);
    btnFull.setAttribute("aria-label", on ? "Quitter le plein écran" : "Passer en plein écran");
    btnFull.title = on ? "Quitter le plein écran (F)" : "Plein écran (F)";
  });

  /* ---------------------------------------------------------
     Clavier
     --------------------------------------------------------- */

  document.addEventListener("keydown", (e) => {
    if (openOverlay || e.altKey || e.ctrlKey || e.metaKey) return;

    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";

    if (e.key === "Escape") {
      closeOverlays();
      return;
    }
    if (typing) return;

    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case " ":
        if (tag === "button" || tag === "a") return;
        e.preventDefault();
        next();
        break;
      case "Home":
        e.preventDefault();
        goTo(0, { focus: true });
        break;
      case "End":
        e.preventDefault();
        goTo(total - 1, { focus: true });
        break;
      case "m":
      case "M":
        e.preventDefault();
        open(menu, btnMenu);
        break;
      case "f":
      case "F":
        e.preventDefault();
        btnFull.click();
        break;
      case "?":
        e.preventDefault();
        open(help, btnHelp);
        break;
      default:
        break;
    }
  });

  /* ---------------------------------------------------------
     Tactile
     --------------------------------------------------------- */

  let touchX = 0;
  let touchY = 0;
  deck.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    },
    { passive: true }
  );

  deck.addEventListener(
    "touchend",
    (e) => {
      if (!touchX) return;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      touchX = touchY = 0;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  /* ---------------------------------------------------------
     Onglets « Sciences de l'ingénieur »
     --------------------------------------------------------- */

  const tabs = $$(".tab");
  const panels = $$(".tabpanel");

  function selectTab(n, focus) {
    tabs.forEach((tab, i) => {
      const selected = i === n;
      tab.classList.toggle("is-selected", selected);
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== n;
      if (i === n) {
        panel.style.animation = "none";
        void panel.offsetWidth;
        panel.style.animation = "";
      }
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(i));
    tab.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        selectTab((i + 1) % tabs.length, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        selectTab((i - 1 + tabs.length) % tabs.length, true);
      } else if (e.key === "Home") {
        e.preventDefault();
        e.stopPropagation();
        selectTab(0, true);
      } else if (e.key === "End") {
        e.preventDefault();
        e.stopPropagation();
        selectTab(tabs.length - 1, true);
      }
    });
  });

  /* ---------------------------------------------------------
     Étapes CIT
     --------------------------------------------------------- */

  const steps = $$(".step");
  const stages = $$(".stage");

  steps.forEach((step, i) => {
    step.addEventListener("click", () => {
      steps.forEach((s, n) => s.classList.toggle("is-active", n === i));
      stages.forEach((st, n) => {
        st.hidden = n !== i;
        if (n === i) {
          st.style.animation = "none";
          void st.offsetWidth;
          st.style.animation = "";
        }
      });
    });
  });

  /* ---------------------------------------------------------
     Accordéon Fablab
     --------------------------------------------------------- */

  const tools = $$(".tool");

  tools.forEach((tool) => {
    const head = $(".tool__head", tool);
    const panel = $(".tool__body", tool);

    head.addEventListener("click", () => {
      const isOpen = tool.classList.contains("is-open");

      tools.forEach((t) => {
        t.classList.remove("is-open");
        $(".tool__head", t).setAttribute("aria-expanded", "false");
        $(".tool__body", t).hidden = true;
      });

      if (!isOpen) {
        tool.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  /* ---------------------------------------------------------
     Quiz
     --------------------------------------------------------- */

  const QUIZ = [
    {
      q: "Que fait-on en priorité dans l'option SI / CIT ?",
      a: [
        "On apprend des formules par cœur.",
        "On conçoit et on prototype des solutions techniques.",
        "On rédige des dissertations sur la technologie."
      ],
      correct: 1,
      why: "L'option repose sur une pédagogie de projet : analyser un besoin, imaginer une solution, la fabriquer et la tester."
    },
    {
      q: "Combien de temps dure l'option chaque semaine ?",
      a: ["45 minutes.", "3 heures.", "1 h 30."],
      correct: 2,
      why: "À Saint Jean Douai, cette option représente 1 h 30 par semaine."
    },
    {
      q: "Faut-il déjà savoir programmer ou dessiner en 3D ?",
      a: [
        "Non : tout s'apprend dans le projet.",
        "Oui, c'est indispensable.",
        "Seulement pour la partie CIT."
      ],
      correct: 0,
      why: "Aucun prérequis n'est exigé. Les outils de conception, de simulation et de programmation se découvrent au fil des projets."
    },
    {
      q: "L'option en seconde est…",
      a: [
        "Obligatoire pour tous les élèves.",
        "Un enseignement optionnel de découverte.",
        "Réservé aux futurs ingénieurs."
      ],
      correct: 1,
      why: "C'est une option de découverte, ouverte à tous les élèves de seconde, quel que soit le choix de spécialités envisagé ensuite."
    }
  ];

  const quizBody     = $("#quizBody");
  const quizProgress = $("#quizProgress");
  const quizScore    = $("#quizScore");
  const quizBar      = $("#quizBar");

  let qIndex = 0;
  let score = 0;
  let answered = false;

  function plural(n) {
    return n > 1 ? "points" : "point";
  }

  function renderQuestion() {
    answered = false;
    const data = QUIZ[qIndex];

    quizProgress.textContent = "Question " + (qIndex + 1) + " / " + QUIZ.length;
    quizScore.textContent = score + " " + plural(score);
    quizBar.style.width = (qIndex / QUIZ.length) * 100 + "%";

    const wrap = document.createElement("div");
    wrap.className = "q";

    const question = document.createElement("p");
    question.className = "q__text";
    question.textContent = data.q;
    wrap.appendChild(question);

    const answers = document.createElement("div");
    answers.className = "answers";

    data.a.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.dataset.i = String(i);
      btn.innerHTML =
        '<span class="answer__key">' + String.fromCharCode(65 + i) + "</span><span>" + text + "</span>";
      btn.addEventListener("click", () => answer(i, wrap, answers));
      answers.appendChild(btn);
    });

    wrap.appendChild(answers);

    const explain = document.createElement("div");
    explain.className = "explain";
    explain.hidden = true;
    explain.setAttribute("role", "status");
    wrap.appendChild(explain);

    const actions = document.createElement("div");
    actions.className = "quiz__actions";
    actions.hidden = true;
    actions.innerHTML =
      '<button class="btn btn--primary" type="button">' +
      (qIndex === QUIZ.length - 1 ? "Voir mon résultat" : "Question suivante") +
      " " +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      "</button>";
    actions.querySelector("button").addEventListener("click", () => {
      if (qIndex === QUIZ.length - 1) renderResult();
      else {
        qIndex += 1;
        renderQuestion();
      }
    });
    wrap.appendChild(actions);

    quizBody.replaceChildren(wrap);
  }

  function answer(choice, wrap, answers) {
    if (answered) return;
    answered = true;

    const data = QUIZ[qIndex];
    const correct = choice === data.correct;
    if (correct) score += 1;

    $$(".answer", answers).forEach((btn) => {
      const i = Number(btn.dataset.i);
      btn.disabled = true;
      if (i === data.correct) btn.classList.add("is-correct");
      else if (i === choice) btn.classList.add("is-wrong");
    });

    const explain = $(".explain", wrap);
    explain.hidden = false;
    explain.innerHTML =
      "<strong>" + (correct ? "Bien vu !" : "Pas tout à fait.") + "</strong> " + data.why;

    $(".quiz__actions", wrap).hidden = false;
    quizScore.textContent = score + " " + plural(score);
    quizBar.style.width = ((qIndex + 1) / QUIZ.length) * 100 + "%";
  }

  function renderResult() {
    quizProgress.textContent = "Terminé";
    quizBar.style.width = "100%";
    quizScore.textContent = score + " / " + QUIZ.length;

    let title, text;
    if (score === QUIZ.length) {
      title = "Réflexe d'ingénieur confirmé.";
      text = "Tu as tout bon. Il ne reste plus qu'à venir essayer pour de vrai.";
    } else if (score >= 2) {
      title = "Belle intuition.";
      text = "Tu as déjà l'essentiel : la curiosité et l'envie de comprendre. L'option fera le reste.";
    } else {
      title = "C'est exactement pour ça que l'option existe.";
      text = "Pas de note ici : l'objectif est de découvrir une démarche, pas de la connaître déjà.";
    }

    const result = document.createElement("div");
    result.className = "quiz__result";
    result.innerHTML =
      '<p class="big">' + score + "<span> / " + QUIZ.length + "</span></p>" +
      "<h3>" + title + "</h3>" +
      "<p>" + text + "</p>" +
      '<div class="quiz__actions" style="justify-content:center;margin-top:18px">' +
      '<button class="btn btn--primary" type="button">Recommencer</button>' +
      "</div>";

    result.querySelector("button").addEventListener("click", () => {
      qIndex = 0;
      score = 0;
      renderQuestion();
    });

    quizBody.replaceChildren(result);
  }

  renderQuestion();

  /* ---------------------------------------------------------
     Démarrage
     --------------------------------------------------------- */

  slides.forEach((slide, i) => {
    slide.setAttribute("aria-hidden", i === 0 ? "false" : "true");
    if (i === 0) slide.classList.add("is-active");
  });

  // Force le rendu du premier état sans animation de changement
  const start = readHash();
  index = -1;
  goTo(start, { hash: false, force: true });
})();
