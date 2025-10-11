document.addEventListener('DOMContentLoaded', function () {
  const sliderContainer = document.querySelector('.slider-container');
  if (!sliderContainer) return;

  const slider = sliderContainer.querySelector('.slider');
  const slides = sliderContainer.querySelectorAll('.slide');
  const prevBtn = sliderContainer.querySelector('.prev-btn');
  const nextBtn = sliderContainer.querySelector('.next-btn');

  if (slides.length <= 1) {
    if(prevBtn) prevBtn.style.display = 'none';
    if(nextBtn) nextBtn.style.display = 'none';
    return;
  }

  let currentIndex = 0;
  let slideInterval;

  function goToSlide(index) {
    slider.style.transform = 'translateX(' + (-100 * index) + '%)';
  }

  function startSlideShow() {
    stopSlideShow(); // Prevent multiple intervals
    slideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    }, 5000);
  }

  function stopSlideShow() {
      clearInterval(slideInterval);
  }

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    goToSlide(currentIndex);
  });

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(currentIndex);
  });
  
  sliderContainer.addEventListener('mouseenter', stopSlideShow);
  sliderContainer.addEventListener('mouseleave', startSlideShow);

  startSlideShow();
});