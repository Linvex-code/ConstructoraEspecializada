# GRAFITO — Sistema de diseño v1.6

> Documento de referencia de componentes para la Plataforma de Administración de Inmuebles, Portales y Contabilidad (Constructora Especializada · Panamá).
> Define **un solo sistema de estilo**: cada componente tiene una única implementación canónica y cada componente mantiene una separación explícita y consistente respecto a los elementos que lo rodean.

| Campo | Valor |
| --- | --- |
| Versión | 1.5 |
| Estado | En uso · referencia del prototipo `ui/prototipo-demo.html` |
| Fuentes de verdad | `docs/ui/tokens.css` (tokens) · `docs/ui/diseno-ui-design-system.md` (este documento) · `ui/prototipo-demo.html` (referencia visual interactiva) |
| Alcance | Admin (panel), Portales (inquilino / propietario), Autenticación, Módulo RH |
| Idioma de UI | Español profesional (Panamá) |

---

## 1. Principios

1. **Una implementación por componente (P3).** El mismo componente se ve idéntico en todo el sistema; solo cambia la data. Está prohibido rediseñar una tabla, una tarjeta o un chip por módulo.
2. **Fidelidad a tokens.** Todo color, tipo, espaciado, radio y sombra sale de `docs/ui/tokens.css`. No se improvisan valores.
3. **Separación entre elementos.** Todo componente mantiene un `gap` de 16px o más con los elementos adyacentes dentro de una grilla, y 16px de margen respecto a la sección anterior cuando se apilan. Dos tarjetas nunca quedan pegadas ni tocándose.
4. **Una acción primaria por pantalla.** Las secundarias son visibles pero subordinadas; las destructivas siempre confirman en diálogo.
5. **Sobriedad corporativa.** Fondo claro, una marca oscura (no colores llamativos), acentos semánticos solo para estado (éxito, aviso, riesgo, información).
6. **El backend es la autoridad real.** El frontend controla la experiencia; la seguridad se valida en servidor (BFF).

---

## 2. Tokens

Fuente de verdad: `docs/ui/tokens.css`. El prototipo incrusta una copia idéntica para seguir siendo autocontenido.

### 2.1 Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--n0` … `--n950` | `#FFFFFF` … `#10151D` | Escala neutra: superficies, texto y bordes |
| `--brand` / `--brand-h` / `--brand-a` | `#1B212B` / `#2A313D` / `#10151D` | Acciones primarias, texto principal, navegación activa |
| `--bg-canvas` / `--bg-content` / `--bg-subtle` | `#F6F7F9` / `#FFFFFF` / `#F1F3F6` | Fondo de página / superficie de tarjeta / fondo de zona pasiva |
| `--bg-hover` / `--bg-disabled` | `#EDF0F4` / `#F1F3F6` | Hover de filas y controles / estado deshabilitado |
| `--text-p` / `--text-s` / `--text-t` / `--text-d` | `#1B212B` / `#5B6470` / `#697486` / `#9AA3AD` | Primario / secundario / terciario / deshabilitado |
| `--text-inv` | `#FFFFFF` | Texto sobre `--brand` y colores sólidos |
| `--text-link` | `#1D4ED8` | Enlaces |
| `--border-subtle` / `--border-default` / `--border-strong` | `#E3E6EB` / `#CFD4DC` / `#A6AEBB` | Bordes de superficie / controles / separadores fuertes |
| `--scaffold-*` | oscuros | Sidebar, marca, navegación oscura |
| `--succ` / `--warn` / `--danger` / `--info` / `--neutral` (+ `-bg`, `-bd`) | — | Estados: éxito, aviso, riesgo, información, neutro |

Cada estado semántico usa el trío `color – fondo – borde`: `chip-success` = `--succ` + `--succ-bg` + `--succ-bd`, y así sucesivamente.

### 2.2 Tipografía

| Token | Fuente | Uso |
| --- | --- | --- |
| `--font-ui` | Inter (400/500/600/700) | Todo texto de interfaz |
| `--font-mono` | IBM Plex Mono (400/500/600) | Folios (`REC-2026-0147`), cédulas, montos con cifras tabulares, fechas, hashes |

Escala tipográfica: **11px** (labels de navegación, mono pequeño) · **12px** (labels de campo, captions de tabla, meta) · **13px** (cuerpo de tablas y subtítulos) · **14px** (cuerpo base) · **15–16px** (títulos de tarjeta y de modal) · **20–24px** (títulos de página y valores KPI; en mosaico `clamp(19px,1.9vw,28px)`) · **30px** (cantidad destacada del hero de portal).

### 2.3 Espaciado (escala 2/4/8/12/16/20/24/32/40/48)

`--sp-1:2px` · `--sp-2:4px` · `--sp-3:8px` · `--sp-4:12px` · `--sp-5:16px` · `--sp-6:20px` · `--sp-7:24px` · `--sp-8:32px` · `--sp-9:40px` · `--sp-10:48px`

### 2.4 Radios, sombras, movimiento, layout

- Radios: `sm 4px` (paginación, commits) · `md 6px` (botones, inputs, ítems de nav) · `lg 8px` (tarjetas, tablas, alertas) · `xl 12px` (modales, héroes) · `pill 999px` (chips, selectores).
- Sombras: `sm` (tarjetas) · `md` (hover de tarjetas y controles flotantes) · `lg` (menús, toasts) · `xl` (modales, drawers, sidebar móvil).
- Movimiento: 100/150/200 ms; con `prefers-reduced-motion` la duración se anula.
- Layout: `--sidebar-w:256px`, `--topbar-h:56px`, fila de tabla 44px (normal) / 36px (densa).

---

## 3. Reglas de composición y separación (canon)

Estas reglas son obligatorias y materializan la pauta de que cada componente mantiene su separación.

### 3.1 Grillas responsivas

| Breakpoint | Columnas por defecto |
| --- | --- |
| ≥ 1280px | 4 |
| ≥ 960px | 3 |
| ≥ 600px | 2 |
| < 600px | 1 |

- `gap` obligatorio: **16px** (`--sp-5`) entre ítems de grilla en escritorio; 12px solo en grillas compactas documentadas (`.mini-grid-sm`, canales de pago).
- **Nunca** una tarjeta a ancho completo con una o dos piezas de información: se agrupa en grillas de 2+ columnas. Si la pantalla solo tiene 2 tarjetas, se renderizan en 2 columnas (~50%/50%) con su `gap`, no a ancho completo.
- Usar `repeat(auto-fit, minmax(0,1fr))` para KPIs y mosaicos. Prohibido `min-width` fijo que desborde horizontal.
- Los grids no acumulan márgenes entre tarjetas: `.grid > .card + .card { margin-top: 0 }` (el `gap` es la única separación entre ítems).

### 3.2 Apilamiento vertical de secciones

- Secciones consecutivas dentro de `.content` (`.card`, `.g2`, `.g3` sin grilla envolvente) se separan con `margin-top: 16px`.
- Detrás de `page-head` y de `toolbar` siempre hay `margin-bottom` de 16–24px según componente (ver fichas).
- Las listas dentro de tarjetas (`mini-row`, `sol-row`) se separan entre sí con `border-bottom: 1px` + `padding: 8px 0`; la última fila no lleva borde.

### 3.3 Prohibiciones

- Rediseñar la tabla por módulo (existe UNA tabla canónica).
- Estilos inline para layout o para valores que ya son token.
- Emojis como iconos funcionales (solo SVG de la familia Phosphor).
- Valores de color, tipo, radio o sombra fuera de los tokens.
- Componentes nuevos en paralelo sin pasar por este documento.

---

## 4. Datos y formato

| Dato | Formato |
| --- | --- |
| Moneda | `B/. 1,234.56` · cifras tabulares · alineación derecha en tablas · negativos con signo |
| Fechas en pantalla | `DD/MM/YYYY` (p. ej. `15/09/2026`) |
| Períodos | Mes completo en español: `Septiembre 2026` |
| Folios / referencias | Mono: `REC-2026-0147`, `CRE-2026-0147`, `ARR-2026-041`, `LIQ-2026-003`, `A-001`, `INC-2026-101`, `LB-001` |
| Identidades | Nombres y direcciones panameños plausibles; cédulas `8-123-456`, `PE-123456` |
| Estados de negocio | Etiquetas reales con semántica de chip establecida: `PAGADO`, `EN MORA`, `VIGENTE`, `BORRADOR`, `CERRADO` |

Mapa de estado a chip (único punto de verdad: `chipEstado()` del prototipo):

| Chip | Estados ejemplares |
| --- | --- |
| `chip-success` | Activo, Vigente, Disponible, Pagado, Aprobado, Instalado, Conciliado, Listo, Entregado |
| `chip-warning` | En mantenimiento, Pendiente, Reportada, En ejecución, Por aprobar, En cierre |
| `chip-danger` | Anulado, En mora, Vencido, Error |
| `chip-info` | Alquilado, Emitido, Asignada, Presupuesto, Abierto, Programada, Declarado, No leída |
| `chip-neutral` | Inactivo, Terminado, Cerrada, Borrador, Revertido, De baja, Leída |

---

## 5. Iconografía

- Familia Phosphor (trazo consistente): `viewBox 24`, `stroke-width 1.8`, `fill none`, `stroke currentColor`, terminaciones redondas.
- Tamaños canónicos: **16** (en botones e iconos de tabla) · **18** (nav) · **20** (topbar, acciones) · **24** (estados vacíos, métodos de pago).
- Helpers: `ic(name, size)` (decorativo, `aria-hidden`) y `icLabel(name, label)` (con `aria-label` para iconos con significado).
- Catálogo actual: `home, users, user, building, contract, wallet, scale, wrench, toolbox, calculator, bell, chart, chartline, settings, shield, search, plus, check, circlecheck, x, chevdown, chevleft, chevright, dots, download, upload, calendar, logout, key, eye, eyeoff, filter, arrowup, arrowdown, menu, alert, info, lock, clock, mail, phone, image, pencil, trash, refresh, megaphone, send, receipt, bank, globe, clipboard, list, cable, gift, gauge, whatsapp, file, flag, userplus, briefcase, edit, smartphone, play, grid, undo, arrowright`.
- Para añadir iconos: agregar al mapa `IC` con el mismo trazo. Nunca emojis ni iconos de otra familia.

---

## 6. Navegación y shell

### 6.1 App shell (Admin)

```text
+-------------+-------------------------------------------------+
|  Sidebar    |  Topbar (search global / iconos / user-chip)    |
|  (256px)    +-------------------------------------------------+
|  brand      |  content (max-width 1500px · padding 24px)      |
|  nav groups |  · page-head (título + descripción + acciones)   |
|  · item     |  · toolbar / filtros                             |
|  · item     |  · grillas / tabla canónica / paginación         |
+-------------+-------------------------------------------------+
```

- `.sidebar` fija a la izquierda con fondo `--scaffold-bg`; `.main` con `margin-left: 256px`.
- **< 960px**: la sidebar sale de pantalla (transform), aparece el botón hamburguesa en la topbar y un scrim `--scrim`; `.main` sin margen.
- Topbar sticky: búsqueda global (foco con tecla `/`), campana con punto de no leídas y `user-chip` con avatar + rol.
- `page-head`: título 24px/600, descripción 13px `--text-s`, acciones a la derecha (una primaria).

### 6.2 Navegación lateral

- Grupos colapsables (`nav-group-btn` con chevron y `aria-expanded`); ítems `nav-a` de 38px con icono 18px; activo con barra blanca izquierda y fondo `--scaffold-bg-act`.
- Ítem con `badge` de conteo cuando corresponde.

### 6.3 Portales (inquilino / propietario)

- **≥ 960px**: barra lateral clara propia del portal + `.content`.
- **< 960px**: barra de navegación inferior fija (`bottom-nav`, 64px, ítems ≥ 44px) y `.content` con `padding-bottom: 92px` para no tapar contenido.
- Hero de portal (`portal-hero`): fondo `--brand`, label 12px caps, monto 30px tabular, CTA blanco.

### 6.4 Breadcrumb y tabs

- `.breadcrumb`: 13px, texto secundario; enlaces al `--text-link`.
- `.tabs`: borde inferior 1px `--border-subtle`; tab activo con **borde inferior 3px `--brand`** y texto 600; scroll horizontal si desborda.

---

## 7. Catálogo de componentes

Formato por componente: especificación (tokens) → anatomía → separación interna/externa → estados y accesibilidad → responsive.

### 7.1 Botón `.btn`

| Variante | Uso |
| --- | --- |
| `btn-primary` | La acción principal de cada pantalla (fondo `--brand`, texto blanco) |
| `btn-secondary` | Acciones subordinadas (fondo blanco, borde `--border-default`) |
| `btn-ghost` | Acciones terciarias (transparente, texto `--text-s`) |
| `btn-danger` | Destructivas dentro de diálogos de confirmación |
| `btn-link` | Enlace disfrazado de texto |
| `btn-icon` | Acceso a acción sin etiqueta (44px de target táctil si es standalone) |

- Dimensiones: alto **36px** (SM 28px · LG 44px), padding `0 16px`, radio `--radius-md`, icono 16px con `gap: 8px`.
- `btn-block` para ancho completo (login, portales).
- **Separación**: entre botones de una toolbar o grupo de acciones `gap: 8px`; en el pie de modal/drawer `gap: 12px` con alineación derecha.
- Deshabilitado: `--bg-disabled` + `--text-d` + `cursor: not-allowed`.
- Foco: `:focus-visible` con `outline 2px var(--brand)`, offset 2px.

### 7.2 Zona de subida `.upload-zone`

Borde discontinuo 1.5px `--border-default`, radio `--radius-lg`, padding `12px 16px`, icono 20px; hover con borde `--brand`. Variante `-sm` (icono 16px). Separación respecto a `.field` adyacente: 16px.

### 7.3 Campos y formularios

| Clase | Detalle |
| --- | --- |
| `.field` | Contenedor; `margin-bottom: 16px` respecto al siguiente campo |
| `label` | 12px/500 `--text-p`, con `span.req` en `--danger` para obligatorios |
| `.input` | Alto 36px, borde `--border-default`, radio `--radius-md`, foco con ring `--focus-ring` |
| `.input.ro` | Solo lectura (fondo `--bg-subtle`, texto `--text-t`) |
| `.input-like` | Div que muestra un valor como campo de solo lectura (fichas RH) — misma apariencia que `.input.ro` |
| `.money-input` | Prefijo `B/.` con padding `0 12px 0 40px` |
| `.check` | Checkbox 16px con `accent-color: var(--brand)`, texto 14px, `gap: 12px` |
| `.form-grid` | 2 columnas ≥960px, 1 columna <960px, `gap: 20px` |
| `.form-actions` | Pie alineado a la derecha, `margin-top: 24px`, `gap: 12px` |
| `.err-summary` | Resumen de errores: `--danger-bg`, borde `--danger-bd`, lista de enlaces |

- Errores en línea: `.field .err` (12px, `--danger`, icono `alert` 16px) bajo el campo; el input lleva `aria-invalid="true"`.
- **Separación externa**: los formularios dentro de un modal usan el padding del `.modal-body` (24px); entre campos 16px; entre secciones de un formulario largo 24px.

### 7.4 Tarjetas

#### 7.4.1 `.card` (superficie)

- Fondo `--bg-content`, borde 1px `--border-subtle`, radio `--radius-lg`, sombra `sm`, padding 16px.
- `card-head`: título 16px/600 + subtítulo 13px `--text-s` a la izquierda; acción a la derecha (enlace `Ver todas` o botón). `margin-bottom: 16px`.
- `card-body`: continúa el contenido; `padding-top: 4px` junto a la separación del head.
- **Separación**: en grilla `gap: 16px`; en apilado vertical `margin-top: 16px`; entre filas de detalle internas `gap: 8–12px`.
- Variante interactiva `.card-hover` (sombra `md` en hover, cursor pointer) para tarjetas clickeables (módulos RH, incidencias del portal).
- `.st-sect`: modificador de bloque para `stat-label`/`card-title` que abre sección (equivale al padding vertical de tarjetas), `display: block; margin-bottom: 12px`.
- `.tbl-card`: card que contiene una tabla canónica; su `card-head` se pliega con `.tbl-card .card-head{padding:16px 16px 0;margin-bottom:0}` para que la tabla ocupe el ancho completo de la card.

#### 7.4.2 `.stat-card` (tarjeta KPI)

```html
<div class="card stat-card">
  <div class="stat-label">INGRESOS · SEPT</div>
  <div class="stat-value">B/. 3,425.00</div>
  <div class="stat-meta">Contexto o comparativo</div>
</div>
```

- `stat-label`: 12px caps/600 · `stat-value`: 30px/600 tabular (`clamp(19px,1.9vw,28px)` en mosaicos) · `stat-meta`: 13px `--text-s`.
- Variante `.stat-card-h` con `stat-ico` de 42px, radio 12px y tinte semántico `.succ/.danger/.warn/.brand` (color-mix 13–14%).
- **Separación**: solo dentro de `.kpis`/`.kpis-4` (`auto-fit` + `gap 16px`); nunca a ancho completo con 1–2 piezas: agrupar con tarjetas afines.
- `stat-value` usa `nowrap + ellipsis` para no romper cifras; en <600px puede fluir.
- Tamaños reducidos de `stat-value` cuando el valor viaja con texto contextual (tarjetas de detalle, listas):
  - `.stat-value.sm` = 18px · `.stat-value.md` = 22px · `.stat-value.lg` = 24px · `.total-val` = 16px tabular (totales dentro de listas).
- Color semántico del valor sin tocar el tinte del ícono: `.v-danger | .v-warn | .v-succ | .v-info | .v-brand` (usa los tokens semánticos de §2.1; el valor hereda el color por defecto si no se aplica variante).

#### 7.4.3 Fila de lista `.mini-row` / `.sol-row`

- `.mini-row` (dashboards): icono 32px radio 8px (`mini-ico`), contenido flexible, `padding: 8px 0`, divisor 1px `--border-subtle` excepto la última.
- `.sol-row` (RRHH y portales): avatar/icono, contenido, chip de estado a la derecha; mismo ritmo de separación.
- **Separación**: entre filas 8px de padding + borde; la última fila sin borde.

#### 7.4.4 Tarjeta de módulo `.rh-mod-card` (panel RH)

- Grilla fija de **3 columnas** `minmax(0,1fr)` con `gap: 24px`; en <600px gap 12px e iconos 32px; nunca desborda horizontal.
- Iconos `stat-ico` 38px con tinte (`brand`/`succ`/`warn`), título + descripción.
- **Separación**: `margin-top: 20px` respecto al contenido previo; `gap: 24px` entre tarjetas.

#### 7.4.5 Imágenes y placeholders `.photo-ph` / `.inm-ph`

- `.photo-ph`: placeholder de fotografía (ficha de cliente, plano) — `aspect-ratio: 1`, radio `--radius-lg`, fondo `--bg-subtle`, icono SVG centrado; todas las referencias a fotos reales van por este patrón (la demo no usa fotos de stock).
- `.inm-ph`: placeholder de inmueble en cabecera de ficha — 88px cuadrado, radio `--radius-lg`, fondo `--bg-subtle`, icono `building` 36px, `aria-hidden="true"` (decorativo junto al nombre del inmueble).
- **Separación**: junto al título en `flex` con `gap: 14px`; nunca ocupa ancho completo.

### 7.5 Tabla canónica (la única tabla)

> **Regla P3**: existe una sola implementación de tabla en todo el sistema (`tbl-wrap` + `table.tbl`). Todos los listados la usan: clientes, inmuebles, contratos, cobros, liquidaciones, incidencias, línea blanca, asientos, notificaciones, reportes, usuarios, RH y portales. Solo cambia la data.

```html
<div class="card">                       <!-- o .tbl-wrap standalone -->
  <div class="tbl-wrap">
    <table class="tbl dense">
      <caption>Contexto de la lista</caption>
      <thead><tr><th>Columna</th><th class="num">Monto</th>…</tr></thead>
      <tbody>
        <tr>
          <td>…</td>
          <td class="num mono">B/. 900.00</td>
          <td><span class="chip chip-success">PAGADO</span></td>
          <td><button class="btn-icon-row" aria-label="Opciones">⋮</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="pagination">1–25 de 387 · ‹ › · 25/50/100</div>
</div>
```

| Regla | Valor |
| --- | --- |
| Encabezado | 12px caps/600, `--text-s`, fondo `--bg-subtle`, borde inferior 1px, padding `10px 14px` |
| Filas | Normal `padding: 12px 14px` (fila 44px); `.dense` = `7px 12px` (fila 36px) |
| Celdas numéricas / montos | `class="num"` y `mono` para montos: derecha + cifras tabulares |
| Folios / fechas / cédulas | `class="mono"` |
| Hover | `.tbl-hover` / `.rowlink` → `--bg-hover` |
| Divisor entre filas | `border-bottom: 1px solid var(--border-subtle)` (sin borde en la última) |
| Estado | Chip semántico en celda dedicada |
| Filas sin datos | Celda `colspan` con texto terciario |
| Caption | Arriba, 13px, `--text-s` |

- **Paginación** (`.pagination`): `1–25 de 387` a la izquierda; botones ‹ › y selector 25/50/100 a la derecha; `page-btn` 28px, activo con `--brand`.
- **Única implementación**: toda tabla paginada usa la función reutilizable `pagBar(id, total, per, page, refreshFn)` que genera ese markup `.pagination` (rango `from–to de total`, flechas `page-btn` con `chevleft/chevright`, ventana de páginas numéricas con elipsis, selector `Mostrar` con clase `.page-size`). Está prohibido escribir la paginación a mano dentro de cada módulo. El listado itera `slicePage(s, rows)` (corte real por `s.per`) y el callback de refresco actualiza el área del módulo.
- **Checkbox de selección**: variante documentada de la tabla canónica, se usa **solo** en módulos con acciones masivas (Clientes, para exportar/acciones por lote). Columna `th` con "Seleccionar todos" + `td` por fila; la fila mantiene `rowlink` y el checkbox frena el evento con `stopPropagation`. No se replica en listados sin acciones masivas.
- Menú de fila `⋮`: botón `btn-icon` 36–44px + `.menu` (ver 7.10).
- **Anchos de columna**: como clases reutilizables (experiencia de la v1.6, aplicada a todas las tablas): `.col-act` = columna de acciones (44px, centrada); `.w110`/`.w120`/`.w150`/`.w220` para fechas, folios, montos y descripciones con ancho fijo; **prohibido** el `style="width:…px"` inline como columna.
- **Separación**: tabla dentro de card sin borde exterior (la card es el contenedor); `.tbl-wrap` standalone con borde `--border-subtle` y radio `--radius-lg`; la paginación con `padding: 16px 20px`.
- **Responsive**: `overflow-x: auto` dentro del contenedor; en móvil el listado puede pasar a tarjetas solo si el módulo lo documenta.

#### 7.5.1 Fila de detalle `.detail-row` (master-detail)

Las fichas maestras (cliente, inmueble, contrato, recibo, asiento) muestran pares *etiqueta → valor* como filas de detalle, no como tablas:

```html
<div class="detail-row">            <— 1 línea, etiqueta izquierda, valor derecha
  <span class="muted2 small">Cédula</span>
  <span class="mono strong">8-123-456</span>
</div>
<!-- Modificadores -->
<div class="detail-row detail-md">…</div>    <!-- 6px de padding vertical -->
<div class="detail-row detail-lg">…</div>    <!-- 8–10px de padding vertical -->
<div class="detail-row detail-bd">…</div>    <!-- borde inferior 1px -->
<div class="detail-row detail-dash">…</div>  <!-- borde inferior discontinuo -->
<div class="detail-row detail-top">…</div>   <!-- borde superior 1px -->
<div class="detail-row detail-xl">…</div>    <!-- 12px + borde inferior, filas con contexto extendido -->
<div class="detail-tool">…</div>             <!-- herramienta/total del bloque (padding 14px 4px 2px, gap 12px, wrap) -->
<div class="detail-tot">…</div>              <!-- total del bloque (padding 10px 2px 0) -->
```

El modificador se compone: `detail-row detail-bd detail-xl` (frecuente en fichas). Las cabeceras de tarjeta con chip (`flex between align-items:flex-start`) NO son detail rows: conservan su patrón de cabecera.

### 7.6 Chips y badges

- `.chip`: alto 22px, radio pill, padding `0 8px`, 12px/600, borde 1px del trío semántico; icono interno 12px con `gap: 4px`.
- Variantes: `chip-success | chip-warning | chip-danger | chip-info | chip-neutral`.
- `chip-remove`: botón × dentro del chip (filtros activos) con `aria-label`.
- `.badge`: conteo en nav (18px, pill, fondo `--brand`, texto blanco).
- `.chip-select`: selector pill (periodo de dashboard) con sombra `sm`; hover borde `--brand`.
- **Separación**: entre chips adyacentes `gap: 8px`; dentro de una celda de tabla, múltiples chips con `gap: 4px`.

### 7.7 Toolbar y filtros

- `.toolbar`: `flex wrap` con `gap: 12px` y `margin-bottom: 16px`; campo `.search` flex 1 (mínimo 200px) con icono 16px a la izquierda y padding `0 12px 0 36px`.
- `.chips-row`: chips de filtros activos con `gap: 12px` y `margin-bottom: 20px`; estado vacío: `Sin filtros activos` en texto terciario.
- Los filtros complejos viajan en **drawer derecho** (`w360`) con pie `Limpiar` (ghost) + `Aplicar` (primary). Un solo punto de render por módulo (`drawerFiltros*`).

### 7.8 Diálogo `.modal`, panel `.drawer`, aviso `.toast`

| Componente | Ancho | Uso |
| --- | --- | --- |
| `.modal` | 480px · `w520` 520px · `w560` 560px · `lg` 640px · `xl` 860px | Confirmaciones, formularios enfocados, asistentes |
| `.drawer` | 360px (`w360`, filtros) · 480px (resumen) · 720px (`w720`, fichas y edición) | Detalle maestro, filtros, edición larga |
| `.toast` | 360px | Avisos breves (5 s; error 8 s) |

- Todos usan `.overlay` con `--scrim`; `role="dialog"`, `aria-modal`, foco al abrir; `Esc` y click fuera cierran.
- Variante `.overlay.side` para drawers: `justify-content: flex-end; padding: 0` (el panel se apoya en el borde derecho y ocupa todo el alto).
- `modal-head` (título 16px/600 + botón ×) / `modal-body` (padding 24px, scroll) / `modal-foot` (acciones a la derecha, `gap 12px`, borde superior).
- Toasts: borde izquierdo 4px semántico (`toast-success/error/warning/info`), icono 18px, título + mensaje 13px; pila superior derecha con `aria-live`.
- **Separación**: entre acciones del pie `gap: 12px`; entre bloques del body 16px; entre toasts `gap: 8px`.

### 7.9 Alertas `.alert`

Fondo/borde/color semántico (`alert-info/warning/success/danger`), icono 20px, título 14px/600 + párrafo 13px `--text-s`, `gap: 12px`, `margin-bottom: 16px`. Se usa para explicar plazos, esquemas de pago, seguridad y resultados.

### 7.10 Menú contextual `.menu`

.menu (dropdown de fila)

- Contenedor posicionado sobre tarjeta/sombra `lg`, radio `--radius-md`, padding 6px, fondo `--bg-content`, ancho ≥ 200px, z-index por encima de la tabla.
- Ítems `.menu-item`: alto 36px, radio `--radius-sm`, icono 16px, texto 13px; hover `--bg-subtle`; variantes `.edit` (título 600) y `.danger` (texto y hover `--danger`, `--danger-bg`).
- Apertura: clic en `⋮` (aria-haspopup + aria-expanded); cierre con Esc o click fuera.
- **Separación**: ítems con `gap: 6px` interno (padding); separadores opcionales `.menu-divider` de 1px `--border-subtle`.

### 7.11 Timeline `.timeline`

- Columna de eventos: línea vertical 2px `--border-default`; nodos de 10px con anillo; últimos eventos colapsados al final.
- Ítem: fecha 12px caps `--text-s` + título 13px/600 + meta 13px `--text-s`; `gap: 10px` entre título/meta; espacio entre eventos `margin: 0 0 16px`.
- Los 3 primeros eventos se muestran; el resto se colapsa con botón `Mostrar más`.

### 7.12 Calendario `.cal-grid` (Portal inquilino)

- Grilla `6 cols` (≥600px) / 2 cols (<600px) con `gap: 12px`; días > 31 días del mes se ocultan.
- Día: marca superior + número 24px/600 tabular; `cal-meta` 12px `--text-s`; punto de evento 6px; hoy con círculo `--brand` (texto blanco, variante `-sel` segmentado).
- Mosaico bajo `calendar-legend`: grilla 6 columns `minmax(120px,1fr)` con `margin-top: 24px`.

### 7.13 Comprobante `.receipt`

- Mono 13px tabular para todo; `font-mono`; papel con borde 1px `--border-default`, radio `--radius-lg`, padding 20px; sombra `sm`.
- `receipt-hd`: nombre del sistema 13px caps; `receipt-info` (líneas de detalle separadas por `border-bottom` 1px); `receipt-total` (monto grande 20px 700 tabular); desconexión de línea punteada antes del total.
- **Separación**: filas con `padding: 8px 0` + divisor; `gap: 4px` entre etiqueta/valor de una línea.

### 7.14 Tablero Kanban `.kanban` (Línea blanca)

- `.kanban-col`: `min-width: 240px` y fondo `--bg-canvas`, borde `--border-subtle`, radio `--radius-lg`; con `overflow-x: auto` en el contenedor padre.
- `.kanban-item`: tarjeta con sombra `sm`, padding 12px, estado con chip; arrastre simulado con `cursor: grab`; `gap: 12px` entre ítems; columnas `gap: 16px`.
- Responsive: las 5 columnas en scroll horizontal dentro de `.kanban` (no provoca scroll de página).

### 7.15 Método de pago `.metodo`

- Fila tipo tarjeta: icono `stat-ico` 38px, alias 13px/600, estado `chip-success` si conectado, `chip-neutral` si no; sombra `sm`; padding 14px.

### 7.16 Estados de pantalla

| Estado | Implementación |
| --- | --- |
| Loading | `.skeleton` (bloque con `--bg-subtle` animado 1.2s) por sección; reemplaza tablas/tarjetas/filtros |
| Vacío | `.empty` con icono 24px, título 16px/600, párrafo 13px `--text-s` y CTA opcional |
| Error | `.alert-danger` con mensaje + `trace_id` en mono + botón `Reintentar` |
| Éxito | Toast breve `toast-success` con acción deshacer cuando aplique |
| Sin permiso | Guardia `.no-perm`: icono `shield`, título, párrafo indicando que el backend es la autoridad real |
| Confirmación | `.modal` con `btn-danger` solo para destructivas/irreversibles |

---

## 8. Patrones de pantalla

1. **Dashboard (Admin)**: `page-head` → `toolbar` con selector de período + alerta contextual (mora) → `.kpis` (8 KPIs en `auto-fit` de 2/4) → `g2` (Ingresos con debit-CR / Cobros-Anticipos) → `g3` (Mora, Próximos vencimientos, Novedades) → `g2.lista` (Contratos próximos a vencer + Actividad reciente).
2. **Listado maestro**: `page-head` → `toolbar` (búsqueda + filtros) → `chips-row` de filtros activos → tabla canónica → paginación. Ficha lateral en drawer `w720`.
3. **Ficha de detalle**: drawer `w720` con estados ancla, resumen en `stat-row`/grilla 2-3 columnas, historial en `.timeline`, acciones en pie.
4. **Formulario**: modal (foco) o drawer w720 (largo); `form-grid` 2 columnas; `form-actions` al pie.
5. **Asistente (crear cobro)**: modal `lg` con pasos (Información → Recibos → Confirmar), stepper lineal con estado activo/completado; pie con `Anterior` ghost + `Siguiente` primary; último paso `Registrar cobro`.
6. **Autenticación**: pantalla centrada sobre `--bg-canvas` con logo; tarjeta 420px; pie con marca © año + empresa.
7. **Portales**: `portal-hero` + `.kpis-lite` (2-4 columnas ≥960px; 2 <960px; 1 <480px) + grillas de contenido (grilla 2 en inquilino; tarjetas de propiedad 3 en propietario ≥960px).
8. **Admin-General (usuarios/roles)**: tabla canónica + drawer w720 de edición; rótulos legibles (Vinculado, No vinculado).
9. **Módulo RH**: grilla `.g4` de `.rh-mod-card` (Dashboard, Empleados, Asistencias, Nóminas, Ausencias, Capacitaciones, Evaluaciones, Expedientes) → vista de empleado con `.stat-card` + `.sol-row` → formularios `.form-grid`.

---

## 9. Mapa de rutas a componentes

| Ruta | Componentes principales |
| --- | --- |
| `#/app/dashboard` | kpis, alert, g2, g3, g2.lista, timeline, chips, alert-info |
| `#/app/clientes` + `#/app/inmuebles` | toolbar, tabla canónica, pagination, drawer w720, modal |
| `#/app/contratos` | tabla, chip, drawer w720, modal (renovación), alert-info |
| `#/app/cobros` | steps (asistente), tabla, modal, options-menu, drawer |
| `#/app/liquidaciones` | tabla, direcciones, drawer w720, toast |
| `#/app/incidencias` | toolbar con select-estado, tabla, drawer w720, alert-info |
| `#/app/lineablanca` | kanban 5 columnas, drawer w720 |
| `#/app/contabilidad` / `-comprobantes` / `-asientos` / `-cierres` | tabla, tabs, drawer w720, modal, timeline, alertas |
| `#/app/reportes` | tabla de reportes, modal notificaciones, panel-chart |
| `#/app/notificaciones` | tabla, drawer w720 |
| `#/app/usuarios` / `-roles` | tabla, drawer w720, modal |
| Portal inquilino | portal-hero, kpis-lite, g2, cal-grid, mini-row, tabs, empty |
| Portal propietario | portal-hero, kpis-lite, panel-chart, tarjetas propiedad, mini-row |
| `#/app/rh/*` | grilla módulos, stat-cards, sol-row, form-grid, drawer |
| Login / OTP / Reset | entrada centrada, card 420px, OTP celdas 6×48px |

---

## 10. RBAC demo

- Selector de usuario de prueba en la topbar (Admin, Contador, Gestor de Incidencias, Consultor, Inquilino, Propietario).
- Los íconos del menú, widgets y acciones se ocultan/deshabilitan según el permiso del rol activo (`modulo.accion`).
- Rutas protegidas sin permiso: guardia `.no-perm` sin fuga de contenido.
- Nota visible: "El backend es siempre la autoridad real de permisos; esta demo solo controla la experiencia visual".
- Usuario no vinculado: secciones de RH y Contabilidad ocultas y acceso a su ruta muestra guardia.

---

## 11. Responsive

- **Admin**: sidebar → drawer < 960px; tabelas con scroll interno; KPIs 4→3→2→1.
- **Portales**: sidebar clara ≥ 960px → bottom-nav < 960px; contenido con `padding-bottom: 92px`.
- **Tablas**: `.tbl-wrap` con `overflow-x: auto`; listados compactos en móvil pasan a tarjetas solo si el módulo lo define.
- Prohibido scroll horizontal de página en cualquier breakpoint.
- Objetivos táctiles ≥ 44px en controles standalone (bottom-nav, iconos de acción, celdas OTP).

---

## 12. Accesibilidad (WCAG 2.2 AA)

- `label` visible en todos los campos; `aria-invalid` + mensaje de error asociado a `aria-describedby`.
- `:focus-visible` con `outline 2px var(--brand)` en todos los controles.
- Contraste: texto plano ≥ 4.5:1; texto grande y bold ≥ 3:1; estados semánticos con doble canal (icono + color + etiqueta).
- Navegación por teclado completa: diálogos con focus trap, tabla con filas linkeables, menús con Esc.
- `prefers-reduced-motion`: duración de transiciones se anula.
- Tooltips/avisos con `aria-live`; iconos decorativos `aria-hidden`; iconos con significado `aria-label`.
- Orden de foco lógico: encabezado → toolbar → contenido → paginación.

---

## 13. Pautas de implementación (Blazor + MudBlazor)

> Guía para cuando se implemente el stack objetivo (ASP.NET Core 10 + Blazor). No se escribe código hoy.

- Mapear cada componente del catálogo a un componente MudBlazor con override de tema: `MudDataGrid` → tabla canónica (estilos densos, montos tabulares), `MudChip` → chips semánticos, `MudDialog` → `.modal`, `MudDrawer` → `.drawer`, `MudSnackbar` → `.toast`, `MudTabs` → `.tabs`.
- Aplicar el tema GRAFITO vía `MudThemeProvider` con la paleta de tokens (`docs/ui/tokens.css` como fuente de verdad).
- RBAC: autorización por `modulo.accion`; la UI oculta acciones según permiso y el backend valida siempre (BFF).
- Formatear moneda `B/.` y fechas `DD/MM/YYYY` desde un único helper de localización.

---

## 14. Registro de esta revisión (2026-09-19)

Correcciones aplicadas al prototipo `ui/prototipo-demo.html` durante la revisión v1.6 para cumplir este documento:

| # | Corrección | Ficha |
| --- | --- | --- |
| 1 | `stat-value` con color inline → clases semánticas `.v-danger / .v-warn / .v-succ / .v-info / .v-brand` (incl. ternarios dinámicos) | 7.4.2 |
| 2 | `stat-value` con `font-size` inline (18/22/24px) → `.stat-value.sm/.md/.lg`; totales 16px → `.total-val` | 7.4.2 |
| 3 | Filas de detalle con `padding/border` inline → `.detail-row` + modificadores `.detail-md/.detail-lg/.detail-bd/.detail-dash/.detail-top/.detail-xl/.detail-tool/.detail-tot` | 7.5.1 |
| 4 | Columnas de tabla con `style="width:…px"` → clases `.col-act` (acciones), `.w110/.w120/.w150/.w220` | 7.5 |
| 5 | Tabla unificada: todas las listas usan `tbl dense tbl-hover`; nada de variantes por módulo | 7.5 |
| 6 | Card con tabla: `.tbl-card` + `.tbl-card .card-head` (head plegado) | 7.4.1 · 7.5 |
| 7 | `kpis` con `margin-bottom` inline → clase base (token `--sp-6`) | 7.4.2 |
| 8 | Emojis de inmuebles eliminados → `.inm-ph` con icono `building` (SVG) `aria-hidden` | 7.4.5 |
| 9 | Fotos por url inexistente → `.photo-ph` con icono SVG | 7.4.5 |
| 10 | Tamaños de drawer/modal normalizados a los del catálogo (`w720`/`lg`/`xl`; eliminados `w680`/`w640`) | 7.8 |
| 11 | `--success`/`--surface-muted` inexistentes en switch → `--succ`/`--bg-subtle` | 2.1 · 7.3 |
| 12 | `btn-success` → `btn-primary` (acción destructiva con confirmación) | 7.1 |
| 13 | Verificación: sin tokens rotos residuales, `node --check` sin errores, copy hash-idéntica a `site/` (§ Validación) | — |
| 14 | Paginación unificada: `pagBar` pasa a generar el markup canónico `.pagination` (antes usaba `detail-tool` + `btn-secondary`); Clientes, Inmuebles y Contratos migrados de paginación manual a `pagBar` + `slicePage` real (25/50/100 funcionales); todas las tablas paginadas con la paginación dentro de la card | 7.5 |
| 15 | Variante de selección documentada: checkbox en tabla solo para módulos con acciones masivas (Clientes); el resto de listados no la replica | 7.5 |

**Validación ejecutada**: auditoría de tokens por expresiones regulares (sin restos de `--surface`, `--muted`, `--surface-muted`, `--success`, `btn-success`, `w680/w640`, `width:` de columnas de tabla 32–220px); sintaxis del script embebido validada con `node --check`; copia `ui/prototipo-demo.html` → `site/prototipo-demo.html` verificada por hash SHA-256. **Nota**: queda un `width:32px` inline como marcador de cláusula (`C1…C5`) en la ficha de contrato — layout de contenido, no columna de tabla; se acepta y queda fuera de la tabla canónica.

---

## 15. Control de versiones

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 1.6.1 | 2026-09-19 | Paginación canónica única: `pagBar` con markup `.pagination` + `page-btn`; migración de Clientes/Inmuebles/Contratos a `pagBar` + `slicePage` (corte real, selector 25/50/100 funcional); paginación dentro de la card en todas las tablas paginadas; variante checkbox documentada (módulos con acciones masivas) (§7.5) | 
| 1.6 | 2026-09-19 | Revisión de clases inline del prototipo: `.detail-row` + modificadores (§7.5.1), `.v-*` y tamaños de `.stat-value` (§7.4.2), `.col-act`/`.w*` (anchos de tabla), `.tbl-card`, `.st-sect`, `.photo-ph`/`.inm-ph` (§7.4.5), `.overlay.side` (§7.8); normalización de tamaños de drawer/modal; eliminación de emojis y tokens inexistentes; registro §14 | 
| 1.5 | 2026-09-19 | Documento componentizado completo; canon de separación entre elementos (§3); unificación de estilos del prototipo (tabla canónica, chips, tarjetas, modales, iconos) y registro de correcciones (§14); tokens en `docs/ui/tokens.css` |
| 1.0 | (histórico) | Documento base previo a la revisión componentizada |