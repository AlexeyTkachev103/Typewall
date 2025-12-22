from flask import Flask, render_template, request, send_file, jsonify
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
import math

app = Flask(__name__)

FONT_DIR = os.path.join(app.static_folder, 'fonts')

RESOLUTIONS = {
    '800x600': (800, 600),
    '1024x768': (1024, 768),
    '1920x1080': (1920, 1080),
    '2560x1440': (2560, 1440),
    '3840x2160': (3840, 2160)
}

POSITIONS = {
    'top-left': (0.1, 0.1),
    'top-center': (0.5, 0.1),
    'top-right': (0.9, 0.1),
    'middle-left': (0.1, 0.5),
    'middle-center': (0.5, 0.5),
    'middle-right': (0.9, 0.5),
    'bottom-left': (0.1, 0.9),
    'bottom-center': (0.5, 0.9),
    'bottom-right': (0.9, 0.9)
}

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient(width, height, color1, color2, gradient_type, direction):
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    c1 = hex_to_rgb(color1)
    c2 = hex_to_rgb(color2)

    if gradient_type == 'linear':
        if direction == 'horizontal':
            for x in range(width):
                r = int(c1[0] + (c2[0] - c1[0]) * x / width)
                g = int(c1[1] + (c2[1] - c1[1]) * x / width)
                b = int(c1[2] + (c2[2] - c1[2]) * x / width)
                draw.line([(x, 0), (x, height)], fill=(r, g, b))
        elif direction == 'vertical':
            for y in range(height):
                r = int(c1[0] + (c2[0] - c1[0]) * y / height)
                g = int(c1[1] + (c2[1] - c1[1]) * y / height)
                b = int(c1[2] + (c2[2] - c1[2]) * y / height)
                draw.line([(0, y), (width, y)], fill=(r, g, b))
        elif direction == 'diagonal-tl-br':
            for i in range(width + height):
                progress = i / (width + height)
                r = int(c1[0] + (c2[0] - c1[0]) * progress)
                g = int(c1[1] + (c2[1] - c1[1]) * progress)
                b = int(c1[2] + (c2[2] - c1[2]) * progress)
                for x in range(width):
                    y = i - x
                    if 0 <= y < height:
                        draw.point((x, y), fill=(r, g, b))
        elif direction == 'diagonal-tr-bl':
            for i in range(width + height):
                progress = i / (width + height)
                r = int(c1[0] + (c2[0] - c1[0]) * progress)
                g = int(c1[1] + (c2[1] - c1[1]) * progress)
                b = int(c1[2] + (c2[2] - c1[2]) * progress)
                for x in range(width):
                    y = i - (width - x)
                    if 0 <= y < height:
                        draw.point((x, y), fill=(r, g, b))
    elif gradient_type == 'radial':
        center_x = width // 2
        center_y = height // 2
        max_distance = math.sqrt(center_x**2 + center_y**2)

        for y in range(height):
            for x in range(width):
                distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                progress = min(distance / max_distance, 1.0)
                r = int(c1[0] + (c2[0] - c1[0]) * progress)
                g = int(c1[1] + (c2[1] - c1[1]) * progress)
                b = int(c1[2] + (c2[2] - c1[2]) * progress)
                draw.point((x, y), fill=(r, g, b))

    return img

def get_font(font_name, size, bold=False, italic=False):
    font_variants = {
        'Arial': 'DejaVuSans',
        'Times': 'DejaVuSerif',
        'Courier': 'DejaVuSansMono',
        'Georgia': 'DejaVuSerif',
        'Verdana': 'DejaVuSans',
        'FiraCode': 'FiraCodeNerdFont-Regular',
        'JetBrainsMono': 'JetBrainsMonoNerdFont-Regular',
        'Hack': 'HackNerdFont-Regular',
        'RobotoMono': 'RobotoMonoNerdFont-Regular',
        'SourceCodePro': 'SauceCodeProNerdFont-Regular'
    }

    base_name = font_variants.get(font_name, 'DejaVuSans')

    if font_name in ['FiraCode', 'JetBrainsMono', 'Hack', 'RobotoMono', 'SourceCodePro']:
        if bold and italic:
            font_file = base_name.replace('-Regular', '-BoldItalic') + '.ttf'
        elif bold:
            font_file = base_name.replace('-Regular', '-Bold') + '.ttf'
        elif italic:
            font_file = base_name.replace('-Regular', '-Italic') + '.ttf'
        else:
            font_file = f'{base_name}.ttf'
    else:
        if bold and italic:
            font_file = f'{base_name}-BoldOblique.ttf'
        elif bold:
            font_file = f'{base_name}-Bold.ttf'
        elif italic:
            font_file = f'{base_name}-Oblique.ttf'
        else:
            font_file = f'{base_name}.ttf'

    font_path = os.path.join(FONT_DIR, font_file)

    if not os.path.exists(font_path):
        font_path = os.path.join(FONT_DIR, f'{base_name}.ttf')
        if not os.path.exists(font_path):
            font_path = os.path.join(FONT_DIR, 'DejaVuSans.ttf')

    try:
        return ImageFont.truetype(font_path, size)
    except:
        return ImageFont.load_default()

def draw_text_block(draw, width, height, text_block):
    text = text_block.get('text', '')
    if not text:
        return

    font_name = text_block.get('font_family', 'Arial')
    font_size = int(text_block.get('font_size', 48))
    bold = text_block.get('bold', False)
    italic = text_block.get('italic', False)
    underline = text_block.get('underline', False)

    font = get_font(font_name, font_size, bold, italic)
    text_color = hex_to_rgb(text_block.get('text_color', '#000000'))

    position = text_block.get('position', 'middle-center')
    pos_x, pos_y = POSITIONS.get(position, (0.5, 0.5))

    lines = text.split('\n')
    line_height = font_size * 1.2

    total_height = line_height * len(lines)
    start_y = int(height * pos_y - total_height / 2)

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        if pos_x == 0.1:
            x = int(width * 0.1)
        elif pos_x == 0.9:
            x = int(width * 0.9 - text_width)
        else:
            x = int(width / 2 - text_width / 2)

        y = start_y + int(i * line_height)

        draw.text((x, y), line, font=font, fill=text_color)

        if underline:
            underline_y = y + text_height + 2
            draw.line([(x, underline_y), (x + text_width, underline_y)], fill=text_color, width=2)

def create_image(params):
    width = int(params.get('width', 1920))
    height = int(params.get('height', 1080))

    bg_type = params.get('bg_type', 'solid')

    if bg_type == 'solid':
        color = hex_to_rgb(params.get('bg_color', '#ffffff'))
        img = Image.new('RGB', (width, height), color)
    else:
        color1 = params.get('gradient_color1', '#ffffff')
        color2 = params.get('gradient_color2', '#000000')
        gradient_type = params.get('gradient_type', 'linear')
        direction = params.get('gradient_direction', 'horizontal')
        img = create_gradient(width, height, color1, color2, gradient_type, direction)

    draw = ImageDraw.Draw(img)

    text_blocks = params.get('text_blocks', [])
    for text_block in text_blocks:
        draw_text_block(draw, width, height, text_block)

    return img

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/preview', methods=['POST'])
def preview():
    params = request.json
    img = create_image(params)

    max_preview_width = 800
    if img.width > max_preview_width:
        ratio = max_preview_width / img.width
        new_size = (max_preview_width, int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    buffered = io.BytesIO()
    img.save(buffered, format='PNG')
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return jsonify({'image': f'data:image/png;base64,{img_str}'})

@app.route('/download', methods=['POST'])
def download():
    params = request.json
    img = create_image(params)

    img_format = params.get('format', 'png').upper()
    if img_format not in ['PNG', 'JPEG']:
        img_format = 'PNG'

    buffered = io.BytesIO()
    if img_format == 'JPEG':
        img = img.convert('RGB')
        img.save(buffered, format='JPEG', quality=95)
        mimetype = 'image/jpeg'
        ext = 'jpg'
    else:
        img.save(buffered, format='PNG')
        mimetype = 'image/png'
        ext = 'png'

    buffered.seek(0)
    return send_file(buffered, mimetype=mimetype, as_attachment=True, download_name=f'wallpaper.{ext}')

if __name__ == '__main__':
    app.run(debug=True)