document.addEventListener('DOMContentLoaded', function () {

  let slideIndex = 1;
  const slides = document.getElementsByClassName("slide");

  if (slides.length > 0) {
    showSlides(slideIndex);

    setInterval(function() {
      plusSlides(1);
    }, 3000);
  }

  window.plusSlides = function(n) {
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

  if (document.getElementById('map')) {
    var leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletScript.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
    leafletScript.crossOrigin = '';
    
    leafletScript.onload = function () {
      var map = L.map('map').setView([35.8469, 127.1293], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.marker([35.8469, 127.1293]).addTo(map)
        .bindPopup('전북대학교 전주캠퍼스')
        .openPopup();
    };
    document.head.appendChild(leafletScript);
  }

});