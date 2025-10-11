---
title: 'Home'
date: 2025-09-25
type: landing
sections:
  - block: columns
    design:
      columns: 2
      align: start
      spacing:
        padding: ["2rem", "2rem", "4rem", "2rem"]

    content:
      - block: group
        design:
          spacing:
            padding: [0, 0, 0, 0]
        content:
          - block: resume-biography
            content:
              username: admin
            design:
              spacing:
                padding: [0, 0, "1rem", 0]

          - block: markdown
            content:
              text: |
                <style>
                  .slider-container { position: relative; max-width: 100%; margin: auto; overflow: hidden; border-radius: 10px; }
                  .slide { display: none; width: 100%; }
                  .slide img { width: 100%; vertical-align: middle; }
                  .prev, .next { cursor: pointer; position: absolute; top: 50%; padding: 16px; color: white; font-weight: bold; font-size: 20px; background-color: rgba(0,0,0,0.5); border-radius: 3px; }
                  .next { right: 0; }
                </style>

                <div class="slider-container">
                  <div class="slide"><img src="/ko/blog/get-started/featured.jpg" alt="슬라이드 1"></div>
                  <div class="slide"><img src="/ko/blog/project-management/featured.jpg" alt="슬라이드 2"></div>
                  <div class="slide"><img src="/ko/blog/data-visualization/featured.jpg" alt="슬라이드 3"></div>
                  <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                  <a class="next" onclick="plusSlides(1)">&#10095;</a>
                </div>

                <script>
                  let slideIndex = 1;
                  function showSlides(n) {
                    const slides = document.getElementsByClassName("slide");
                    if (slides.length === 0) return;
                    if (n > slides.length) slideIndex = 1;
                    if (n < 1) slideIndex = slides.length;
                    for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
                    slides[slideIndex - 1].style.display = "block";
                  }
                  function plusSlides(n) { showSlides(slideIndex += n); }
                  document.addEventListener("DOMContentLoaded", function() {
                    showSlides(slideIndex);
                    setInterval(() => plusSlides(1), 3000);
                  });
                </script>
            design:
              spacing:
                padding: ["1rem", 0, "1rem", 0]

          - block: markdown
            content:
              text: |
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

                <div id="map" style="height: 300px; border-radius: 10px;"></div>

                <script>
                  window.addEventListener('load', function () {
                    const mapElement = document.getElementById('map');
                    if (mapElement && typeof L !== 'undefined') {
                      var map = L.map('map').setView([35.8469, 127.1293], 15);
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      }).addTo(map);
                      L.marker([35.8469, 127.1293]).addTo(map)
                        .bindPopup('전북대학교 전주캠퍼스').openPopup();
                    }
                  });
                </script>
            design:
              spacing:
                padding: ["2rem", 0, 0, 0]

      - block: group
        design:
          spacing:
            padding: [0, 0, 0, 0]
        content:
          - block: collection
            content:
              title: "추천 글"
              filters:
                folders: [blog]
                count: 3
                offset: 0
            design:
              view: card

          - block: collection
            content:
              title: "포토폴리오"
              filters:
                folders: [blog]
                count: 3
                offset: 3
            design:
              view: card

          - block: collection
            content:
              title: "코딩 이야기"
              filters:
                folders: [blog]
                count: 3
                offset: 6
            design:
              view: card
---
