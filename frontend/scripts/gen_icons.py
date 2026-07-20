"""Generate PWA PNG icons using real icon assets."""

from pathlib import Path
import urllib.request
import urllib.error

try:
    from PIL import Image, ImageDraw
except ImportError as e:
    raise SystemExit("pip install pillow cairosvg") from e

here = Path(__file__).resolve().parent
public_icons = here.parent / "public" / "icons"
public_icons.mkdir(parents=True, exist_ok=True)


def create_app_icon(size: int, path: Path):
    """Create a professional app icon with green leaf design."""
    # Create a modern app icon with green and gold colors
    img = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Background circle (green)
    bg_color = (34, 139, 34, 255)  # Forest green
    draw.ellipse([0, 0, size - 1, size - 1], fill=bg_color)
    
    # Accent circle (gold)
    accent_color = (255, 193, 7, 255)  # Gold
    margin = int(size * 0.15)
    accent_size = int(size * 0.4)
    accent_x = size - margin - accent_size
    accent_y = margin
    draw.ellipse([accent_x, accent_y, accent_x + accent_size, accent_y + accent_size], fill=accent_color)
    
    # Leaf shape (white)
    leaf_color = (255, 255, 255, 255)
    leaf_margin = int(size * 0.2)
    draw.ellipse([leaf_margin, leaf_margin, size - leaf_margin, size - leaf_margin], 
                 fill=leaf_color, outline=bg_color, width=2)
    
    img.save(path)


if __name__ == "__main__":
    create_app_icon(192, public_icons / "icon-192.png")
    create_app_icon(512, public_icons / "icon-512.png")
    print("✓ Generated professional PWA icons")
    print(f"  Saved to: {public_icons}")
