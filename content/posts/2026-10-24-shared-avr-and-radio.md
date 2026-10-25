---
title: Общее ядро AVR и проверки радио
date: '2026-10-24'
tags:
  - MicroMusic
  - yoRadio
  - QEMU
videos:
  - label: Одного килобайта хватит всем!
    url: 'https://youtu.be/WqFaOTUdEe0'
    published: '2026-10-24'
sources:
  - label: MicroMusic — плееры
    url: 'https://witali.github.io/MicroMusic/'
  - label: yoRadio / Small TV
    url: 'https://github.com/Witali/yoRadio'
  - label: QEMU-ESP32
    url: 'https://github.com/Witali/QEMU-ESP32'
---
Объединил эмуляцию AVR вокруг общего ядра с профилями ATtiny13A и ATtiny88.
Проверил эквивалентность полных музыкальных произведений между профилями и движками.
В основную ветку MicroMusic вошли декодирование Speex и оптимизации широкополосного режима.
В yoRadio продолжил проверки Vorbis, восстановления Wi-Fi и работы интерфейса во время сетевых сбоев.
Для Small TV расширил набор проверок JPEG и сценариев восстановления фотографий.

В QEMU-ESP32 уточнил регистр тактирования Wi-Fi, чтение статуса Flash и поведение DHCP в режиме AP+STA, сохранив результаты регрессионных проверок.
