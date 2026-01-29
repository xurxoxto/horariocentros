#!/bin/bash
set -e

echo "🚀 Desplegando HorarioCentros en Firebase + Cloud Run"
echo "=================================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="${FIREBASE_PROJECT_ID:-horariocentros}"
REGION="europe-west1"
SERVICE_NAME="horariocentros-api"

# Verificar que estamos autenticados
echo -e "${YELLOW}📋 Verificando autenticación...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null 2>&1; then
    echo -e "${RED}❌ No estás autenticado en gcloud. Ejecuta: gcloud auth login${NC}"
    exit 1
fi

# 1. Construir Frontend
echo -e "${YELLOW}📦 Construyendo frontend...${NC}"
cd frontend
npm install
npm run build
cd ..

# 2. Desplegar Backend a Cloud Run
echo -e "${YELLOW}🐳 Desplegando backend a Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --project $PROJECT_ID \
    --set-env-vars="ENVIRONMENT=production"

# Obtener URL del servicio
API_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
echo -e "${GREEN}✅ Backend desplegado en: $API_URL${NC}"

# 3. Desplegar Frontend a Firebase Hosting
echo -e "${YELLOW}🔥 Desplegando frontend a Firebase Hosting...${NC}"
firebase deploy --only hosting --project $PROJECT_ID

echo ""
echo -e "${GREEN}=================================================="
echo "✅ ¡Despliegue completado!"
echo "=================================================="
echo ""
echo "Frontend: https://$PROJECT_ID.web.app"
echo "API: $API_URL"
echo -e "${NC}"
