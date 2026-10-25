---
title: Видеокодеки помещаются во внутреннюю память
date: '2026-08-05'
tags:
  - ESP32
  - Видео
sources:
  - label: HLV / Multi-codec Device Lab
    url: 'https://github.com/Witali/HLV-codec'
---

В HLV / Multi-codec Device Lab добавил профиль MPEG-1 с MP2 для QVGA.
Для BPV7 настроил входное кольцо размером 8 КиБ.
Уточнил плавное изменение смещения PDM, а профиль MPEG-4 SP со звуком уложил во внутреннюю RAM.
