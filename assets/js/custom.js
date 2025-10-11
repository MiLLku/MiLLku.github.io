// /assets/js/custom.js

// 웹페이지의 HTML 구조가 준비되면 아래 코드를 실행합니다.
document.addEventListener('DOMContentLoaded', function () {

  console.log("custom.js가 실행되었습니다.");

  // --- 슬라이더 기능 ---
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    console.log("슬라이더 컨테이너를 찾았습니다.");
    let slideIndex = 1;
    const slides = sliderContainer.querySelectorAll(".slide");
    const prevBtn = sliderContainer.querySelector('.prev');
    const nextBtn = sliderContainer.querySelector('.next');

    if (slides.length > 0) {
      showSlides(slideIndex); // 첫 슬라이드 표시
      
      prevBtn.addEventListener('click', () => plusSlides(-1));
      nextBtn.addEventListener('click', () => plusSlides(1));
      
      setInterval(() => plusSlides(1), 3000); // 3초마다 자동 전환
    }

    function plusSlides(n) {
      showSlides(slideIndex += n);
    }

    function showSlides(n) {
      if (n > slides.length) { slideIndex = 1 }
      if (n < 1) { slideIndex = slides.length }
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      slides[slideIndex - 1].style.display = "block";
    }
  } else {
    console.log("이 페이지에는 슬라이더 컨테이너가 없습니다.");
  }


  // --- 지도 기능 ---
  const mapElement = document.getElementById('map');
  if (mapElement) {
    console.log("지도(map) 요소를 찾았습니다.");
    
    // Leaflet CSS 추가
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    // Leaflet JS 추가
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    document.head.appendChild(leafletScript);
    
    // 스크립트 로드가 완료된 후 지도 초기화
    leafletScript.onload = function () {
      console.log("Leaflet 라이브러리 로드 완료. 지도를 초기화합니다.");
      try {
        var map = L.map('map').setView([35.8469, 127.1293], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([35.8469, 127.1293]).addTo(map)
          .bindPopup('전북대학교 전주캠퍼스')
          .openPopup();
      } catch(e) {
        console.error("지도 초기화 중 오류가 발생했습니다:", e);
      }
    };
  } else {
    console.log("이 페이지에는 지도(map) 요소가 없습니다.");
  }
});