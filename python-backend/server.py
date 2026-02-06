import argparse
import base64
import io
import os
import sys
import traceback

from flask import Flask, jsonify, request
from flask_cors import CORS

from renderer_matplotlib import render_matplotlib
from renderer_tikz import render_tikz

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'matplotlib': True,
        'tikz': check_tikz_available()
    })


def check_tikz_available():
    import shutil
    return shutil.which('pdflatex') is not None


@app.route('/render', methods=['POST'])
def render():
    data = request.get_json()
    mode = data.get('mode', 'matplotlib')
    code = data.get('code', '')

    if not code.strip():
        return jsonify({'success': False, 'error': 'No code provided'})

    try:
        if mode == 'matplotlib':
            img_bytes = render_matplotlib(code)
        elif mode == 'tikz':
            if not check_tikz_available():
                return jsonify({
                    'success': False,
                    'error': 'pdflatex not found. Please install TeX Live for TikZ support.'
                })
            img_bytes = render_tikz(code)
        else:
            return jsonify({'success': False, 'error': f'Unknown mode: {mode}'})

        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        return jsonify({'success': True, 'image': img_base64})

    except Exception as e:
        error_msg = traceback.format_exc()
        return jsonify({'success': False, 'error': str(e), 'traceback': error_msg})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5678)
    args = parser.parse_args()

    print(f'Starting Python backend on port {args.port}...')
    app.run(host='127.0.0.1', port=args.port, debug=False)
