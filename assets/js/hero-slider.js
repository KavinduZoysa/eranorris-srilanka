const slides = document.querySelectorAll('.slide');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');
const dotsContainer = document.querySelector('.dots');

let currentIndex = 0;

// Lazy load a single slide
function loadSlideImage(slide) {
  const bgUrl = slide.getAttribute('data-bg');
  if (bgUrl && !slide.style.backgroundImage) {
    slide.style.backgroundImage = `url('${bgUrl}')`;
    slide.removeAttribute('data-bg');
  }
}

// Preload the next slide
function preloadNextSlide(index) {
  const nextIndex = (index + 1) % slides.length;
  loadSlideImage(slides[nextIndex]);
}

// Create dots
slides.forEach((slide, index) => {
  const dot = document.createElement('span');
  dot.classList.add('dot');
  if (index === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(index));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  // Ensure current slide is loaded before showing
  loadSlideImage(slides[index]);
  // Preload next slide directly after
  preloadNextSlide(index);

  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

function goToSlide(index) {
  currentIndex = index;
  showSlide(currentIndex);
}

rightArrow.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
});

leftArrow.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
});

// Immediately preload the second slide since the first is visible by default
if (slides.length > 1) {
  preloadNextSlide(0);
}
