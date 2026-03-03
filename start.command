#!/bin/bash

# ============================================================================
# Horario Centros - Lanzador de Aplicación
# Doble clic en este archivo para abrir la aplicación
# ============================================================================

# Ir al directorio del proyecto
cd "$(dirname "$0")"

echo "============================================"
echo "  🏫 Horario Centros"
echo "  Sistema de Generación de Horarios"
echo "============================================"
echo ""

# Verificar que el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "⚠️  No se encontró el entorno virtual."
    echo "   Ejecutando instalación..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Verificar que el frontend está construido
if [ ! -d "frontend/dist" ]; then
    echo "⚠️  Frontend no construido. Construyendo..."
    if command -v npm &> /dev/null; then
        cd frontend && npm install && npm run build && cd ..
    else
        echo "❌ npm no encontrado. Instala Node.js para construir el frontend."
        echo "   https://nodejs.org/"
        echo ""
        echo "Presiona Enter para salir..."
        read
        exit 1
    fi
fi

echo "🚀 Iniciando servidor..."
echo "📍 La aplicación se abrirá en: http://localhost:8000"
echo ""
echo "⏳ Espera unos segundos..."
echo ""

# Abrir el navegador después de un breve retraso
(sleep 2 && open "http://localhost:8000") &

# Iniciar el servidor
python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000

echo ""
echo "Servidor detenido. Presiona Enter para cerrar."
read
