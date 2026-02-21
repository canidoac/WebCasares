# Estructura de Carpetas en Vercel Blob Storage

## Estructura Organizada

\`\`\`
club-carlos-casares/
├── users/
│   └── profiles/           # Fotos de perfil de usuarios
├── news/                   # Imágenes de noticias
├── disciplines/
│   ├── icons/             # Iconos de disciplinas
│   └── gallery/           # Galería de imágenes de disciplinas
├── board/                 # Fotos de comisión directiva
├── club/
│   ├── gallery/           # Galería general del club
│   └── history/           # Imágenes de historia del club
├── store/
│   └── products/          # Imágenes de productos de tienda
├── sponsors/              # Logos de patrocinadores
├── site/
│   ├── popups/           # Imágenes de pop-ups
│   ├── maintenance/      # Imágenes de mantenimiento
│   └── videos/           # Videos del sitio
└── uploads/              # Uploads temporales o sin categoría
\`\`\`

## Migración desde estructura antigua

### Carpetas antiguas → Nuevas
- `CCC_STORAGEConfig_Site/News/` → `club-carlos-casares/news/`
- `CCC_STORAGEConfig_Site/Products/` → `club-carlos-casares/store/products/`
- `CCC_STORAGEConfig_Site/Sponsor/` → `club-carlos-casares/sponsors/`
- `Config_Site/Popup/` → `club-carlos-casares/site/popups/`
- `CCC_STORAGE/Config_Site/Status_Site/` → `club-carlos-casares/site/maintenance/`
- `Profile/` → `club-carlos-casares/users/profiles/`

## Límites de tamaño por carpeta

- `users/profiles/`: 5MB
- `news/`: 10MB
- `disciplines/`: 5MB
- `store/products/`: 5MB
- `sponsors/`: 2MB
- `site/maintenance/`: 30MB (permite videos)
- `site/videos/`: 50MB
- Otros: 5MB por defecto
