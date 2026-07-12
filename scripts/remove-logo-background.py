"""Remove cream background and drop shadow from the NeuralHub logo PNG."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def pixel_alpha(r: int, g: int, b: int) -> int:
    """Keep only distinctly blue logo pixels; remove paper and shadow."""
    blue_score = b - (r + g) / 2

    if blue_score > 30:
        return 255
    if blue_score > 4:
        return int(255 * min(1.0, (blue_score - 4) / 26))

    return 0


def remove_background(input_path: Path, output_path: Path) -> None:
    image = Image.open(input_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            alpha = pixel_alpha(r, g, b)

            if alpha < 8:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                pixels[x, y] = (r, g, b, alpha)

    # Trim transparent padding
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)

    # Add modest padding for favicon/header balance
    padded = Image.new("RGBA", (image.width + 32, image.height + 32), (0, 0, 0, 0))
    padded.paste(image, (16, 16), image)
    padded.save(output_path, "PNG", optimize=True)


def make_favicon(source: Path, output_path: Path, size: int = 512) -> None:
    image = Image.open(source).convert("RGBA")
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = ((size - image.width) // 2, (size - image.height) // 2)
    canvas.paste(image, offset, image)
    canvas.save(output_path, "PNG", optimize=True)


if __name__ == "__main__":
    src = Path(sys.argv[1])
    logo_out = Path(sys.argv[2])
    favicon_out = Path(sys.argv[3])

    transparent = logo_out.with_name("logo-transparent-temp.png")
    remove_background(src, transparent)
    make_favicon(transparent, logo_out, 512)
    make_favicon(transparent, favicon_out, 512)
    transparent.unlink(missing_ok=True)
    print(f"Saved {logo_out} and {favicon_out}")
