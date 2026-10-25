---
title: Своя периферия для QEMU-ESP32
date: '2026-08-01'
tags:
  - Эмуляция
  - ESP32
  - Аудио
sources:
  - label: QEMU-ESP32
    url: 'https://github.com/Witali/QEMU-ESP32'
  - label: LPC Sound Codec Lab
    url: 'https://witali.github.io/LPC-sound-codec/'
---

Начал свою ветку QEMU-ESP32 с переноса моделей платы из работы над видеопроигрывателем.
Добавил устройства SD по SPI и экран ST7789, уточнил сброс и обработку GPIO.
Подключил пакетное чтение данных с SD.
В LPC Sound Codec Lab подготовил звуковые примеры и страницу демонстрации на GitHub Pages.
