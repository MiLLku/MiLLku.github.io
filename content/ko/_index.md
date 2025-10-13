---
title: 'Home'
date: 2025-09-25
type: landing
sections:
  - block: markdown
    content:
      title: "박민호의 블로그"
      subtitle: "게임 프로그래밍, 모바일, 그리고 AI에 대한 이야기를 나눕니다."
    design:
      align: center
      background:
        image:
          filename: 'JuJak.png'
        image_darken: 0.6
      text_color_light: true

  - block: resume-biography
    content:
      username: admin
    design:
      spacing:
        padding: [0, 0, 0, 0]
      biography:
        style: 'text-align: justify; font-size: 0.8em;'
      avatar:
        size: medium
        shape: circle

  - block: markdown
    content:
      text: |
        <style>
          .slider-container { position: relative; max-width: 100%; margin: auto; overflow: hidden; border-radius: 10px; }
          .slider-container .slide { display: none; width: 100%; }
          .slider-container .slide img { width: 100%; vertical-align: middle; }
          .slider-container .prev, .slider-container .next { cursor: pointer; position: absolute; top: 50%; width: auto; padding: 16px; margin-top: -22px; color: white; font-weight: bold; font-size: 20px; transition: 0.6s ease; border-radius: 0 3px 3px 0; user-select: none; background-color: rgba(0,0,0,0.5); }
          .slider-container .next { right: 0; border-radius: 3px 0 0 3px; }
          .slider-container .prev:hover, .slider-container .next:hover { background-color: rgba(0,0,0,0.8); }
        </style>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <div class="slider-container">
                <div class="slide"><img src="/blog/random-map/oni.jpg" alt="슬라이드 1"></div>
                <div class="slide"><img src="/blog/sampling/prob.jpg" alt="슬라이드 2"></div>
                <div class="slide"><img src="/blog/ui-management/ui.jpg" alt="슬라이드 3"></div>
                <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                <a class="next" onclick="plusSlides(1)">&#10095;</a>
              </div>
            </div>
          </div>
        </div>

        <script>
          let slideIndex = 1;
          showSlides(slideIndex);
          function plusSlides(n) { showSlides(slideIndex += n); }
          function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("slide");
            if (slides.length === 0) return;
            if (n > slides.length) { slideIndex = 1 }
            if (n < 1) { slideIndex = slides.length }
            for (i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
            if (slides.length > 0) { slides[slideIndex-1].style.display = "block"; }
          }
          setInterval(function() { plusSlides(1); }, 3000);
        </script>
    design:
      spacing:
        padding: ["20px", "0", "20px", "0"]

  - block: collection
    content:
      title: "추천 글"
      filters:
        folders: [blog]
        tag: Featured
        count: 3
    design:
      view: custom-view-1.html

  - block: collection
    content:
      title: "포토폴리오"
      filters:
        folders: [blog]
        tag: Portfolio
        count: 3
    design:
      view: card
      
  - block: collection
    content:
      title: "코딩 이야기"
      filters:
        folders: [blog]
        tag: Coding Stories
        count: 3
    design:
      view: custom-view-2.html

  - block: markdown
    content:
      text: |
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

        <div class="container-fluid">
          <div class="row">
            <div class="col-12">
              <h2 style="text-align: center; margin-bottom: 1.5rem;">오시는 길</h2>
              <div id="map" style="width: 450px; height: 450px; border-radius: 10px;"></div>
            </div>
          </div>
        </div>

        <script>
          window.addEventListener('load', function () {
            const mapElement = document.getElementById('map');
            if (mapElement && typeof L !== 'undefined') {
              var map = L.map('map').setView([35.8469, 127.1293], 15);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
              L.marker([35.8469, 127.1293]).addTo(map).bindPopup('전북대학교 전주캠퍼스').openPopup();
            }
          });
        </script>
    design:
      spacing:
        padding: ['3rem', 0, '6rem', 0]
---