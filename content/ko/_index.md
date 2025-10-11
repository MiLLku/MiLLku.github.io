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

{{</* partial "custom_slider.html" . */>}}

sections:
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
---

{{</* partial "custom_map.html" . */>}}