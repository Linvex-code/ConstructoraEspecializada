# GRAFITO — Sistema de diseño v1.6

> Documento de referencia de componentes para la Plataforma de Administración de Inmuebles, Portales y Contabilidad (Constructora Especializada · Panamá).
> Define **un solo sistema de estilo**: cada componente tiene una única implementación canónica y cada componente mantiene una separación explícita y consistente respecto a los elementos que lo rodean.

| Campo | Valor |
| --- | --- |
| Versión | 1.6.1 |
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

## 7. Catálogo de componentes estandarizados

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

Borde discontinuo 1.5px `--border-default`, radio `--radius-lg`, padding `12px 16px`, icono 20px; hover con borde `--brand`. Variante `-sm` (icono 16px). **Separación** respecto a `.field` adyacente: 16px.

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
- Variante interactiva `.card-hover` (sombra `md` en hover, cursor pointer) para tarjetas clickeables.
- `.st-sect`: modificador de bloque para `stat-label`/`card-title` que abre sección, `display: block; margin-bottom: 12px`.
- `.tbl-card`: card que contiene una tabla canónica; su `card-head` se pliega con `.tbl-card .card-head{padding:16px 16px 0;margin-bottom:0}` para que la tabla ocupe el ancho completo de la card.

#### 7.4.2 `.stat-card` (tarjeta KPI)

- `stat-label`: 12px caps/600 · `stat-value`: 30px/600 tabular (`clamp(19px,1.9vw,28px)` en mosaicos) · `stat-meta`: 13px `--text-s`.
- Variante `.stat-card-h` con `stat-ico` de 42px, radio 12px y tinte semántico (`color-mix` 13–14%).
- **Separación**: solo dentro de `.kpis`/`.kpis-4` (`auto-fit` + `gap 16px`); nunca a ancho completo con 1–2 piezas.
- Tamaños reducidos de `stat-value` en contexto: `.stat-value.sm` (18px), `.stat-value.md` (22px), `.stat-value.lg` (24px), `.total-val` (16px tabular).
- Color semántico del valor: `.v-danger | .v-warn | .v-succ | .v-info | .v-brand`.

#### 7.4.3 Fila de lista `.mini-row` / `.sol-row`

- `.mini-row` (dashboards): icono 32px, `padding: 8px 0`, divisor 1px `--border-subtle` (última fila sin borde).
- `.sol-row` (RRHH): avatar/icono, contenido, chip de estado; mismo ritmo de separación.
- **Separación**: entre filas 8px de padding + borde; última fila sin borde.

#### 7.4.4 Componentes de marcadores (Placeholders)

- `.photo-ph` / `.inm-ph`: `aspect-ratio: 1` (o 88px), radio `--radius-lg`, fondo `--bg-subtle`, icono SVG centrado.
- **Separación**: en contenedor flex junto a títulos con `gap: 14px`. Nunca ocupan el ancho completo.

### 7.5 Tabla canónica (la única tabla)

> **Regla de oro**: existe una sola implementación de tabla en todo el sistema (`tbl-wrap` + `table.tbl`). Todos los listados la usan. Solo cambia la data.

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

- **Paginación** (`.pagination`): Uso obligatorio del markup generado por `pagBar()`. Prohibido crear paginaciones manuales. Rango a la izquierda, controles y selector 25/50/100 a la derecha.
- **Anchos de columna**: Solo se usan clases reutilizables (`.col-act`, `.w110`, `.w150`, `.w220`). **Prohibido** usar `style="width:..."` en las columnas.
- **Separación**: La tabla se ajusta sin borde exterior dentro de un `.card`. Si es standalone, usa `.tbl-wrap` con borde `--border-subtle` y radio `--radius-lg`.
- **Responsive**: `overflow-x: auto` dentro de su contenedor.

#### 7.5.1 Fila de detalle `.detail-row` (master-detail)

Para fichas maestras (cliente, inmueble), NO se usan tablas, se usan filas de detalle `flex`:

```html
<div class="detail-row detail-bd detail-xl">
  <span class="muted2 small">Cédula</span>
  <span class="mono strong">8-123-456</span>
</div>
```

Modificadores estandarizados para separación interna: `.detail-md` (6px), `.detail-lg` (8-10px), `.detail-xl` (12px), `.detail-bd` (borde inferior), `.detail-dash` (borde discontinuo), `.detail-top` (borde superior).

### 7.6 Chips y badges

- `.chip`: alto 22px, radio pill, padding `0 8px`, 12px/600, borde 1px del trío semántico.
- **Separación**: entre chips adyacentes `gap: 8px`; dentro de una celda de tabla, múltiples chips con `gap: 4px`.

### 7.7 Toolbar y filtros

- `.toolbar`: `flex wrap` con `gap: 12px` y `margin-bottom: 16px`; campo `.search` flex 1 (mínimo 200px) con icono 16px a la izquierda.
- `.chips-row`: chips de filtros activos con `gap: 12px` y `margin-bottom: 20px`.
- Los filtros complejos viajan siempre en un **drawer derecho** (`w360`).

### 7.8 Diálogo `.modal`, panel `.drawer`, aviso `.toast`

- Anchos estandarizados: `.modal` (480px, `w520`, `w560`, `lg` 640px, `xl` 860px), `.drawer` (`w360`, 480px, `w720`), `.toast` (360px).
- **Separación**: padding interno de `24px` en `modal-body`. Entre acciones del `modal-foot`: `gap: 12px` alineado a la derecha.

### 7.9 Menú contextual `.menu`

- Apertura con botón `⋮` (`aria-haspopup`). Alto de ítems 36px, radio `--radius-sm`.
- **Separación**: `padding: 6px` interno en el contenedor `.menu`; ítems con `gap: 6px`.

---

## 8. Patrones de pantalla

1. **Dashboard (Admin)**: `page-head` → `toolbar` → `.kpis` (8 KPIs en `auto-fit` de 2/4) → `g2` → `g3` → `g2.lista`.
2. **Listado maestro**: `page-head` → `toolbar` (búsqueda + filtros) → `chips-row` → **tabla canónica** → paginación.
3. **Formulario**: modal (foco) o drawer `w720`; `form-grid` 2 columnas; `form-actions` al pie.

---

## 9. Responsive

- **Tablas**: `.tbl-wrap` usa `overflow-x: auto`. Prohibido el scroll horizontal en toda la página.
- **Grillas**: Los KPIs colapsan ordenadamente (4 → 3 → 2 → 1 columna) conservando siempre su `gap: 16px`.
- **Objetivos táctiles**: En resoluciones de móvil, botones de ícono y controles independientes deben tener al menos 44px de área táctil.

---

## 10. Control de versiones

| Versión | Fecha | Cambio |
| --- | --- | --- |
| 1.6.1 | 2026-09-19 | Estandarización estricta: Paginación canónica única (`pagBar`), eliminación de variaciones en tablas. Refuerzo de espaciados (`gap: 16px`, márgenes) como norma inflexible de diseño. |
| 1.6 | 2026-09-19 | Revisión de clases inline del prototipo. Creación de modificadores semánticos en componentes (`.detail-*`, `.stat-value.*`). | 
| 1.5 | 2026-09-19 | Documento componentizado completo; canon de separación entre elementos (§3). Tokens en `docs/ui/tokens.css`. |