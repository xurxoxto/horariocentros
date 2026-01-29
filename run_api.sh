#!/bin/bash

# Script para ejecutar el servidor API

echo "🚀 Iniciando servidor API..."
echo "📍 Base URL: http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

cd "$(dirname "$0")"

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Ejecutar servidor
python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
