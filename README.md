# SAi Math Figure Generator

DSE Math Figure Generator - Electron desktop app with Python backend for generating precise mathematical figures.

## Features

- **Matplotlib mode**: Generate precise mathematical plots using Python
- **TikZ mode**: Generate LaTeX-quality figures using TikZ/PGFPlots
- **Quick Templates**: Pre-built DSE math templates (Linear, Quadratic, Circle, Trig, Triangle)
- **Live Preview**: Instant preview with zoom controls
- **Export**: Save as PNG/SVG/PDF

## Architecture

```
Electron (Desktop UI)
    |
    |-- IPC -->
    |
Python Flask Backend (localhost:5678)
    |
    |-- Matplotlib --> PNG
    |-- TikZ/pdflatex --> PDF --> PNG
```

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.9
- **TeX Live** (optional, for TikZ mode)
- **poppler-utils** or **ImageMagick** (for TikZ PDF-to-PNG conversion)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/kyleyct/sai-math-figure-generator.git
cd sai-math-figure-generator

# 2. Install Node dependencies
npm install

# 3. Set up Python backend
cd python-backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 4. Run the app
npm start
```

## Usage with Seed 1.8

1. Open SAi platform, use Seed 1.8 to generate drawing code
2. Copy the generated code
3. Open this app, select mode (Matplotlib/TikZ)
4. Paste code into the editor
5. Click "Generate Figure"
6. Save the output image

## Build for Distribution

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Project Structure

```
sai-math-figure-generator/
  main.js              # Electron main process
  preload.js           # Electron preload script
  package.json         # Node.js config
  renderer/
    index.html         # Frontend UI
    renderer.js        # Frontend logic + templates
    styles.css         # UI styles
  python-backend/
    server.py          # Flask API server
    renderer_matplotlib.py  # Matplotlib renderer
    renderer_tikz.py   # TikZ/LaTeX renderer
    requirements.txt   # Python dependencies
```

## License

MIT
