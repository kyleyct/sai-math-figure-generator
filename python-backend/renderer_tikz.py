import io
import os
import shutil
import subprocess
import tempfile


LATEX_TEMPLATE = r"""
\documentclass[tikz,border=2pt]{standalone}
\usepackage{amsmath, amssymb}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usetikzlibrary{calc, decorations.pathreplacing, patterns, angles, quotes}
\begin{document}
%s
\end{document}
"""


def render_tikz(code):
    """
    Compile TikZ code to PDF, then convert to PNG.
    Requires pdflatex and either ImageMagick (magick) or pdftoppm.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        # Write .tex file
        tex_content = LATEX_TEMPLATE % code
        tex_path = os.path.join(tmpdir, 'figure.tex')
        with open(tex_path, 'w', encoding='utf-8') as f:
            f.write(tex_content)

        # Compile with pdflatex
        result = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', 'figure.tex'],
            cwd=tmpdir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30
        )

        pdf_path = os.path.join(tmpdir, 'figure.pdf')
        if not os.path.exists(pdf_path):
            log_path = os.path.join(tmpdir, 'figure.log')
            log_content = ''
            if os.path.exists(log_path):
                with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
                    log_content = f.read()[-2000:]  # Last 2000 chars
            raise RuntimeError(f'pdflatex failed.\n{log_content}')

        # Convert PDF to PNG
        png_path = os.path.join(tmpdir, 'figure.png')

        # Try pdftoppm first (commonly available)
        if shutil.which('pdftoppm'):
            subprocess.run(
                ['pdftoppm', '-png', '-r', '300', '-singlefile',
                 pdf_path, os.path.join(tmpdir, 'figure')],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                timeout=30
            )
        # Try ImageMagick
        elif shutil.which('magick'):
            subprocess.run(
                ['magick', '-density', '300', pdf_path, '-quality', '100', png_path],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                timeout=30
            )
        elif shutil.which('convert'):
            subprocess.run(
                ['convert', '-density', '300', pdf_path, '-quality', '100', png_path],
                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                timeout=30
            )
        else:
            raise RuntimeError(
                'No PDF-to-PNG converter found. '
                'Please install poppler-utils (pdftoppm) or ImageMagick.'
            )

        if not os.path.exists(png_path):
            raise RuntimeError('PDF to PNG conversion failed.')

        with open(png_path, 'rb') as f:
            return f.read()
