import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np


def render_matplotlib(code):
    """
    Execute user-provided draw(fig, ax) code and return PNG bytes.
    The code must define a function: def draw(fig, ax): ...
    """
    fig, ax = plt.subplots(figsize=(6, 6), dpi=150)

    # Create a safe namespace with common imports
    namespace = {
        'fig': fig,
        'ax': ax,
        'np': np,
        'plt': plt,
        'matplotlib': matplotlib,
    }

    try:
        # Execute the user code to define the draw function
        exec(code, namespace)

        # Call draw(fig, ax) if it exists
        if 'draw' in namespace and callable(namespace['draw']):
            namespace['draw'](fig, ax)

        # Apply DSE-style formatting
        ax.grid(True, linestyle=':', linewidth=0.5, alpha=0.5)
        for spine in ax.spines.values():
            spine.set_linewidth(0.8)

        plt.tight_layout()

        # Save to bytes
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        buf.seek(0)
        return buf.getvalue()

    finally:
        plt.close(fig)
