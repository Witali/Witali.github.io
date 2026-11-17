# Spectrum conversion examples

The `chelsea` and `coffee` photographs are public scikit-image 0.25.2 sample data, released under CC0 according to the [official data documentation](https://scikit-image.org/docs/0.25.x/api/skimage.data.html).

The `motorcycle` photograph is the left view of `stereo_motorcycle` in scikit-image 0.25.2, from the Middlebury 2014 stereo benchmark. Middlebury [permits use and publication of these images](https://vision.middlebury.edu/stereo/data/) and requests citation of the corresponding paper: D. Scharstein, H. Hirschmüller, Y. Kitajima, G. Krathwohl, N. Nesic, X. Wang, and P. Westling, *High-resolution stereo datasets with subpixel-accurate ground truth*, GCPR 2014. The scikit-image sample is downsampled from the benchmark photograph.

- `*-original.png`: original RGB photograph, losslessly re-encoded without ancillary metadata.
- `*-before.png`: the converter's own 256×192 center crop and Lanczos resampling, before color conversion.
- `*-after.png`: the converter's native 256×192 RGB rendering, without display scaling or smoothing.
- `*.scr`: the corresponding 6,912-byte Spectrum screen, including bitmap and attributes.

Generated with the `codex/zx-neural-screen` branch of the public Witali/ZX-video repository, using NumPy 2.5.4 and Pillow 13.0.0. The coffee example retains source revision `6e9794001219b9e00808e5499f5ce094fe02ff39`. The refreshed cat and motorcycle examples use completed source revision `d48ed389acbacc71a5df1c4efd01809d00359e65`, including the palette-step repair:

```text
python -m toolkit.zx_neural chelsea-original.png chelsea.scr --crop --pixel-art --preview chelsea-after.png
python -m toolkit.zx_neural coffee-original.png coffee.scr --crop --pixel-art --preview coffee-after.png
python -m toolkit.zx_neural motorcycle-original.png motorcycle.scr --crop --pixel-art --preview motorcycle-after.png
```

No subject mask, additional model, manual retouching, or post-conversion color correction was used.
