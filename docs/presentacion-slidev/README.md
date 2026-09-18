# Presentación GRAFITO · Slidev

Presentación de la **Plataforma de Administración de Inmuebles, Portales y Contabilidad (Panamá)** generada con [Slidev](https://sli.dev) a partir de:

- `docs/diseno-arquitectura.md` (arquitectura y alcance)
- `docs/ui/diseno-ui-design-system.md` (design system GRAFITO)
- `docs/ui/requerimientos-modulos.md` (requerimientos por módulo)
- `docs/ui/prototipo-validacion.html` (prototipo; capturas en `public/screenshots/`)

## Requisitos

- Node.js ≥ 20.12 (probado con v20.19.6)
- npm (o pnpm / yarn)

## Instalación

```bash
npm install
```

## Uso

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Abre la presentación en el navegador con recarga en caliente |
| `npm run dev:no-open` | Servidor de desarrollo sin abrir el navegador |
| `npm run build` | Genera la versión estática en `dist/` (desplegable) |
| `npm run export` | Exporta a PDF (requiere Chromium/Playwright: `npx playwright install`) |

Navegación dentro de la presentación: flechas para avanzar/retroceder, `f` pantalla completa, `?` atajos, `o` vista general, `Esc` para salir. Las **notas del presentador** (modo `Presenter: Alt/⌥ + P`) están en cada diapositiva.

## Estructura

```
presentacion-slidev/
├── slides.md            # Deck completo (20 diapositivas)
├── style.css            # Tema GRAFITO (tokens del design system)
├── public/screenshots/  # Capturas del prototipo (12 PNG)
├── package.json
└── dist/                # Salida de npm run build
```

## Estilo

El tema aplica los tokens de **GRAFITO** (design system v1.7): neutro grafito `#1B212B`, scaffold `#141A22`, canvas `#F6F7F9`, semánticos `#146C43` / `#7A4F00` / `#B42318` / `#1D4ED8`, tipografía Inter + IBM Plex Mono.