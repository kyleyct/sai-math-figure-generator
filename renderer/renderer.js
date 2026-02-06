// DOM Elements
const codeEditor = document.getElementById('code-editor');
const btnRender = document.getElementById('btn-render');
const btnClear = document.getElementById('btn-clear');
const btnSave = document.getElementById('btn-save');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const previewImage = document.getElementById('preview-image');
const previewPlaceholder = document.getElementById('preview-placeholder');
const errorMessage = document.getElementById('error-message');
const pythonStatusDot = document.getElementById('python-status');
const statusText = document.getElementById('status-text');

let currentZoom = 1;
let currentImageData = null;

// DSE Math Templates
const templates = {
  matplotlib: {
    linear: `def draw(fig, ax):\n    import numpy as np\n    x = np.linspace(-5, 5, 400)\n    y = 2 * x + 1\n    ax.plot(x, y, 'b-', linewidth=1.5)\n    ax.axhline(0, color='black', linewidth=0.8)\n    ax.axvline(0, color='black', linewidth=0.8)\n    ax.set_xlim(-5, 5)\n    ax.set_ylim(-5, 12)\n    ax.set_xlabel('x')\n    ax.set_ylabel('y')\n    ax.grid(True, linestyle=':', alpha=0.5)\n    ax.set_title('y = 2x + 1')`,
    quadratic: `def draw(fig, ax):\n    import numpy as np\n    x = np.linspace(-4, 4, 400)\n    y = x**2 - 2*x - 3\n    ax.plot(x, y, 'b-', linewidth=1.5)\n    ax.axhline(0, color='black', linewidth=0.8)\n    ax.axvline(0, color='black', linewidth=0.8)\n    ax.plot([-1, 3], [0, 0], 'ro', markersize=5)\n    ax.plot([1], [-4], 'gs', markersize=6)\n    ax.set_xlim(-4, 5)\n    ax.set_ylim(-5, 10)\n    ax.set_xlabel('x')\n    ax.set_ylabel('y')\n    ax.grid(True, linestyle=':', alpha=0.5)\n    ax.set_title('y = x\u00b2 - 2x - 3')`,
    circle: `def draw(fig, ax):\n    import numpy as np\n    theta = np.linspace(0, 2*np.pi, 200)\n    r = 3\n    x = r * np.cos(theta) + 1\n    y = r * np.sin(theta) + 2\n    ax.plot(x, y, 'b-', linewidth=1.5)\n    ax.plot(1, 2, 'r+', markersize=10)\n    ax.axhline(0, color='black', linewidth=0.8)\n    ax.axvline(0, color='black', linewidth=0.8)\n    ax.set_xlim(-4, 6)\n    ax.set_ylim(-3, 7)\n    ax.set_aspect('equal')\n    ax.set_xlabel('x')\n    ax.set_ylabel('y')\n    ax.grid(True, linestyle=':', alpha=0.5)\n    ax.set_title('(x-1)\u00b2 + (y-2)\u00b2 = 9')`,
    trig: `def draw(fig, ax):\n    import numpy as np\n    x = np.linspace(0, 2*np.pi, 400)\n    y = np.sin(x)\n    ax.plot(x, y, 'b-', linewidth=1.5)\n    ax.axhline(0, color='black', linewidth=0.8)\n    ax.set_xlim(0, 2*np.pi)\n    ax.set_ylim(-1.5, 1.5)\n    ax.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])\n    ax.set_xticklabels(['0', '\u03c0/2', '\u03c0', '3\u03c0/2', '2\u03c0'])\n    ax.set_xlabel('x')\n    ax.set_ylabel('y')\n    ax.grid(True, linestyle=':', alpha=0.5)\n    ax.set_title('y = sin(x)')`,
    triangle: `def draw(fig, ax):\n    import numpy as np\n    import matplotlib.patches as patches\n    A = [0, 0]\n    B = [6, 0]\n    C = [2, 4]\n    triangle = patches.Polygon([A, B, C], fill=False, edgecolor='blue', linewidth=1.5)\n    ax.add_patch(triangle)\n    ax.text(-0.3, -0.3, 'A', fontsize=12, ha='center')\n    ax.text(6.3, -0.3, 'B', fontsize=12, ha='center')\n    ax.text(2, 4.3, 'C', fontsize=12, ha='center')\n    ax.set_xlim(-1, 8)\n    ax.set_ylim(-1, 6)\n    ax.set_aspect('equal')\n    ax.grid(True, linestyle=':', alpha=0.3)\n    ax.set_title('Triangle ABC')`
  },
  tikz: {
    linear: `\\begin{tikzpicture}\n  \\begin{axis}[axis lines=middle, xmin=-5, xmax=5, ymin=-5, ymax=12, xlabel={$x$}, ylabel={$y$}, grid=both, title={$y = 2x + 1$}]\n    \\addplot[domain=-5:5, samples=100, blue, thick] {2*x + 1};\n  \\end{axis}\n\\end{tikzpicture}`,
    quadratic: `\\begin{tikzpicture}\n  \\begin{axis}[axis lines=middle, xmin=-4, xmax=5, ymin=-5, ymax=10, xlabel={$x$}, ylabel={$y$}, grid=both, title={$y = x^2 - 2x - 3$}]\n    \\addplot[domain=-3:5, samples=100, blue, thick] {x^2 - 2*x - 3};\n    \\addplot[only marks, mark=*, red] coordinates {(-1,0) (3,0)};\n    \\addplot[only marks, mark=square*, green] coordinates {(1,-4)};\n  \\end{axis}\n\\end{tikzpicture}`,
    circle: `\\begin{tikzpicture}\n  \\begin{axis}[axis lines=middle, xmin=-4, xmax=6, ymin=-3, ymax=7, xlabel={$x$}, ylabel={$y$}, grid=both, axis equal, title={$(x-1)^2 + (y-2)^2 = 9$}]\n    \\addplot[domain=0:360, samples=200, blue, thick] ({3*cos(x)+1}, {3*sin(x)+2});\n    \\addplot[only marks, mark=+, red, mark size=4] coordinates {(1,2)};\n  \\end{axis}\n\\end{tikzpicture}`,
    trig: `\\begin{tikzpicture}\n  \\begin{axis}[axis lines=middle, xmin=0, xmax=6.5, ymin=-1.5, ymax=1.5, xlabel={$x$}, ylabel={$y$}, grid=both, xtick={0, 1.5708, 3.1416, 4.7124, 6.2832}, xticklabels={$0$, $\\frac{\\pi}{2}$, $\\pi$, $\\frac{3\\pi}{2}$, $2\\pi$}, title={$y = \\sin(x)$}]\n    \\addplot[domain=0:6.2832, samples=200, blue, thick] {sin(deg(x))};\n  \\end{axis}\n\\end{tikzpicture}`,
    triangle: `\\begin{tikzpicture}\n  \\coordinate (A) at (0,0);\n  \\coordinate (B) at (6,0);\n  \\coordinate (C) at (2,4);\n  \\draw[blue, thick] (A) -- (B) -- (C) -- cycle;\n  \\node[below left] at (A) {$A$};\n  \\node[below right] at (B) {$B$};\n  \\node[above] at (C) {$C$};\n\\end{tikzpicture}`
  }
};

// Get current mode
function getMode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

// Template buttons
document.querySelectorAll('.btn-template').forEach(btn => {
  btn.addEventListener('click', () => {
    const templateName = btn.dataset.template;
    const mode = getMode();
    if (templates[mode] && templates[mode][templateName]) {
      codeEditor.value = templates[mode][templateName];
    }
  });
});

// Render button
btnRender.addEventListener('click', async () => {
  const code = codeEditor.value.trim();
  if (!code) {
    showError('Please enter code first.');
    return;
  }

  btnRender.disabled = true;
  btnRender.textContent = 'Generating...';
  hideError();

  try {
    const result = await window.api.renderFigure(getMode(), code);
    if (result.success) {
      showImage(result.image);
    } else {
      showError(result.error || 'Unknown error occurred.');
    }
  } catch (err) {
    showError('Failed to connect to Python backend: ' + err.message);
  } finally {
    btnRender.disabled = false;
    btnRender.textContent = 'Generate Figure';
  }
});

// Clear button
btnClear.addEventListener('click', () => {
  codeEditor.value = '';
  hideImage();
  hideError();
});

// Save button
btnSave.addEventListener('click', async () => {
  if (currentImageData) {
    const result = await window.api.saveFigure(currentImageData, 'math_figure.png');
    if (result.success) {
      alert('Image saved to: ' + result.path);
    }
  }
});

// Zoom controls
btnZoomIn.addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 0.25, 3);
  previewImage.style.transform = `scale(${currentZoom})`;
});

btnZoomOut.addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 0.25, 0.25);
  previewImage.style.transform = `scale(${currentZoom})`;
});

// Helper functions
function showImage(base64) {
  currentImageData = 'data:image/png;base64,' + base64;
  previewImage.src = currentImageData;
  previewImage.style.display = 'block';
  previewPlaceholder.style.display = 'none';
  btnSave.disabled = false;
  currentZoom = 1;
  previewImage.style.transform = 'scale(1)';
}

function hideImage() {
  previewImage.style.display = 'none';
  previewPlaceholder.style.display = 'block';
  btnSave.disabled = true;
  currentImageData = null;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}

function hideError() {
  errorMessage.style.display = 'none';
}

// Check Python backend status
async function checkPythonStatus() {
  try {
    const status = await window.api.getPythonStatus();
    if (status.running) {
      pythonStatusDot.className = 'status-dot online';
      statusText.textContent = 'Python Backend: Online';
    } else {
      pythonStatusDot.className = 'status-dot offline';
      statusText.textContent = 'Python Backend: Offline';
    }
  } catch {
    pythonStatusDot.className = 'status-dot offline';
    statusText.textContent = 'Python Backend: Offline';
  }
}

// Poll status every 5 seconds
setInterval(checkPythonStatus, 5000);
checkPythonStatus();
