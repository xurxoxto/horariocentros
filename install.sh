#!/bin/bash

# Script de instalación y configuración rápida
# Para sistemas Unix/Linux/macOS

echo "🚀 Iniciando configuración del proyecto..."

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

echo "✅ Python 3 encontrado: $(python3 --version)"

# Crear entorno virtual
echo "📦 Creando entorno virtual..."
python3 -m venv venv

# Activar entorno virtual
echo "🔌 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "⬆️  Actualizando pip..."
pip install --upgrade pip --quiet

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install -r requirements.txt --quiet

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "Para probar el sistema:"
echo "  1. Activa el entorno virtual: source venv/bin/activate"
echo "  2. Ejecuta el ejemplo: python examples/simple_example.py"
echo ""
echo "Para más información, consulta README.md o ARCHITECTURE.md"
