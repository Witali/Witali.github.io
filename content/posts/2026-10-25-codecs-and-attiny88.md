---
title: Кодеки и музыка на ATtiny88
date: '2026-10-25'
tags: [MicroMusic, yoRadio]
sources:
  - label: Прошивки UM88
    url: https://github.com/Witali/MicroMusic/commit/334f2a17
  - label: История Codec2
    url: https://github.com/Witali/MicroMusic/commit/126e7631
  - label: ESP8266 и Opus
    url: https://github.com/Witali/yoRadio/commit/da103347f
---
В MicroMusic продолжил оптимизацию Speex и LPX и сохранил историю экспериментов с Codec2 отдельными этапами.
Пересобрал и проверил музыкальные прошивки UM88 для двух вариантов плат ATtiny88.
Уменьшил накладные расходы прерывания PWM и зафиксировал проверенную загрузку стереоверсии Lumière на плату.
В yoRadio объединил проверенную поддержку автономного декодирования Opus на ESP8266.
