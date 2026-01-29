"""
Archivo de configuración para el proyecto.
Facilita la importación correcta de módulos.
"""
import sys
from pathlib import Path

# Añadir el directorio raíz al PYTHONPATH
root_dir = Path(__file__).parent
sys.path.insert(0, str(root_dir))
