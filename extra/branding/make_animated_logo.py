# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Animate the ELITZE logo with warm, cohesive motion.

Base: branding/elitze-sentinel-logo.png (the actual artwork).
Motion: ring rotation, eye pulse, node glow - all warm amber/gold.
Theme: cohesive - the logo IS the animation, not glows pasted on.
"""
from __future__ import annotations
import math
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

SRC = r"C:\Elitze Sentinel Frontier Oos\branding\elitze-sentinel-logo.png"
OUT = r"C:\Elitze Sentinel Frontier Oos\branding\elitze-sentinel-logo-animated.gif"

# Warm palette from the logo itself - extract and amplify
WARM_AMBER = (255, 176, 48)
WARM_GOLD = (255, 215, 96)
WARM_EYE = (255, 230, 140)
WARM_RING = (255, 190, 64)


def warm_tint(img: Image.Image, strength: float = 0.15) -> Image.Image:
    """Apply subtle warm color grading to entire frame."""
    # Enhance warmth: slightly boost red/green, reduce blue in midtones
    arr = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    # Warm lift in shadows/midtones
    lift = np.array([0.08, 0.04, -0.02], dtype=np.float32)
    arr = np.clip(arr + lift * (1 - arr.mean(axis=2, keepdims=True)) * strength, 0, 1)
    return Image.fromarray((arr * 255).astype(np.uint8), "RGB")


def rotate_center(img: Image.Image, angle: float) -> Image.Image:
    """Rotate image around center, preserving size."""
    return img.rotate(angle, resample=Image.BICUBIC, center=None, translate=None, fillcolor=None)


def radial_mask(size: tuple[int, int], r_in: float, r_out: float) -> Image.Image:
    """Create a ring mask (white in ring, black elsewhere)."""
    w, h = size
    cx, cy = w / 2, h / 2
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    mask = np.clip(np.minimum(dist - r_in, r_out - dist), 0, 1)
    return Image.fromarray((mask * 255).astype(np.uint8), "L")


def composite_over(base: Image.Image, overlay: Image.Image, mask: Image.Image) -> Image.Image:
    """Alpha composite overlay onto base using mask."""
    base = base.convert("RGBA")
    overlay = overlay.convert("RGBA")
    mask = mask.convert("L")
    return Image.composite(overlay, base, mask).convert("RGB")


def build_frame(base_rgb: Image.Image, t: float, n_frames: int) -> Image.Image:
    """Build one animation frame from the base logo."""
    w, h = base_rgb.size
    cx, cy = w / 2, h / 2

    # Start with warm-tinted base
    frame = warm_tint(base_rgb, 0.12)

    # 1. ROTATING RUNIC RING
    # The logo has a runic ring around the eye at ~radius 140-220px (at 1376px)
    # Extract ring region, rotate it, blend back
    r_in, r_out = min(w, h) * 0.24, min(w, h) * 0.36
    ring_mask = radial_mask((w, h), r_in, r_out)

    # Rotate the base for the ring region
    angle = (t / n_frames) * 360.0 * 0.5  # half rotation per loop = subtle
    rotated = rotate_center(base_rgb, angle)
    frame = composite_over(frame, rotated, ring_mask)

    # 2. EYE PULSE (central iris glow)
    # Eye at center, radius ~0.12*min_dim
    eye_r = min(w, h) * 0.10
    eye_mask = radial_mask((w, h), 0, eye_r)
    # Warm glow overlay on eye
    eye_glow = Image.new("RGB", (w, h), WARM_EYE)
    pulse = 0.5 + 0.5 * math.sin(t * 2 * math.pi / (n_frames / 1.5))
    eye_glow_mask = Image.eval(eye_mask, lambda v: int(v * (0.15 + 0.25 * pulse)))
    frame = composite_over(frame, eye_glow, eye_glow_mask)

    # 3. CARDINAL NODES PULSE (4 nodes at N/S/E/W on ring)
    node_r = min(w, h) * 0.30
    node_radius = int(min(w, h) * 0.025)
    for i in range(4):
        angle_node = i * math.pi / 2 + math.sin(t * 2 * math.pi / (n_frames / 2)) * 0.05  # slight orbit
        nx = cx + node_r * math.cos(angle_node)
        ny = cy + node_r * math.sin(angle_node)
        # Pulse intensity
        node_pulse = 0.5 + 0.5 * math.sin(t * 2 * math.pi / (n_frames / 1.2) + i)
        node_glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(node_glow)
        r = int(node_radius * (1 + 0.8 * node_pulse))
        alpha = int(100 + 155 * node_pulse)
        draw.ellipse([nx - r, ny - r, nx + r, ny + r], fill=(*WARM_AMBER, alpha))
        node_glow = node_glow.filter(ImageFilter.GaussianBlur(radius=8))
        frame = Image.alpha_composite(frame.convert("RGBA"), node_glow).convert("RGB")

    # 4. SUBTLE VIGNETTE to keep focus centered
    vignette = radial_mask((w, h), min(w, h) * 0.35, min(w, h) * 0.55)
    vignette = Image.eval(vignette, lambda v: int(255 - v * 40))
    frame = Image.composite(frame, Image.eval(frame, lambda p: int(p * 0.97)), vignette)

    return frame


def main():
    base = Image.open(SRC).convert("RGB")
    print(f"Base: {base.size}, mode={base.mode}")

    n_frames = 48
    frames = []
    for i in range(n_frames):
        f = build_frame(base, i, n_frames)
        # Resize to reasonable GIF size (half)
        f = f.resize((base.width // 2, base.height // 2), Image.LANCZOS)
        frames.append(f)

    # Ping-pong for seamless loop
    frames += frames[::-1][1:-1]

    frames[0].save(
        OUT, save_all=True, append_images=frames[1:],
        duration=60, loop=0, disposal=2, optimize=False
    )
    print(f"Wrote {OUT}: {len(frames)} frames")


if __name__ == "__main__":
    main()