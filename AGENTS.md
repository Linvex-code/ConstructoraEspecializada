# AGENTS.md

## Estado del repo

Proyecto en **fase de diseño y documentación**: no hay código de aplicación, solo docs, prototipos HTML autocontenidos y presentaciones. El stack objetivo (Blazor/ASP.NET Core 10, PostgreSQL 17, YARP, Redis, Quartz.NET) NO está implementado; no buscar ni ejecutar código .NET.

Todo el contenido (docs, prototipos, presentaciones) es **en español**.

## Fuentes de verdad

- `docs/diseno-arquitectura.md` — arquitectura v1.3, C4, ADRs. Cruce con `docs/adr-aislamiento-modulos-killswitch.md` y `docs/modulo-contabilidad.md`.
- `docs/modulos/` — 11 documentos oficiales por módulo; registro maestro y versionado en `docs/modulos/README.md`.
- `docs/ui/` — design system **GRAFITO** (`diseno-ui-design-system.md`), tokens (`tokens.dtcg.json`, `tokens.css`) y `requerimientos-modulos.md` (v0.1, borrador/negativo de `docs/modulos/`).
- `ui/prototipo-demo.html` — prototipo interactivo (HTML autocontenido, datos simulados).

## Regla crítica: solo se publica `site/`

`site/` es el ÚNICO directorio desplegado — `netlify.toml` (`publish = "site"`) y `vercel.json` (`outputDirectory: "site"`), ambos estáticos sin build. **No hay paso de build entre las fuentes y `site/`: las copias se hacen a mano y se commitean.**

- Tras editar `ui/prototipo-demo.html`, copiarlo a `site/prototipo-demo.html`.
- Tras editar `docs/ui/prototipo-validacion.html`, copiarlo a `site/prototipo-validacion.html`.
- `site/index.html` es la landing y se edita directamente ahí (sin fuente duplicada).

## Presentación Slidev

`docs/presentacion-slidev/` — Node ≥ 20.12 (probado con v20.19.6). Deck en `slides.md`, tema GRAFITO en `style.css`.

```
npm install
npm run dev            # servidor con recarga en caliente
npm run build          # genera dist/ (git-ignored)
npm run export         # PDF; requiere: npx playwright install
npm run screenshot     # exporta PNG a slides-export/
```

- `dist/` está en `.gitignore`: tras `npm run build`, **copiar su contenido a `site/presentacion-slidev/` y commitear**. Incluir `404.html` y `_redirects` (el build los genera; la copia actual en `site/` no los tiene y Netlify los necesita).
- La presentación Reveal.js (`docs/presentacion/`) es autocontenida (abrir `index.html` con `file://`, sin npm) y NO se despliega.

## Convenciones

- Módulos versionados de forma independiente (SemVer): al editar un documento de `docs/modulos/`, incrementar su versión en la tabla **Control de versiones** al final del archivo y en `docs/modulos/README.md`.
- Commits conventional con prefijo del módulo, p. ej. `docs(contratos): ...`.
- Permisos RBAC con convención `modulo.accion`; el catálogo oficial vive en `docs/modulos/README.md` §4. Permisos nuevos aún no en el prototipo se marcan `[P]`.
- Dinero: montos como enteros en centavos; comprobantes y asientos inmutables y auditables.
- La validación legal/fiscal panameña (DGI, ITBMS/ISR/retenciones; decisiones D1–D12) sigue pendiente — no inventar reglas de negocio sin marcarlas como supuestos.