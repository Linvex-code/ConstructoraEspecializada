/* Configuración de la presentación GRAFITO (Reveal.js 4.6.1 local) */
window.addEventListener("load", function () {
  if (typeof Reveal === "undefined") {
    console.error("Reveal.js no se cargó. Verifica assets/vendor/reveal-js/dist/reveal.js");
    return;
  }

  Reveal.initialize({
    controls: true,
    controlsTutorial: false,
    progress: true,
    slideNumber: "c/t",
    hash: true,
    center: true,
    transition: "slide",
    transitionSpeed: "default",
    backgroundTransition: "fade",
    navigationMode: "default",
    width: 1280,
    height: 720,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    keyboard: true,
    touch: true,
    overview: true,
    plugins: [RevealNotes, RevealZoom, RevealHighlight],
  });

  // Colores de control/progreso alineados a la identidad (se definen en CSS).
});