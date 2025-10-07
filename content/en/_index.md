---
title: 'Home'
date: 2025-09-25
type: landing
sections:
  - block: markdown
    content:
      title: "Park MinHo's Blog"
      subtitle: "Game Programming, Mobile, AI"
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

  - block: collection
    content:
      title: "Latest Posts"
      filters:
        folders:
          - blog
        count: 3
    design:
      view: card 

  - block: collection
    content:
      title: "Past Posts"
      filters:
        folders:
          - blog
        count: 2 
        offset: 2
    design:
      view: list 

  # - block: contact
  #   content:
  #     title: Location
  #     text: |-
  #       Jeonbuk National University, Jeonju Campus
  #     coordinates:
  #       latitude: '35'
  #       longitude: '127'
  #     address:
  #       street: 567 Baekje-daero, Deokjin-gu
  #       city: Jeonju-si
  #       region: Jeollabuk-do
  #       postcode: '54896'
  #       country: South Korea
  #       country_code: KR

    design:
      spacing:
        padding: ['3rem', 0, '6rem', 0]
---
