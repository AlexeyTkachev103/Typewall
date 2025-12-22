# Quote Wallpaper Generator

A Flask-based web application for creating beautiful images with text (wallpapers, quotes, motivators).

## Features

*   **Backgrounds**: Solid colors and various gradients.
*   **Resolutions**: Predefined options (Full HD, 2K, 4K) and custom sizes.
*   **Text Blocks**: Add multiple text elements with various fonts (including Nerd Fonts), sizes, colors, and styles (bold, italic, underline).
*   **Positioning**: 9 predefined positions for each text block.
*   **Live Preview**: Real-time updates as you change parameters.
*   **Export**: Download images in PNG or JPEG format.

## Installation and Running

### Requirements
*   Python 3.8+
*   pip

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/quote-wallpaper.git
    cd quote-wallpaper
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Linux/macOS
    source venv/bin/activate
    # On Windows
    venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run the application:**
    ```bash
    python app.py
    ```
5.  **Open in your browser:**
    ```
    http://127.0.0.1:5000
    ```

## Usage

1.  **Configure Background**: Choose solid color or gradient, select colors and directions.
2.  **Set Resolution**: Pick a predefined size or enter custom dimensions.
3.  **Add Text**: Use "+ Add Text Block" to add text, select font, size, color, style, and position.
4.  **Manage Blocks**: Delete blocks using "×".
5.  **Preview**: See real-time updates.
6.  **Export**: Choose PNG or JPEG and click "Download Wallpaper".

## Technologies

*   **Backend**: Flask, Pillow
*   **Frontend**: Vanilla JavaScript, CSS Grid/Flexbox, Fetch API
*   **Fonts**: DejaVu Fonts, Nerd Fonts

## License

MIT
