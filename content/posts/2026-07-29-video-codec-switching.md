---
title: Переключение кодеков без неприятных сюрпризов
date: '2026-07-29'
tags:
  - ESP32
  - Видео
sources:
  - label: HLV / Multi-codec Device Lab
    url: 'https://github.com/Witali/HLV-codec'
---

В HLV / Multi-codec Device Lab поправил ответы статуса при работе с SD и ускорил перемотку AVI через Fast Seek.
Исправил воспроизведение DivX после смены кодека.
Сохранил регрессионные проверки, чтобы эти ошибки было легче поймать при следующих изменениях.
