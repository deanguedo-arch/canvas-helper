"""Assemble local browser QA screenshots; never reads or writes course sources."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
slugs = ["marketing-10-20-online", "marketing-30-online", "legal-studies-30-online", "tourism-10-20-online", "tourism-30-online"]
routes = ["overview", "how-it-works", "modules", "practice", "projects", "portfolio", "resources"]
for slug in slugs:
    root = Path("projects") / slug / "meta" / "visual-review"
    names = [prefix + route for route in routes for prefix in ["", "studio-", "mobile-"]]
    sheet = Image.new("RGB", (1500, 7 * 390), "#dddddd")
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(names):
        pic = Image.open(root / (name + ".png")).convert("RGB")
        pic.thumbnail((494, 360))
        x, y = (i % 3) * 500, (i // 3) * 390
        draw.text((x + 6, y + 4), name, fill="black")
        sheet.paste(pic, (x + 3, y + 25))
    sheet.save(root / "main-routes-contact.jpg", quality=90)
    names = sorted(p.stem for p in root.glob("module-*.png")) + sorted(p.stem for p in root.glob("project-*.png"))
    sheet = Image.new("RGB", (1500, ((len(names)+2)//3)*390), "#dddddd")
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(names):
        pic=Image.open(root/(name+".png")).convert("RGB");pic.thumbnail((494,360))
        x,y=(i%3)*500,(i//3)*390
        draw.text((x+6,y+4),name,fill="black");sheet.paste(pic,(x+3,y+25))
    sheet.save(root/"modules-contact.jpg",quality=90)
    print(root / "main-routes-contact.jpg")
