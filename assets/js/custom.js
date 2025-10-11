// /assets/js/custom.js

// 웹페이지의 모든 리소스(이미지 등)가 완전히 로드된 후에 아래 함수를 실행합니다.
window.addEventListener('load', function () {

  console.log("SUCCESS: custom.js가 로드되어 실행되었습니다.");

  // --- 슬라이더 기능 초기화 ---
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    console.log("INFO: 슬라이더를 찾았습니다. 기능을 초기화합니다.");
    let slideIndex = 1;
    const slides = sliderContainer.querySelectorAll(".slide");
    const prevBtn = sliderContainer.querySelector('.prev');
    const nextBtn = sliderContainer.querySelector('.next');

    function showSlides(n) {
      if (slides.length === 0) return;
      if (n > slides.length) { slideIndex = 1 }
      if (n < 1) { slideIndex = slides.length }
      for (let i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
      slides[slideIndex - 1].style.display = "block";
    }

    if (slides.length > 0) {
      prevBtn.addEventListener('click', () => showSlides(slideIndex += -1));
      nextBtn.addEventListener('click', () => showSlides(slideIndex += 1));
      showSlides(slideIndex);
      setInterval(() => showSlides(slideIndex += 1), 3000);
    }
  } else {
    console.log("INFO: 이 페이지에는 슬라이더가 없습니다.");
  }

  // --- 지도 기능 초기화 ---
  const mapElement = document.getElementById('map');
  if (mapElement) {
    console.log("INFO: 지도(map)를 찾았습니다. 기능을 초기화합니다.");
    try {
      var map = L.map('map').setView([35.8469, 127.1293], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.marker([35.8469, 127.1293]).addTo(map).bindPopup('전북대학교 전주캠퍼스').openPopup();
    } catch (e) {
      console.error("ERROR: 지도 초기화 중 오류가 발생했습니다:", e);
    }
  } else {
    console.log("INFO: 이 페이지에는 지도가 없습니다.");
  }

});