# 🎓 HorarioCentros - Gestor de Horarios Escolares

![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)

**Aplicación moderna y gratuita para crear y gestionar horarios escolares.**  
Una alternativa superior a FET con mejor experiencia de usuario, interfaz intuitiva y **mismo sistema completo de restricciones**.

## 🚀 Instalación con 1 Click (Recomendado)

### Descargar Instalador

**Windows:**
- Descarga: `HorarioCentros-Setup-1.0.0.exe` (instalador)
- O: `HorarioCentros-1.0.0-portable.exe` (portátil, sin instalación)
- Doble click → Siguiente → Listo

**Mac:**
- Descarga: `HorarioCentros-1.0.0.dmg`
- Arrastra a Aplicaciones → Doble click

**Linux:**
- Descarga: `HorarioCentros-1.0.0.AppImage`
- `chmod +x HorarioCentros-1.0.0.AppImage`
- `./HorarioCentros-1.0.0.AppImage`

### Compilar Instaladores (Desarrolladores)

```bash
# Instalar dependencias
npm install

# Compilar para tu sistema operativo
npm run electron:build

# O para todos los sistemas:
npm run package
```

Los instaladores se generan en la carpeta `dist-electron/`

## 📥 Instalación Manual (Desarrollo)

Si prefieres ejecutar desde código fuente:

### Requisitos Previos

- **Node.js 18 o superior** ([Descargar aquí](https://nodejs.org/))
- **npm** (incluido con Node.js)

### Instalación Rápida (Windows, Mac, Linux)

**1. Descargar o clonar el proyecto:**

```bash
git clone https://github.com/xurxoxto/horariocentros.git
cd horariocentros
```

**2. Ejecutar script de instalación automática:**

**En Windows:**
```bash
setup.bat
```

**En Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**3. Iniciar la aplicación:**

```bash
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000

## 🚀 Uso Diario

### Iniciar el sistema

```bash
npm run dev
```

### Acceder desde otros ordenadores de la red local

1. Encuentra la IP de tu ordenador:
   - **Windows**: `ipconfig` → busca "IPv4"
   - **Mac/Linux**: `ifconfig` → busca "inet"

2. Otros ordenadores acceden con: `http://[IP]:5173`  
   Ejemplo: `http://192.168.1.100:5173`

### Detener el sistema

Presiona `Ctrl+C` en la terminal donde ejecutaste `npm run dev`

## ✨ Características Principales

- ✅ **Instalación con 1 click**: Ejecutable standalone como FET
- ✅ **Sin login**: Todo el personal del centro accede directamente
- ✅ **100% offline**: Funciona sin internet, datos locales
- ✅ **Sistema completo de restricciones FET**: Todas las restricciones de tiempo, profesores, estudiantes, aulas, actividades
- ✅ **Arrastrar y soltar**: Interfaz intuitiva para crear horarios
- ✅ **Generación automática**: Motor de optimización con algoritmos genéticos
- ✅ **Modo oscuro**: Tema claro/oscuro automático
- ✅ **Responsive**: Funciona en móvil, tablet y PC
- ✅ **Detección de conflictos**: Avisos automáticos de solapamientos
- ✅ **Exportar PDF/iCal**: Descarga e imprime horarios
- ✅ **Multiplataforma**: Windows, macOS, Linux

## 🎯 Sistema de Restricciones (Compatible FET)

HorarioCentros incluye el **mismo sistema completo de restricciones** que FET:

### Restricciones de Tiempo
- ✅ Horario básico (días/horas por semana)
- ✅ Franjas horarias no disponibles
- ✅ Horarios preferidos de inicio
- ✅ Descansos/recreos obligatorios

### Restricciones de Profesores
- ✅ Máximo de horas diarias
- ✅ Máximo de horas consecutivas
- ✅ Mínimo de horas diarias
- ✅ Máximo de huecos por día/semana
- ✅ Máximo de días trabajados por semana
- ✅ Franjas no disponibles
- ✅ Máximo de cambios de edificio

### Restricciones de Estudiantes/Grupos
- ✅ Máximo de horas diarias
- ✅ Máximo de horas consecutivas
- ✅ Mínimo de horas diarias
- ✅ Máximo de huecos por día/semana
- ✅ Hora máxima de inicio (no empezar antes de X)
- ✅ Tardes libres
- ✅ Máximo de cambios de edificio

### Restricciones de Actividades
- ✅ Horarios preferidos de inicio
- ✅ Días preferidos
- ✅ Actividades en el mismo horario
- ✅ Actividades consecutivas
- ✅ Actividades no solapadas
- ✅ Días mínimos/máximos entre actividades
- ✅ Actividades agrupadas

### Restricciones de Aulas
- ✅ Aulas no disponibles
- ✅ Aula preferida por actividad
- ✅ Lista de aulas preferidas

### Pesos de Restricciones
Cada restricción tiene un peso (0-100%):
- **Obligatoria** (100%): Debe cumplirse siempre
- **Importante** (80-95%): Muy deseable
- **Preferida** (50-79%): Deseable
- **Opcional** (<50%): Si es posible

## 📁 Estructura del Proyecto

```
horariocentros/
├── client/          # Interfaz web (React + TypeScript)
├── server/          # API backend (Node.js + Express)
├── setup.bat        # Instalador automático Windows
├── setup.sh         # Instalador automático Mac/Linux
└── package.json     # Configuración del proyecto
```

## 🔧 Comandos Útiles

```bash
# Desarrollo (con recarga automática)
npm run dev

# Construir versión de producción
npm run build

# Iniciar versión de producción
npm start

# Ejecutar tests
npm test
```

## 💾 Datos y Backup

Los datos se almacenan localmente en:
- **Base de datos**: `server/dev.db` (SQLite)
- **Configuración**: archivos `.env`

**Para hacer backup:**
1. Copia la carpeta completa `horariocentros/`
2. O solo `server/dev.db` si quieres guardar los horarios

## 🛠️ Solución de Problemas

### El puerto 5173 o 3000 ya está en uso

Cierra otras aplicaciones que los usen o cambia los puertos en los archivos `.env`:

```env
# server/.env
PORT=3001

# client/.env
VITE_API_URL=http://localhost:3001/api
```

### Error "Node.js no encontrado"

Instala Node.js desde: https://nodejs.org/

### Error al instalar dependencias

```bash
# Limpia e reinstala
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm install
```

## 📖 Documentación Adicional

- [QUICKSTART.md](QUICKSTART.md) - Guía rápida de 5 minutos
- [GETTING_STARTED.md](GETTING_STARTED.md) - Tutorial completo
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Soluciones a problemas comunes

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) para empezar.

## 📄 Licencia

Este proyecto tiene doble licencia:

- **AGPLv3**: Uso gratuito para centros educativos y proyectos open source
- **Licencia Comercial**: Para uso comercial sin restricciones AGPL

Ver [LICENSE](LICENSE) para más detalles.

## 💬 Soporte

- **Issues**: [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues)
- **Documentación**: Carpeta `docs/`

---

**Hecho con ❤️ para la comunidad educativa**

Contact xurxoxto@github.com for commercial licensing options.

## 🌟 Why HorarioCentros vs FET?

| Feature | HorarioCentros | FET |
|---------|---------------|-----|
| User Interface | Modern drag-and-drop web UI | Desktop Qt interface |
| Mobile Support | ✅ Full responsive design | ❌ Desktop only |
| Real-time Collaboration | ✅ Multiple users simultaneously | ❌ Single user |
| Dark Mode | ✅ Built-in theme switching | ⚠️ Limited |
| AI Suggestions | ✅ Smart scheduling recommendations | ❌ Manual only |
| Calendar Integration | ✅ Google, iCal, Outlook | ⚠️ Limited export |
| Cloud Deployment | ✅ Easy cloud hosting | ❌ Desktop only |
| Modern Tech Stack | ✅ React, Node.js, TypeScript | ⚠️ C++, Qt |

## 🗺️ Roadmap

- [x] Core timetable CRUD operations
- [x] Drag-and-drop interface
- [x] Real-time collaboration
- [x] Role-based dashboards
- [x] Dark mode support
- [x] Mobile-responsive design
- [x] PDF export
- [x] Calendar integrations
- [ ] AI scheduling optimization (Phase 2)
- [ ] Advanced constraint solver (Phase 2)
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support
- [ ] Analytics dashboard

## 💬 Support

- 📧 Email: xurxoxto@github.com
- 🐛 Issues: [GitHub Issues](https://github.com/xurxoxto/horariocentros/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/xurxoxto/horariocentros/discussions)

## 🙏 Acknowledgments

- FET (Free Timetabling Software) for inspiration
- Xade constraint system concepts
- Open-source community

---

Made with ❤️ by xurxoxto

