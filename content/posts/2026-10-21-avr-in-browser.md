---
title: AVR переезжает в WebAssembly
date: '2026-10-21'
tags:
  - MicroMusic
  - Web MIDI
sources:
  - label: MicroMusic — плееры
    url: 'https://witali.github.io/MicroMusic/'
  - label: Web MIDI Player
    url: 'https://witali.github.io/Web-MIDI-Player/'
---
В MicroMusic перенёс эмуляцию AVR и фильтрацию звука в ядро на C, которое работает в браузере через WebAssembly.
Добавил выбор между движками JavaScript и WASM, а затем сделал WASM вариантом по умолчанию.
Проверил оптимизации и длительное воспроизведение, подготовил переносимый набор инструментов для Windows.
В Web MIDI Player добавил установку как PWA и автоматическую публикацию на GitHub Pages.
