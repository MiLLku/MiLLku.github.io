---
title: 'Home'
date: 2025-09-25
type: landing
sections:
  - block: resume-biography
    content:
      # The user's folder name in content/authors/
      username: admin
    design:
      spacing:
        padding: [0, 0, 0, 0]
      biography:
        style: 'text-align: justify; font-size: 0.8em;'
      # Avatar customization
      avatar:
        size: medium  # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
  - block: collection
    content:
      filters:
        folders:
          - blog
    design:
      spacing:
        padding: ['3rem', 0, '6rem', 0]
  - block: contact
    content:
      title: 오시는 길
      text: |-
        전북대학교 전주캠퍼스
      coordinates:
        latitude: '35'
        longitude: '127'
      address:
        street: 567 백제대로, 덕진구
        city: 전주시
        region: 전라북도
        postcode: '54896;
        country: 대한민국
        country_code: KR
    design:
      spacing:
        padding: ['3rem', 0, '6rem', 0]
---
