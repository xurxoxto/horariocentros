#!/bin/bash

# ============================================================================
# Script de compilación completa del proyecto
# Ejecutar una vez para construir todo, luego usar start.command para abrir
# ============================================================================

cd "$(dirname "$0")"

echo "============================================"
echo "  🏫 Horario Centros - Build"
echo "============================================"
echo ""

# 1. Entorno virtual de Python
echo "📦 [1/3] Configurando entorno Python..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "   ✅ Dependencias Python instaladas"

# 2. Frontend
echo "📦 [2/3] Construyendo frontend..."
if ! command -v npm &> /dev/null; then
    echo "   ❌ npm no encontrado. Instala Node.js: https://nodejs.org/"
    exit 1
fi
cd frontend
npm install --silent
npm run build
cd ..
echo "   ✅ Frontend construido"

# 3. Verificar
echo "🔍 [3/3] Verificando..."
if [ -f "frontend/dist/index.html" ]; then
    echo "   ✅ frontend/dist/index.html encontrado"
else
    echo "   ❌ Error: frontend/dist/index.html no existe"
    exit 1
fi

echo ""
echo "============================================"
echo "  ✅ ¡Build completado!"
echo ""
echo "  Para abrir la aplicación:"
echo "    → Doble clic en start.command"
echo "    → O ejecuta: ./start.command"
echo "============================================"
