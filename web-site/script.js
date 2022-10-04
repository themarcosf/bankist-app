//use strict mode in all scripts
"use strict";

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// DOM Elements
const message = document.createElement("div");
message.classList.add("cookie-message");
message.style.height = `${Math.ceil(
  parseFloat(getComputedStyle(message).height) * 1.2
)}px`;
message.innerHTML =
  'WARNING: We use cookies for improved functionality and analytics.<button class="btn btn--close--cookie">Got it!</button>';

const elDots = document.querySelector(".dots");
const elLogo = document.querySelector(".nav__logo");
const elModal = document.querySelector(".modal");
const elNavbar = document.querySelector(".nav");
const elOverlay = document.querySelector(".overlay");

const header = document.querySelector("header");
header.append(message);
const sectionOne = document.querySelector("#section--1");
const sectionTwo = document.querySelector("#section--2");
const sectionThree = document.querySelector("#section--3");
const sectionAll = document.querySelectorAll("section");

const containerOperations = document.querySelector(".operations");
const containerTabs = document.querySelector(".operations__tab-container");

const btnScrollTo = document.querySelector(".btn--scroll-to");
const btnCookie = document.querySelector(".btn--close--cookie");
const btnCloseModal = document.querySelector(".btn--close-modal");
const btnSliderRight = document.querySelector(".slider__btn--right");
const btnSliderLeft = document.querySelector(".slider__btn--left");
const btnsNavlinks = document.querySelector(".nav__links");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");

const imgsLazy = document.querySelectorAll("img[data-src]");

const slider = document.querySelector(".slider");
const slideAll = document.querySelectorAll(".slide");
const slideOne = document.querySelector(".slide--1");
const slideTwo = document.querySelector(".slide--2");
const slideThree = document.querySelector(".slide--3");
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// Variables
let currentSlide = slideAll.length - 1;
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// Functions
const openModal = function (e) {
  e.preventDefault();
  elModal.classList.remove("hidden");
  elOverlay.classList.remove("hidden");
};

const closeModal = function () {
  elModal.classList.add("hidden");
  elOverlay.classList.add("hidden");
};

const handleHover = function (e) {
  const siblings = [
    ...e.target.closest(".nav").querySelectorAll(".nav__link"),
  ].slice(0, -1);

  siblings.forEach((el) =>
    el === e.target ? (el.style.opacity = 1) : (el.style.opacity = this)
  );
  logo.style.opacity = this;
};

const callbackHeaderObserver = function (entries, observer) {
  entries[0].isIntersecting
    ? this.classList.remove("sticky")
    : this.classList.add("sticky");
};

const callbackSectionObserver = function (entries, observer) {
  const entry = entries[0];
  if (entries.length !== 1 || !entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};

const callbackImgObserver = function (entries, observer) {
  const entry = entries[0];
  if (entries.length !== 1 || !entry.isIntersecting) return;
  entry.target.src = entry.target.dataset.src;
  entry.target.addEventListener("load", () =>
    entry.target.classList.remove("lazy-img")
  );
  observer.unobserve(entry.target);
};

const updateSlide = function (target) {
  switch (true) {
    case typeof target === "number":
      currentSlide = target;
      break;
    case target === undefined ||
      target === btnSliderRight ||
      target === "ArrowRight":
      currentSlide === slideAll.length - 1
        ? (currentSlide = 0)
        : currentSlide++;
      break;
    default:
      currentSlide === 0
        ? (currentSlide = slideAll.length - 1)
        : currentSlide--;
  }

  slideAll.forEach((el, i) => {
    el.style.transform = `translateX(${(i - currentSlide) * 100}%)`;
  });
  updateDots();
};

const createDots = function () {
  slideAll.forEach((_, i) => {
    elDots.insertAdjacentHTML(
      "beforeend",
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
  updateDots();
};

const updateDots = function () {
  [...elDots.children].forEach((el) =>
    +el.dataset.slide === currentSlide
      ? el.classList.add("dots__dot--active")
      : el.classList.remove("dots__dot--active")
  );
};

const init = function () {
  updateSlide(undefined);
  createDots();
};
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// Event Listeners
document.addEventListener("DOMContentLoaded", init);

btnCookie.addEventListener("click", () => {
  message.remove();
});

btnScrollTo.addEventListener("click", () => {
  sectionOne.scrollIntoView({ behavior: "smooth" });
});

btnsOpenModal.forEach((btn) => btn.addEventListener("click", openModal));
btnCloseModal.addEventListener("click", closeModal);
elOverlay.addEventListener("click", closeModal);
document.addEventListener(
  "keydown",
  (e) =>
    e.key === "Escape" && !elModal.classList.contains("hidden") && closeModal()
);

btnsNavlinks.addEventListener("click", (e) => {
  e.preventDefault();
  const id = e.target.getAttribute("href");
  id &&
    id.includes("#section--") &&
    document.querySelector(id).scrollIntoView({ behavior: "smooth" });
});

containerTabs.addEventListener("click", (e) => {
  const click = e.target.closest(".operations__tab");
  if (!click) return;

  [...containerTabs.children].forEach((el, i) => {
    el.classList.remove("operations__tab--active");
    [...containerOperations.children]
      .slice(1)
      [i].classList.remove("operations__content--active");
  });
  click.classList.add("operations__tab--active");
  const ops = document.querySelector(
    `.operations__content--${click.dataset.tab}`
  );
  ops.classList.add("operations__content--active");
});

elNavbar.addEventListener("mouseover", handleHover.bind(0.5));
elNavbar.addEventListener("mouseout", handleHover.bind(1));

btnSliderLeft.addEventListener("click", (e) => updateSlide(e.target));
btnSliderRight.addEventListener("click", (e) => updateSlide(e.target));
document.addEventListener("keydown", (e) => {
  (e.key === "ArrowRight" || e.key === "ArrowLeft") && updateSlide(e.key);
});

elDots.addEventListener("click", (e) => {
  if (e.target.classList.contains("dots__dot"))
    updateSlide(+e.target.dataset.slide);
});
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

// Intersection Observer API
const headerObserver = new IntersectionObserver(
  callbackHeaderObserver.bind(elNavbar),
  {
    root: null,
    rootMargin: `-${elNavbar.getBoundingClientRect().height}px`,
    threshold: 0,
  }
);
headerObserver.observe(header);

const sectionObserver = new IntersectionObserver(callbackSectionObserver, {
  root: null,
  threshold: 0.15,
});
sectionAll.forEach((el) => {
  el.classList.add("section--hidden");
  sectionObserver.observe(el);
});

// lazy loader
const imgObserver = new IntersectionObserver(callbackImgObserver, {
  root: null,
  rootMargin: "120px",
  threshold: 0.15,
});
imgsLazy.forEach((el) => imgObserver.observe(el));
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
