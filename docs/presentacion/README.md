# Presentación GRAFITO — Plataforma de Administración de Inmuebles, Portales y Contabilidad

Presentación formal ejecutable en **Reveal.js** del proyecto documentado en `docs/`.
Usa la identidad visual del sistema (design system **GRAFITO**, tokens propios) y capturas
del prototipo (`ui/prototipo-demo.html`) generadas en `docs/presentacion/assets/screenshots/`.

## Cómo ejecutar

Abrir `index.html` directamente en un navegador moderno (Chrome, Edge, Firefox).

```
docs/presentacion/index.html
```

Funciona con `file://` sin servidor (Reveal.js y las capturas están en locales
`assets/vendor/` y `assets/screenshots/`). No requiere CDN ni npm.

## Navegación

- **Flechas** ← → navegar diapositivas.
- `F` pantalla completa · `O` vista general · `B` pausa · `ESC` vista general/cerrar.
- `S` ventana de notas del presentador (hay notas en las diapositivas de módulos, plan y prioridades).
- `Shift + P` o `Alt + P` imprimir a PDF (navegador: guardar como PDF).

## Estructura de la presentación

1. Portada · 2. Agenda · 3. Contexto y problema · 4. Solución (3 áreas)
5. Mapa de módulos · 6. Núcleo del negocio (F1) · 7. Operación (F2) · 8. Contabilidad (F3)
9. Portal y seguridad · 10–11. Experiencia de usuario (capturas) · 12. Arquitectura
13. Seguridad y cumplimiento · 14. Alcance · 15. Plan por fases · 16. Prioridades por módulo
17. **Migración de datos desde SharePoint** · 18. Decisiones y pendientes · 19. Cierre

## Estructura de archivos

```
docs/presentacion/
├── index.html                 # diapositivas
├── css/presentation.css       # tema con tokens GRAFITO
├── js/presentation.js         # configuración de Reveal.js
├── assets/
│   ├── vendor/reveal-js/      # Reveal.js 4.6.1 local (sin CDN)
│   └── screenshots/           # capturas del prototipo v3
└── data/project-analysis.md   # análisis documental y trazabilidad
```

## Supuestos y notas

- Todas las cifras y alcance provienen de la documentación de `docs/` (no se inventaron).
- El plan por fases y prioridades se basa en `docs/planificacion/analisis-comercial-financiero.md`
  (Fases 0–3, 6,943 h PERT, 9–11 meses escenario recomendado).
- La migración de la data de **SharePoint** se incluye como **posible pero con revisión/analisis
  por separado** (sin vía más automatizada contemplada), tal como se indicó en la solicitud.
- Cifras comerciales (precio, modelo de contratación, plan de cobro) quedan fuera por decisión
  de diseño; están disponibles en `docs/planificacion/analisis-comercial-financiero.md` si se requieren.
- Pendientes bloqueantes a validar antes de una versión final para cliente: CPA, asesor legal,
  ciudad/proveedores y decisiones D1–D12 (ver `data/project-analysis.md`).