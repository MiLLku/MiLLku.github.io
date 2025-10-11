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

  - block: markdown
    content:
      title: ""
      subtitle: ""
      text: |-
        <div class="slider-container">
          <div class="slide">
            <img src="/ko/blog/get-started/featured.jpg" alt="첫 번째 슬라이드">
          </div>
          <div class="slide">
            <img src="/ko/blog/project-management/featured.jpg" alt="두 번째 슬라이드">
          </div>
          <div class="slide">
            <img src="/ko/blog/data-visualization/featured.jpg" alt="세 번째 슬라이드">
          </div>
          <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
          <a class="next" onclick="plusSlides(1)">&#10095;</a>
        </div>

        <script>
          let slideIndex = 1;
          showSlides(slideIndex);

          function plusSlides(n) {
            showSlides(slideIndex += n);
          }

          function showSlides(n) {
            let i;
            let slides = document.getElementsByClassName("slide");
            if (n > slides.length) {slideIndex = 1}
            if (n < 1) {slideIndex = slides.length}
            for (i = 0; i < slides.length; i++) {
              slides[i].style.display = "none";
            }
            if (slides.length > 0) {
              slides[slideIndex-1].style.display = "block";
            }
          }
          
          setInterval(function() {
            plusSlides(1);
          }, 3000);
        </script>
    design:
      columns: '1'

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

  - block: collection
    content:
      title: "최신 글"
      filters:
        folders: [blog]
        count: 3
        offset: 0
    design:
      view: card

  - block: collection
    content:
      title: "과거 글"
      filters:
        folders: [blog]
        count: 6
        offset: 3
    design:
      view: list

  - block: markdown
    content:
      title: "오시는 길"
      text: |-
        <div id="map" style="height: 400px; border-radius: 10px;"></div>
        <script>
          var map = L.map('map').setView([35.8469, 127.1293], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          L.marker([35.8469, 127.1293]).addTo(map)
            .bindPopup('전북대학교 전주캠퍼스')
            .openPopup();
        </script>
    design:
      columns: '1'
      spacing:
        padding: ['3rem', 0, '6rem', 0]
---
