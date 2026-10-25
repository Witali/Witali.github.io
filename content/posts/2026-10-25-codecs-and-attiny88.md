---
title: Кодеки и музыка на ATtiny88
date: '2026-10-25'
tags: [MicroMusic, yoRadio]
videos:
  - label: Проверяю прошивку на ATtiny88
    url: https://www.youtube.com/watch?v=_8-hYX5qNTs
    published: '2026-10-25'
sources:
  - label: Прошивки UM88
    url: https://github.com/Witali/MicroMusic/commit/334f2a17
  - label: История Codec2
    url: https://github.com/Witali/MicroMusic/commit/126e7631
  - label: Размер декодера команд
    url: https://github.com/Witali/MicroMusic/blob/0e879434/docs/avr-asm-cookbook/um88-control-size.md
  - label: Замеры PWM-прерывания
    url: https://github.com/Witali/MicroMusic/blob/223f9cc3/docs/avr-asm-cookbook/um88-flag-neutral-irq.md
  - label: ESP8266 и Opus
    url: https://github.com/Witali/yoRadio/commit/da103347f
---
В MicroMusic продолжил оптимизацию Speex и LPX и сохранил историю экспериментов с Codec2 отдельными этапами.
Пересобрал и проверил музыкальные прошивки UM88 для двух вариантов плат ATtiny88.
Уменьшил накладные расходы прерывания PWM и зафиксировал проверенную загрузку стереоверсии Lumière на плату.
В отдельной проверке компактного профиля UM88 сократил код декодирования команд с **2930 до 2830 байт**, а пик обработки плотного восьмиголосного теста — с **26 120 до 19 170 тактов**.
Обычный путь монообработчика PWM в варианте с GPIOR стал занимать **34 такта вместо 44** — примерно на 23% меньше при прежних отсчётах и расписании; это замеры эмулятора.
В yoRadio объединил проверенную поддержку автономного декодирования Opus на ESP8266.
