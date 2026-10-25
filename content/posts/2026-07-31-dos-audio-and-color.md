---
title: 'DOS для ESP32, звук и лаборатория цвета'
date: '2026-07-31'
tags:
  - ESP32
  - Аудио
  - Графика
sources:
  - label: DosToEsp
    url: 'https://github.com/Witali/DosToEsp'
  - label: LPC Sound Codec Lab
    url: 'https://witali.github.io/LPC-sound-codec/'
  - label: Block Palette Compression
    url: 'https://witali.github.io/block-palette-compression/'
---

Начал сохранять в Git DosToEsp — переводчик программ 8086 для ESP32.
Добавил среду исполнения, работу с памятью и генерацию нативного кода для блоков инструкций.
В экспериментальном варианте Alley Cat подключил вывод изображения и ввод с клавиатуры.
Отдельно оформил LPC Sound Codec Lab с исходниками и документацией аудиокодеков.
В Block Palette Compression добавил лабораторию цветовых форматов с OKLab, раскладками 4:4:4 и 4:2:0, а также интерактивный разбор DCT.
