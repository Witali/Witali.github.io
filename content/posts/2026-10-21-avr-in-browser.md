---
title: AVR переезжает в WebAssembly
date: '2026-10-21'
tags: [MicroMusic, Web MIDI]
videos:
  - label: Видео о MicroMusic
    url: https://youtu.be/WqFaOTUdEe0
sources:
  - label: AVR на C и WASM
    url: https://github.com/Witali/MicroMusic/commit/27949ac3
  - label: Публикация Web MIDI Player
    url: https://github.com/Witali/Web-MIDI-Player/commit/f9fa181
---
В MicroMusic перенёс эмуляцию AVR и фильтрацию звука в ядро на C, которое работает в браузере через WebAssembly.
Добавил выбор между движками JavaScript и WASM, а затем сделал WASM вариантом по умолчанию.
Проверил оптимизации и длительное воспроизведение, подготовил переносимый набор инструментов для Windows.
Наметил поддержку ATtiny88 и ATmega328.
В Web MIDI Player добавил установку как PWA и автоматическую публикацию на GitHub Pages.
