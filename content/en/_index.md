---
title: 'Home'
date: 2025-09-25
type: landing
sections:
  - block: hero
    content:
      title: "Park MinHo's Blog"
      tagline: "Game Programming, Mobile, AI"
      background:
        image:
          filename: 'JuJak.png'
        hero_overlay:
          gradient_start: 'rgba(0, 0, 0, 0.6)'
          gradient_end: 'rgba(0, 0, 0, 0.6)'

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
        count: 2
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
