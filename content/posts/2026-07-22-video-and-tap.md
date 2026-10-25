---
title: Видео для ESP32 и запуск программы на Spectrum
date: '2026-07-22'
tags:
  - ESP32
  - PicoLang
sources:
  - label: HLV / Multi-codec Device Lab
    url: 'https://github.com/Witali/HLV-codec'
  - label: PicoLang
    url: 'https://github.com/Witali/picolang'
---

Перенёс исходники HLV-1 v0.3 в отдельный репозиторий HLV-codec.
Добавил проигрыватель видео из внутренней Flash для платы CYD2USB и проверку производительности в QEMU.
В декодере появился 32-битный считыватель битового потока.
В PicoLang довёл пример для ZX Spectrum до TAP-файла с автоматическим запуском и поправил вывод на экран.
