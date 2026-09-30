document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

let mouseFrame = 0;
window.addEventListener("pointermove", (event) => {
  if (mouseFrame || reducedMotion) return;
  mouseFrame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    mouseFrame = 0;
  });
});

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const track = carousel.querySelector("[data-track]");
  const viewport = carousel.querySelector("[data-viewport]");
  const slides = [...carousel.querySelectorAll(".project-slide")];
  const previous = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const currentLabel = carousel.querySelector("[data-current]");
  const totalLabel = carousel.querySelector("[data-total]");
  const progress = carousel.querySelector("[data-progress]");
  const dotsRoot = carousel.querySelector("[data-dots]");
  let current = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  totalLabel.textContent = String(slides.length).padStart(2, "0");
  progress.style.width = `${100 / slides.length}%`;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Show project ${index + 1}: ${slide.getAttribute("aria-label").split(": ")[1]}`);
    dot.addEventListener("click", () => goTo(index));
    dotsRoot.append(dot);
    return dot;
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
    currentLabel.textContent = String(current + 1).padStart(2, "0");
    progress.style.transform = `translateX(${current * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });

  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      goTo(current + (deltaX < 0 ? 1 : -1));
    },
    { passive: true }
  );

  goTo(0);
}

const lightbox = document.querySelector("[data-lightbox-dialog]");
if (lightbox) {
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const closeButton = lightbox.querySelector("[data-lightbox-close]");

  document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const sourceImage = trigger.querySelector("img");
      lightboxImage.src = trigger.dataset.lightbox;
      lightboxImage.alt = sourceImage ? sourceImage.alt : "Expanded project image";
      lightbox.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.src = "";
  });
}
