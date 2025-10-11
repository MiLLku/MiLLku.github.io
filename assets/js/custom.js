window.addEventListener('load', function () {

  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    let slideIndex = 1;
    const slides = sliderContainer.querySelectorAll(".slide");
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    function showSlides(n) {
      if (n > slides.length) { slideIndex = 1 }
      if (n < 1) { slideIndex = slides.length }
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slides[slideIndex - 1].style.display = "block";
    }

    function plusSlides(n) {
      showSlides(slideIndex += n);
    }

    if(prevBtn) {
        prevBtn.addEventListener('click', () => plusSlides(-1));
    }
    if(nextBtn) {
        nextBtn.addEventListener('click', () => plusSlides(1));
    }

    showSlides(slideIndex);

    setInterval(() => plusSlides(1), 3000);
  }


  const mapElement = document.getElementById('map');
  if (mapElement) {
    try {
        var map = L.map('map').setView([35.8469, 127.1293], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([35.8469, 127.1293]).addTo(map)
          .bindPopup('전북대학교 전주캠퍼스')
          .openPopup();
    } catch(e) {

    }
  }

});