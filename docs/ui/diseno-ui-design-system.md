# Sistema de Diseño — **GRAFITO**
## Diseño UI/UX para la Plataforma de Administración de Inmuebles, Portales y Contabilidad (Panamá)

| Campo | Valor |
|---|---|
| **Versión** | 1.7 |
| **Fecha** | 16/09/2026 |
| **Estado** | Aprobado para implementación (open design). **Validado con el motor de diseño `ui-ux-pro-max`** (ver Anexo A) y **con prototipo HTML ejecutable** (ver Anexo B). Pendiente de branding del cliente — el sistema usa **paleta neutra provisional** lista para reemplazar. **Actualización v1.5:** lenguaje de negocio (módulo "Cobranza"→"Cobros"), formato único de fechas, regla clara de tamaños de iconos y adaptativo sin desplazamiento horizontal. **Actualización v1.6:** cambio de estado gestionado de clientes (patrón §5.9 + diálogo §6.9), menú de fila ⋮ sin borde heredado del navegador (§6.1/§6.5/§8.4), y exclusividad de ocupación con selección de inmuebles por estado candidato + defensa en profundidad backend (§5.8). **Actualización v1.7:** carga de contrato firmado obligatorio en arrendamiento (zona de carga §6.29, pestaña Documentos §6.30, RF-CON-07), gestión de documentos en ficha de cliente (`clientes.documentos.gestionar`). |
| **Documentos base** | `docs/diseno-arquitectura.md` (v1.0), `docs/modulo-contabilidad.md` (v1.0) |
| **Archivos de diseño** | `docs/ui/diseno-ui-design-system.md` (este documento), `docs/ui/tokens.dtcg.json` (tokens W3C DTCG), `docs/ui/tokens.css` (variables CSS), `docs/ui/prototipo-validacion.html` (prototipo de validación de fidelidad, autocontenido) |
| **Stack de UI (objetivo)** | Blazor Web App (ASP.NET Core 10) + MudBlazor — pero el sistema es **tool-agnostic**: estos tokens y componentes se implementan en cualquier stack |
| **Áreas** | Admin `/app/*`, Portal Inquilino `/portal/inquilino/*`, Portal Propietario `/portal/propietario/*` |

---

## Cómo usar este documento (contrato open design)

Cualquier IA o desarrollador puede construir la UI completa leyendo este documento + `tokens.dtcg.json` + `tokens.css`. El orden de aplicación es:

1. Lea **tokens** (secciones 2 y 3) — son la fuente de verdad de color, tipo, espacio, radio, sombra y movimiento.
2. Lea **arquitectura de información** (sección 4) y **patrones** (sección 5) para decidir layout y navegación.
3. Implemente cada **componente** (sección 6) respetando variantes, estados y accesibilidad.
4. Use los **esquemas ASCII** (sección 8) como blueprint de cada pantalla.
5. Valide contra **responsive** (sección 9), **accesibilidad** (sección 10) y **gráficos** (sección 11).
6. Siga el **handoff** (sección 12) para MudBlazor o genérico, y el **plan de migración de marca** (sección 12.3).

> **Nota de cobertura:** este documento diseña TODOS los requisitos funcionales de los documentos base. La **Matriz de Cobertura** (sección 13) garantiza la trazabilidad módulo ↔ diseño. Ningún requisito prioritario (A) queda sin componente o patrón.

---

## 1. Intención de diseño

### 1.1 Personalidad

El producto es una herramienta de trabajo diario para una empresa panameña de administración de inmuebles y para sus clientes (inquilinos y propietarios). **No es una página de marketing.** La personalidad es:

> **Funcional con dignidad** — sobrio, formal, neutral y predecible. El sistema transmite confianza, orden y seguridad jurídica/financiera (dinero, contratos, impuestos). Sin adornos decorativos, sin ruido, sin sorpresas. Cada elemento existe porque resuelve una tarea.

Tono visual:
- **Sin alegría gratuita**: no usar gradientes llamativos, ilustraciones ni animaciones decorativas.
- **Enfocado**: una acción primaria visible por pantalla; densidad de datos cuidada; jerarquía clara.
- **Preciso**: los montos, folios y fechas son protagonistas (typo tabular, alineación numérica correcta).
- **Formal**: tipografía neutra, esquinas suaves mínimas, bordes finos, sombras sutiles.

### 1.2 Principios de diseño

| # | Principio | Cómo se aplica |
|---|---|---|
| P1 | **El dato manda** | Un buen layout expone primero los datos y la acción relevante; la decoración nunca compite con la información. |
| P2 | **Una tarea, un camino** | Cada pantalla tiene **una** acción primaria. Las acciones secundarias son visibles pero subordinadas. |
| P3 | **Predecible y consistente** | Mismos componentes para los mismos problemas en todo el sistema; mismo estado = misma apariencia. |
| P4 | **Densidad profesional** | Densidad media-alta en tablas y listas (más datos visibles) sin sacrificar legibilidad ni objetivos táctiles mínimos. |
| P5 | **El dinero es sagrado** | Montos siempre en formato consistente (`B/. 1,250.00`), cifras de ancho fijo, alineación a la derecha en columnas, estados de cobro visibles, confirmación para operaciones irreversibles. |
| P6 | **Confianza por transparencia** | Estados claros (borrador, aprobado, cerrado, error), trazabilidad visible (autor, fecha, folio), mensajes de confirmación/reversión explícitos. |
| P7 | **Accesibilidad desde el diseño** | WCAG 2.2 AA+ es requisito funcional, no una capa final. El color nunca es el único indicador. |
| P8 | **Brand-ready** | Todo el color pasa por tokens. Al recibir logo/colores corporativos se reemplazan SOLO las primitivas `brand.*` y `scaffold.*`; la semántica no cambia. |

### 1.3 Personas y contexto de uso

| Persona | Área | Contexto | Necesidad crítica |
|---|---|---|---|
| **Ofi (Administradora)** | Admin | Escritorio, jornada completa | Flujo rápido en listas y formularios; cero ambigüedad en estados |
| **Carla (Cobros/Finanzas)** | Admin | Fin de mes (picos) | Visibilidad de mora, montos y comprobantes sin clicks innecesarios |
| **Ricardo (Contador CPA)** | Admin | Cierres, impuestos, estados financieros | Exactitud, trazabilidad, exportación | 
| **Luis (Operaciones/Mant.)** | Admin | Rutas de mantenimiento, proveedores | Calendario y tablero de incidencias |
| **María (Inquilina)** | Portal Inquilino | Móvil, esporádico | Pagar, recibir comprobante, reportar incidencia, ver su calendario |
| **Sr. Vega (Propietario)** | Portal Propietario | Móvil/desktop, mensual | Ver que cobró, cuánto y cuándo (alcance en discusión, feature flag) |

**Implicación de diseño:** el Admin es denso y rápido (primero escritorio) y los portales usan el **mismo marco de aplicación responsive**: tablero con barra lateral en ≥960px y barra de navegación inferior + menú hamburguesa (panel deslizante) en <960px; una sola tarea por pantalla y táctil ≥44px.

---

## 2. Sistema visual

### 2.1 Paleta de color — estrategia neutral (sin marca aún)

Hasta recibir el branding del cliente, la identidad es **grafito** (negro-gris frío). No se usa azul corporativo ni colores de marca: los **colores semánticos** (verde, ámbar, rojo, azul informativo) solo existen para comunicar **estado**, nunca como identidad.

**Regla de oro:** el color comunica **estado** (éxito/peligro/aviso/info), no **estilo**. La identidad es neutra.

#### Escala neutra primitiva

```
Neutro-0   #FFFFFF  ─ fondo de contenido, superficies
Neutro-50  #F8F9FB  ─ fondo de página (detrás de tarjetas)
Neutro-100 #F1F3F6  ─ superficies sutiles, hover, inputs deshabilitados
Neutro-200 #E3E6EB  ─ bordes sutiles (separadores, cards)
Neutro-300 #CFD4DC  ─ bordes por defecto (inputs, tablas)
Neutro-400 #A6AEBB  ─ bordes fuertes, iconos deshabilitados
Neutro-500 #7C8694  ─ iconos neutros, marcadores de posición grandes
Neutro-600 #5B6470  ─ texto secundario (≥5.5:1 sobre blanco)
Neutro-700 #3E4653  ─ texto terciario/labels (uso limitado)
Neutro-800 #2A313D  ─ hover del brand
Neutro-900 #1B212B  ─ texto primario, botón primario, marca placeholder
Neutro-950 #10151D  ─ active del brand
```

#### Colores semánticos (solo estado) — todos verificados en contraste WCAG AA sobre blanco

| Token | HEX | Uso | Contraste sobre blanco |
|---|---|---|---|
| `status-success` | `#146C43` | Pagado, cobrado, aprobado, activo, saldo a favor | ≥ 6.2:1 |
| `status-warning` | `#7A4F00` | Pendiente, por vencer, mora, en proceso, reabierto | ≥ 6.4:1 |
| `status-danger` | `#B42318` | Anulado, rechazado, error, eliminado, vencido | ≥ 6.0:1 |
| `status-info` | `#1D4ED8` | Informativo, notificación, nuevo evento | ≥ 7.6:1 |
| `status-neutral` | `#5B6470` | Borrador, sin estado definido, neutro | ≥ 5.5:1 |

Fondos suaves para chips/alertas: `*-bg` (#E7F2EC, #FCF3D9, #FCE8E6, #E8F0FE, #F1F3F6) con bordes `*-border` matizados. **El color de estado SIEMPRE se acompaña de icono o texto** (P7).

#### Estructura de superficies

- `bg-canvas` #F6F7F9 → color de fondo de la página (admin)
- `bg-content` #FFFFFF → tarjetas, inputs, tablas, modales
- Scaffold (barra lateral/superior) `#141A22` → marco de la aplicación en Admin; texto `#E6E9EE`

### 2.2 Tipografía

**Familia UI:** *Inter* (400/500/600/700) — neutral, legible en español (incluye acentos y ñ), excelente en tablas densas. Fallback: Segoe UI / system-ui.
**Familia Mono:** *IBM Plex Mono* (400/500) — para folios, hashes, códigos de cuenta, cédula/RUC, referencias técnicas.

Reglas tipográficas:
- **Sin serifas decorativas**, sin variantes condensadas.
- **Cifras de ancho fijo obligatorias** en: montos, folios, fechas, cédulas, códigos, celdas numéricas de tablas (`font-variant-numeric: tabular-nums`).
- **Fechas — formato único en toda la UI:** la presentación siempre usa `DD/MM/YYYY` (día y mes de 2 dígitos, ej. `30/09/2026`); en columnas compactas `DD/MM` (ej. `30/09`). Los datos se almacenan en ISO 8601 (`YYYY-MM-DD`), pero **el display nunca muestra ISO**. Los períodos usan mes completo + año en español: `Septiembre 2026`. Todas las fechas usan la misma familia tipográfica (Inter) y `tabular-nums`; el único sitio con mono para fechas es el folio técnico (p.ej. `REC-2026-0147`).
- Etiquetas internas de sección usan `label-caps` (12px, 600, uppercase, tracking +0.06em) — estilo sobrio de "ficha de expediente".

Escala (rem mínimo 12px):

| Token | Tamaño / línea | Peso | Uso |
|---|---|---|---|
| `title-lg` | 30px / 1.25 | 600 | Tablero `title` de área (raro) |
| `title-md` | 24px / 1.3 | 600 | Título de página |
| `title-sm` | 20px / 1.35 | 600 | Subtítulos, título de tarjeta |
| `text-md` | 16px / 1.5 | 400 | Valores destacados, cuerpo de portal |
| `text-base` | 14px / 1.5 | 400 | Texto por defecto (UI) |
| `text-base-medium` | 14px | 500 | Filas seleccionadas, énfasis suave |
| `text-sm` | 13px / 1.5 | 400 | Celdas de tabla, descripciones, meta |
| `text-xs` | 12px / 1.5 | 400 | Metadatos, pie de tabla, fechas |
| `label-caps` | 12px | 600 | Encabezados de sección, etiquetas de estado |
| `mono-sm` / `mono-xs` | 13/12px | 400 | Folios, códigos, hash |

### 2.3 Espaciado, radio, sombra

- **Rejilla de 8px** con pasos intermedios de 4px: escala `2 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80`.
- **Página:** contenido `24px` de margen (32px en ≥1280px); tarjetas `16px` de padding interno; secciones separadas `24px`.
- **Radios:** campos/botones 6px (`radius-md`), tarjetas/menús 8px (`radius-lg`), diálogos/paneles deslizantes 12px (`radius-xl`), etiquetas tipo píldora 999px. Esquinas **contenidas** — un sistema formal no usa radios grandes.
- **Sombras sutiles:** `sm` para tarjetas quietas sobre el fondo, `md` para elevación al pasar el cursor sobre una tarjeta, `lg` menús/listas desplegables, `xl` diálogos/paneles deslizantes.
- **Bordes:** hairlines `1px` con `border-subtle`; inputs con `border-default`; focus ring 2px `border-focus` + offset 2px.

### 2.4 Iconografía

- **Familia única:** Phosphor (esquema regular, stroke consistente) en la implementación web; equivalente vectorial en otros stacks. **Nunca emojis como iconos funcionales.**
- **Regla de tamaños (obligatoria):** las medidas se toman de los tokens `icon-*`. **Prohibido escalar un icono con `width`/`height` arbitrarios** — si un contexto no está cubierto, se agrega un token antes de usarlo.

| Token | Px | Contexto de uso |
|---|---|---|
| `icon-xs` | 16 | Iconos en texto, etiquetas de estado, botones `sm`, celdas de tabla |
| `icon-sm` | 18 | Ítems de la navegación lateral (acompañados de etiqueta) |
| `icon-md` | 20 | Botones de icono, acciones de barra de herramientas, barra superior (campana, ayuda), menú de fila (`⋮`) |
| `icon-lg` | 24 | Encabezados de página, alertas/aviso destacados, estados vacíos, diálogos |
| `icon-xl` | 32 | Héroes del tablero y estados de proceso grandes |

Combinaciones fijas:
- **Botón con icono:** `icon-xs` (16) en botón `sm`; `icon-md` (20) en botones `md` y `lg`. Área de clic mínima 36px, **≥44px en táctil**.
- **Navegación lateral:** `icon-sm` (18) cuando hay etiqueta visible; `icon-md` (20) si el ítem está colapsado (solo icono).
- **Etiquetas de estado:** `icon-xs` (16) a la izquierda del texto.
- Iconos **solo marcadores de contexto**: estado, acción, alerta, navegación. El texto prevalece.
- Iconos decorativos al lado de texto visible: `aria-hidden="true"`. Iconos solos: `aria-label` descriptivo.

### 2.5 Movimiento (micro, funcional)

| Momento | Token | Duración |
|---|---|---|
| Al pasar el cursor / pulsación | `duration-hover` / `duration-state` | 100 / 150 ms |
| Panel deslizante / diálogo / menú | `duration-reveal` | 200 ms (desaceleración suave) |
| Indicadores de carga (ruedas y esqueletos) | constante, sutil | — |

Reglas: **respetar `prefers-reduced-motion`** (desactivar todo movimiento no esencial); no animar layouts (evitar CLS); feedback de botón en ≤150ms. El sistema **no usa** animaciones de entrada decorativas, parallax ni scroll narrativo.

---

## 3. Design tokens — fuente de verdad

Máquina de implementación a partir de `docs/ui/tokens.dtcg.json` (formato **W3C DTCG**):

- `grafito.color.primitive.*` — neutro, brand, semánticos primitivos.
- `grafito.color.semantic.*` — background, text, border, scaffold, status, chart, overlay.
- `grafito.typography.*` — fontFamily, fontWeight, escala tipográfica.
- `grafito.spacing.*`, `grafito.size.*`, `grafito.radius.*`, `grafito.shadow.*`, `grafito.border.*`, `grafito.motion.*`, `grafito.breakpoint.*`, `grafito.zIndex.*`.

Reglas:
1. **Ningún valor hardcodeado en la UI.** Todo color/tamaño/espacio nace de un token.
2. Si al implementar se detecta que falta un token, se **añade al archivo DTCG** y se regenera CSS; no se improvisa un valor.
3. Para crear la **marca** cuando el cliente la presente: reemplazar `brand.*` y `scaffold.*`; los semánticos permanecen.

---

## 4. Arquitectura de información y navegación

### 4.1 Áreas y sitemap

```
┌─ Inicio de sesión (Áreas separadas)─────────────────────┐
│  /login                  → todos los usuarios       │
│  /portal/inquilino/login → inquilino (redirect)     │
└─────────────────────────────────────────────────────┘

┌─ Admin /app/* (escritorio-first)──────────────────────────────────┐
│  /app/resumen            → Tablero con KPIs y tareas            │
│  /app/clientes           → Personas (inquilinos/propietarios)     │
│  /app/inmuebles          → Portafolio + fotos                    │
│  /app/contratos          → Adm. y arrendamiento                   │
│  /app/cobros             → Recibos, pagos, mora, comprobantes     │
│  /app/liquidaciones      → A propietarios                          │
│  /app/incidencias        → Tablero + visitas                       │
│  /app/linea-blanca       → Electrodomésticos + mantenimientos      │
│  /app/contabilidad       → Plan de cuentas, asientos, cierres,     │
│  │                         conciliación, impuestos, activos fijos, │
│  │                         estados financieros                      │
│  /app/notificaciones     → Plantillas, eventos, envíos             │
│  /app/reportes           → Reportes y exportaciones                │
│  /app/administracion     → Usuarios, roles, permisos, configuración│
└────────────────────────────────────────────────────────────────────┘

┌─ Portal Inquilino /portal/inquilino/* (tablero: barra lateral ≥960px / barra de navegación inferior <960px)───┐
│  /resumen        → Tablero: saldo, próximo pago,     │
│                    incidencias abiertas, notificaciones │
│  /calendario     → Pagos, visitas, eventos              │
│  /pagos          → Historial de pagos + comprobantes PDF│
│  /incidencias    → Nueva / seguir mis incidencias       │
│  /perfil         → Datos de contacto y preferencias     │
└─────────────────────────────────────────────────────────┘

┌─ Portal Propietario /portal/propietario/* (feature flag)─┐
│  /resumen  → Pagos recibidos (fecha, monto, inmueble)    │
│  /perfil                                                  │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Permisos → visibilidad (frontend controla UX; backend valida)

Regla global: **el menú y las acciones muestran/ocultan según permiso del rol** — nunca sustituye la autorización del backend.

| Módulo | Permisos que controlan la navegación |
|---|---|
| Clientes | `clientes.read` (lista/ficha), `clientes.create/update/delete`, `clientes.documentos.gestionar` |
| Inmuebles | `inmuebles.read/create/update/delete`, `inmuebles.fotos.gestionar` |
| Contratos | `contratos.read/create/firmar/renovar/terminar` |
| Cobros | `cobros.recibos.generar`, `cobros.pagos.registrar`, `cobros.pagos.anular`, `cobros.mora.consultar` |
| Liquidaciones | `liquidaciones.generar/confirmar/pagar` |
| Incidencias | `incidencias.leer/asignar/cerrar`, `incidencias.visitas.programar` |
| Línea blanca | `lineablanca.registrar`, `lineablanca.mantenimientos.registrar`, `lineablanca.reportes.ver` |
| Contabilidad | `contabilidad.*` (ver sección 10 del doc contable) |
| Admin | `usuarios.gestionar`, `roles.gestionar`, `configuracion.editar`, `feature-flags.gestionar` |
| Reportes/Auditoría | `reportes.ver`, `auditoria.ver` |

**Acciones sin permiso:** la acción está oculta **o** visible pero deshabilitada con nota emergente ("Se requiere permiso X"). Elegir "oculta" para acciones sensibles (borrar, aprobar, anular) y "deshabilitada con nota" para acciones de solo lectura.

**Aplicación en el prototipo (v1.4):** la regla está implementada en tiempo de ejecución — menú lateral, menú móvil (hamburguesa/panel deslizante), tablero (§8.3), búsqueda global y vistas protegidas usan `can(modulo)` / `hasPerm(permiso)` con los permisos del rol activo; la ficha de usuario de la barra superior permite cambiar de usuario de prueba (Administrador, Gerente, Contador, Cobros/Finanzas, Operaciones/Mant., Solo lectura) para validar cada perfil. El permiso real lo valida siempre el backend (RN-S01); el frontend solo controla la experiencia de uso.

### 4.3 App shell (patrón global)

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌────────────────────────────────────────────┐ │
│ │  Logo    │  │ Barra superior: búsqueda global [campana][ayuda][usuario]│ │
│ ├──────────┤  ├────────────────────────────────────────────┤ │
│ │ Barra    │  │ Ruta + Título de página + acciones          │ │
│ │ lateral  │  │                                            │ │
│ │ (256px)  │  │            Contenido (fondo de página)     │ │
│ │          │  │                                            │ │
│ └──────────┘  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- **Barra lateral:** 256px (colapsable a 72px iconos) con grupos: `Resumen`, módulos de negocio, `Contabilidad`, `Administración`. Ítem activo con fondo `scaffold-bg-active` + marca vertical de 3px (no solo color de fondo: viñeta + icono).
- **Barra superior:** 56px; búsqueda global (clientes, inmuebles, folios, contratos); menú de usuario (cambiar rol si aplica, perfil, cerrar sesión).
- **Contenido:** fondo `bg-canvas`; ruta de navegación en la cabecera de página (Inicio → Contabilidad → Asientos).
- **Sin páginas internas con scroll infinito como patrón base** — paginación clara (sección 6, DataTable).

### 4.4 Mapa de componentes (nivel 2)

```
Marco de aplicación
├─ Barra lateral (grupos + ítem + colapsable)
├─ Barra superior (búsqueda global, campana, perfil)
├─ Encabezado de página (ruta de navegación + título + acciones)
├─ Contenedor de página (fondo, márgenes)
└─ Sección de contenido (tarjeta/panel con título de sección)
```

---

## 5. Patrones de interacción

### 5.1 Lista + búsqueda + filtros (pantalla de trabajo)

Es el patrón dominante en Admin (clientes, inmuebles, contratos, recibos, asientos, equipos):

```
[ Título de página                     ]   [+ Nuevo]  (acción primaria)
[ Búsqueda… ][Filtros…][columnas][exportar]          (barra de herramientas)
┌─────────────────────────────────────────────────────────────┐
│ Filtros activos: [Tipo: Apartamento ×] [Estado: Activo ×]     │
│                                                              │
│ ┌──┬──────────────┬────────┬─────────┬──────────┬──────────┐ │
│ │☐ │ Ref/Persona  │ Estado │   Canon │ Próx.pago│    ⋮     │ │
│ │☐ │ Apt 3B        │ 🟢 Activo│B/. 900.00│ 5 días   │    ⋮     │ │
│ └──┴──────────────┴────────┴─────────┴──────────┴──────────┘ │
│ Paginación: 1-50 de 387   [‹][1][2][3]…[8][›]                 │
└─────────────────────────────────────────────────────────────┘
```

Reglas:
- La **búsqueda** filtra por texto principal (nombre, cédula, referencia, folio).
- Los **filtros** abren un panel/panel deslizante con campos tipados; los filtros activos se muestran como **etiquetas removibles** sobre la tabla.
- Cada columna es **ordenable**; columnas numéricas se ordenan numéricamente y se alinean a la derecha.
- **Menú de fila (⋮):** botón de icono *fantasma* (sin borde por defecto — evita el borde por defecto del navegador), objetivo táctil ≥44px, con `aria-haspopup="true"` y `aria-expanded`. Abre un menú desplegable (_menu_) con: acciones relevantes al permiso del rol (Ver ficha, Editar, Cambiar estado, Desactivar, etc.), grupo principal seguido de **separador** y acciones destructivas (si aplican). El menú no se corta dentro de la tabla (capas superpuestas, §6.22), cierra al hacer clic fuera o con `Esc`, y devuelve el foco al botón que lo abrió. Especificación completa en §5.9, §6.1 (botón de icono), §6.5 y §6.22.
- **Persistencia:** guardar última página/filtros por usuario-sesión (vía API, nunca localStorage para datos sensibles).

### 5.2 Master-detail (ficha de persona, inmueble, cliente)

Ficha en dos paneles: **cabecera resumen** (identidad + estado + acciones) y **cuerpo con tabs**:

```
┌──────────────────────────────────────────────────────────────┐
│ [Foto] Nombre Apellido        [Etiqueta de estado] [Editar][⋮] │
│        Cédula · contacto · edad · estado civil                │
│ ────────────────────────────────────────────────────────────  │
│ [Datos][Contactos][Laboral][Documentos][Bancarios][Historial] │
│ (tab content)                                                 │
└──────────────────────────────────────────────────────────────┘
```

- En móvil, la cabecera colapsa a tarjeta compacta y las tabs se vuelven horizontales scrollables.
- El **historial** usa un componente de Línea de tiempo (registro cronológico: incidencias, pagos, contratos, mantenimientos).

### 5.3 Formularios de datos maestros

- Layout de **1 columna en móvil, 2 columnas en ≥md** (label arriba, alineado).
- Campos obligatorios marcados con `*` y mensajes de validación **en línea** + resumen de errores al enviar el formulario.
- Entrada especializada: **máscara de entrada** para cédula (`4-123-456`), teléfono, RUC; **campo de dinero** con prefijo `B/.` (moneda Balboa/USD), separador de miles y 2 decimales (nunca centavos flotantes — se guarda entero en backend).
- La **acción de guardado** primaria (morado del flujo) está a un clic; se usa guardado estándar con confirmación visual (aviso breve) y manejo de conflictos `409` (se sube la versión y se ofrece refrescar).

### 5.4 Asistente / ejecución (cierre contable, registro de pago)

Solo para procesos de **múltiples pasos con verificación**:

```
Paso 1: Configurar  → Paso 2: Verificar → Paso 3: Ejecutar → Paso 4: Resultado
─────────────────────────────────────────────────────────────────────────────
[ 1 Config   ]  [ 2 Verificar ]  [ 3 Ejecutar ]  [ 4 Resultado ]
```

- Barra de pasos numérica + verificación con ✓ (no solo color).
- Paso "Verificar" muestra un resumen de lo que se ejecutará + validaciones; si hay errores, se detiene con panel de problemas.
- Paso "Ejecutar" tiene botón de acción con confirmación explícita del efecto y advertencia de irreversibilidad (para cierre contable).
- Paso "Resultado" muestra resumen: asientos generados, folio, TraceId, botón de descarga de reporte.
- **Cierres:** reutilizar el flujo con `TipoCierre` parametrizable (diario…anual), lista de períodos con estado (`Abierto → EnCierre → Cerrado → Reabierto`) y reapertura con causa obligatoria.
- **Nuevo contrato (asistente):** el paso de datos financieros del contrato se complementa con el paso de **adjunto obligatorio** — `[ 1 Inmueble ] → [ 2 Cliente ] → [ 3 Condiciones ] → [ 4 Contrato firmado ] → [ 5 Confirmar ]`. El paso 4 usa la zona de carga (§6.29): en Arrendamiento es `Requerido` (botón de confirmar deshabilitado hasta cargar) y en Administración `Opcional`. El backend revalida el adjunto al guardar (RN-S01).

### 5.5 Datos financieros (reglas de oro)

- Formato único: `B/. 1,234.56`. Los negativos en rojo con signo `-B/. 100.00` (verde=abono/saldo a favor, rojo=adeudo/pago). **El icono/texto acompaña cualquier color.**
- En tablas, montos alineados a la derecha con cifras de ancho fijo; encabezados alineados igual.
- Operaciones sobre dinero (registrar pago, anular, aprobar asiento, cerrar período) siempre usan **diálogo de confirmación** con resumen de lo que cambiará y, cuando procede, casilla "Entiendo que no podré editar esto después".
- Comprobantes/recibos: siempre visibles como PDF descargable; el patrón de botón "Descargar comprobante" es consistente en Admin y portales.

### 5.6 Calendario y agenda (portal inquilino + operaciones)

- Vista **mensual** por defecto; **agenda de lista** alternativa; navegación anterior/hoy/siguiente.
- Tipos de evento con color + **etiqueta de texto** (Pago pendiente, Visita mantenimiento, Evento contrato) — el color no es el único canal.
- Tapping un día abre un panel de eventos; tapping un evento abre detalle (monto, técnico, fecha).
- Recordatorios se comunican como etiquetas "en N días" con alerta visual suave.

### 5.7 Notificaciones (bandeja)

- Bandeja en la barra superior con icono y contador; sección "No leídas" primero; acciones: marcar leída, ir al recurso.
- La bandeja muestra tipo de evento, fecha y recurso; cada notificación lleva a su detalle.
- Las notificaciones de pago muestran monto y vencimiento con formato financiero.

### 5.8 Exclusividad de ocupación — selección de inmuebles con estados restringidos

Se usa al crear/editar un **contrato de arrendamiento** o al **asignar el inmueble principal de un cliente**: un inmueble `Alquilado`/ocupado (o con contrato `Vigente`/`Mora`) **no se ofrece** como candidato.

```
[Inmueble            ▾]  ← solo Disponible / Reservado
  ┌─────────────────────────────┐
  │ Apt 3B — Disponible         │
  │ Apt 2A — Reservado          │
  │ Local C-1 — Disponible      │
  │ ──────────────────────────  │
  │ (Apt 5C — Alquilado, no     │  ← NO aparece en la lista; ver nota
  │  disponible)                │
  └─────────────────────────────┘
```

Reglas:
- **Frontend (UX):** la lista desplegable filtra a `Disponible`/`Reservado`; texto de ayuda debajo del campo: *"Solo se muestran inmuebles disponibles o reservados."* Si el usuario escribe/selecciona una opción que dejó de ser candidata, se muestra error en línea *"La unidad seleccionada no está disponible."*.
- **Backend (seguridad, RN-S01):** el endpoint **re-valida** el estado del inmueble al guardar (defensa en profundidad). El filtro del frontend **nunca es la frontera de seguridad**: dos operadores pudieron ver el mismo `Disponible`, pero solo el primero crea el contrato; el segundo obtiene `409/422` *"La unidad fue ocupada mientras completabas el contrato."*.
- Para **dejar visible** una unidad no candidata con su razón (casos de revisión), usar la variante de opción **deshabilitada con nota emergente** (§6.21): *"Alquilada — contrato ARR-2026-041 vigente"*.
- Preferencia de implementación: opciones **removidas** en combos de alta para no invitar errores; opciones **deshabilitadas con motivo** en tablas de listado/ficha donde contextualiza el estado de la unidad.

### 5.9 Cambio de estado gestionado (Activar / Desactivar cliente — y estados gestionados equivalentes)

Cambiar un estado **gestionado** (ej. Cliente `Activo ↔ Inactivo`) es una acción con efecto y consecuencias legales/financieras (bloquea contratos nuevos, incidencias, portales), por lo que **siempre** usa un diálogo de confirmación explícito (nunca un interruptor inmediato):

```
Listado Clientes — fila ⋮ → "Cambiar estado"
┌───────────────────────────────────────────────┐
│ Cambiar estado del cliente                    │
│ Cliente: Ana Rodríguez · Inquilino · 🟢 Activo │
│                                               │
│ ⚠ Al desactivar:                              │
│   • No podrá firmar contratos nuevos.         │
│   • No podrá reportar incidencias.            │
│   • Los contratos vigentes continúan hasta    │
│     su término (FL-CLI-03).                   │
│                                               │
│ El backend valida que no existan recibos      │
│ pendientes (RD-CLI-07).                       │
│ [Cancelar]            [Desactivar cliente]    │
└───────────────────────────────────────────────┘
```

Reglas:
- Solo visible si el rol tiene `clientes.estado.cambiar` (permiso dedicado **[P]**).
- **Menú de fila (⋮) → "Cambiar estado"** (no icono `trash`): separa la semántica "cambio de estado" de "eliminar" (`clientes.delete`).
- Diálogo con variante según transición: desactivación → `danger` con advertencia; reactivación → `info/success` con mensaje positivo y validación derivada.
- El **backend** repite la validación de RD-CLI-07 (recibos pendientes/contratos activos) y devuelve `409/422` con mensaje claro si el cliente tiene candados: *"No se puede desactivar: el cliente tiene N contrato(s) activos y M recibo(s) por cobrar. Salda los recibos o finaliza los contratos antes de desactivar."* — RN-S01 (el frontend solo controla UX).
- Después de la transición: aviso breve de éxito y **auditoría** (quién, cuándo, de qué a qué estado, motivo si aplica).

---

## 6. Catálogo de componentes

> Convenciones: estados estándar = `normal / al pasar el cursor / foco visible / activo / deshabilitado / carga / error`. Todos los componentes respetan tokens y accesibilidad de la sección 10. Donde aplica se indica el mapeo con MudBlazor.

### 6.1 Botón

- **Variantes:** `principal` (fondo marca, texto inverso), `secundario` (fondo blanco, borde fino), `fantasma` (sin fondo, texto), `peligro` (fondo danger, texto blanco), `enlace`.
- **Tamaños:** `sm` 28px, `md` 36px (por defecto), `lg` 44px.
- **Tipos:** etiqueta + icono opcional (icono a la izquierda); **botón de icono** cuadrado 36px con icono 20px.
- **Botón de icono en filas de tabla (`⋮`):** variante *fantasma* explícita: `background:transparent`, `border:1px solid transparent` (o borde transparente), `color:text-secondary`, radio `radius-md`. **Nunca heredar el borde/fondo por defecto del `<button>` del navegador** (produce recuadro gris/borde negro en HTML sin framework). Hover: `bg-subtle` + `text-primary` (≤150ms). Objetivo táctil **≥44px** (área de clic), visual 36px con icono 20px centrado; el área extra se logra con `padding`/`min-width`/`min-height`, no con el borde.
- **Estados:** al pasar el cursor = marca más fuerte; presionado = marca activa; deshabilitado = fondo `bg-disabled` + texto `text-disabled`; carga = rueda pequeña + etiqueta (sin cambio de ancho).
- **Foco:** anillo 2px `border-focus` offset 2px; en el botón de fila el foco visible **incluye** el área táctil completa (no solo el icono).
- Regla: **una acción principal por pantalla**; en diálogos, el botón principal está a la derecha, el secundario a la izquierda.
- MudBlazor: `MudButton Variant=Field` + clases custom; override de `Palette.Light.AppbarBackground` en theme.

### 6.2 Etiqueta de estado / Contador

- Muestra **icono + texto** (nunca color solo).
- Variantes semánticas: éxito, advertencia, peligro, información, neutro (mayúsculas de estado: `PAGADO`, `EN MORA`, `CERRADO`, `BORRADOR`).
- Tamaño: altura 22px, texto 12px/600; fondo suave + borde.
- Uso de estados típicos:

| Dominio | Posibles etiquetas |
|---|---|
| Cliente | Activo, Inactivo, En mora (derivado) |
| Inmueble | Disponible, En proceso, Alquilado/Ocupado, En mantenimiento, Suspendido, Pendiente de entrega |
| Incidencia | Reportada, En evaluación, Asignada, Presupuesto, En ejecución, Cerrada, Cancelada |
| Recibo | Emitido, Parcial, Pagado, Vencido, Anulado |
| Electrodoméstico | Instalado, En reparación, De baja |
| Asiento | Borrador, Por aprobar, Aprobado, Revertido |
| Período contable | Abierto, En cierre, Cerrado, Reabierto |
| Notificación | Leída / No leída |

- MudBlazor: `MudChip` con colores custom por token.

### 6.3 Campo de texto, Lista desplegable, Área de texto

- Altura 36px, borde 1px `border-default`, radio 6px, fondo blanco; foco: borde `border-focus` + halo suave (`focus-ring`, 3px).
- **Etiqueta siempre visible** (12–13px, 500) arriba del campo; texto de ayuda debajo; error con icono + mensaje rojo (4.5:1).
- El texto de marcador usa `text-placeholder` (#697486) que cumple AA. Campos deshabilitados: fondo `bg-disabled`, texto `text-disabled`.
- **Lista desplegable:** flecha nativa/vectorial; opciones con las que se confirma la selección; con búsqueda para listas ≥ 10.
- **Cédula/RUC con máscara:** formato local (`#-###-####` cédula, `#-######-#-#-######` RUC).
- **Campo de dinero:** prefijo `B/.`, separador de miles, 2 decimales, acepta coma/punto decimal, cifras de ancho fijo.
- **Selector de fecha:** calendario simple, no es campo libre; rango en filtros con selector de periodo. Siempre muestra y valida con el formato único `DD/MM/YYYY` (regla §2.2).
- **Autocompletar** para persona/inmueble/proveedor (búsqueda asíncrona, mínimo 3 caracteres).

### 6.4 Casilla de verificación / Opción / Interruptor

- Casilla: 16px, fondo marca cuando está marcada; grupos con etiqueta agrupada (`fieldset/legend` para roles).
- Interruptor para preferencias/banderas de funcionalidad; estado activado = fondo marca.
- En tablas, casilla de selección en la primera columna + casilla "todos" en el encabezado con estado indeterminado.

### 6.5 Tabla de datos (columna vertebral del Admin)

- **Densidad:** normal filas 44px; `compacta` 36px para tablas extensas (contabilidad).
- Fila: al pasar el cursor `bg-hover`; fila seleccionada `bg-subtle` + borde izquierdo marca de 2px; **sin** cebra por defecto (formal), opcional sutil en tablas grandes.
- Encabezado: texto 12px/600 (etiqueta en mayúsculas), fondo `bg-subtle`, borde inferior fino. Celdas numéricas/monetarias alineadas a la derecha con cifras de ancho fijo.
- Orden: clic en el encabezado cambia `ascendente/descendente/sin orden` con `aria-sort`; icono flecha.
- Paginación: controles de página (‹ ›), selector de tamaño `25/50/100`, total `1–50 de 387`. Pie de página fijo opcional.
- **Acciones en lote:** con filas seleccionadas aparece una barra de acciones (exportar, registrar pago, enviar recordatorio, eliminar — siempre con confirmación). Evita editar fila por fila en picos de fin de mes (recomendación del motor).
- Menú de fila `⋮`: botón de icono **fantasma** sin borde del navegador (ver §6.1), objetivo táctil ≥44px, `aria-haspopup="true"`/`aria-expanded`, alineado a la derecha de la fila; abre lista desplegable que **no se corta** dentro de la tabla (z-index/render en capa superpuesta, §6.22). Las acciones mostradas dependen del permiso del rol (RN-S01 siempre valida en backend); el item **"Cambiar estado"** de Cliente usa `clientes.estado.cambiar` (§5.9).
- **Densidad de datos en contabilidad:** filas de 36px, columnas: Fecha | Folio (mono) | Descripción | Cuenta (mono) | Débito | Crédito | Estado — montos alineados a la derecha. En <Md esta tabla se convierte en lista de asiento + detalle expandible (§9).
- MudBlazor: `MudTable` con `MudTableColumn` custom y tema de densidad.

### 6.6 Filtros (barra de filtros / panel de filtros)

- Barra de filtros sobre la tabla; al activar >2 filtros, colapsar a etiquetas.
- Panel de filtros (panel deslizante derecho 360px) con campos tipados: estado, tipo, rango de canon, fechas, ubicación, habitaciones.
- Botón "Limpiar" restablece; los filtros activos son etiquetas removibles.

### 6.7 Tarjeta / Panel

- Fondo `bg-content`, borde fino `border-subtle`, radio 8px, sombra suave; padding 16px. En pantallas pequeñas la tarjeta nunca se encoge ni desborda: los textos fluyen (`word-wrap`) y la altura es libre.
- **Tarjeta de sección:** encabezado con `title-sm` + acciones de esquina.
- **Tarjeta de indicador (KPI):** etiqueta superior (ej: "Ingresos del mes"), valor `title-lg` en cifras de ancho fijo, variación opcional (flecha ↑↓ + color semántico + nota textual), área de mini-gráfico opcional, con clic opcional a detalle.
- **Cuadrícula de indicadores (responsiva, sin desplazamiento horizontal):** `display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px`. Las columnas dependen del ancho disponible: **≥1280px → 4 · ≥960px → 3 · ≥600px → 2 · <600px → 1**. **Nunca se fija a 4 columnas a ciegas** ni se fuerza un `min-width` que desborde: si la tarjeta no cabe, baja de fila.
- **Otras grillas de tarjetas** (tuplas pequeñas como parámetros de contrato): `repeat(auto-fit, minmax(180px, 1fr))`, misma regla de ajuste automático.
- **Regla absoluta:** ningún diseño de tarjetas genera desplazamiento horizontal; si el ancho no alcanza, se reduce el número de columnas, no se desborda el contenido.

### 6.8 Pestañas

- Variante **con borde**: pestaña activa con subrayado marca (3px) + texto 600; inactivas texto `text-secondary`.
- En móvil, desplazamiento horizontal con ajuste.
- **Pestañas con contador** (ej: "Incidencias (3)") solo cuando el número aporta.

### 6.9 Diálogo / Ventana de diálogo

- Z `z-modal`; fondo oscurecido `scrim` (neutro-950 al 45%); radio 12px; sombra fuerte; ancho 480 / 640 / 860 según contenido.
- Encabezado: título 16px/600 + botón cerrar (icono X, aria-label); **foco inicial** dentro del diálogo; **foco atrapado**; Esc cierra (si no bloquea).
- Cuerpo con desplazamiento interno si excede 75% de la pantalla.
- Pie: acciones alineadas a la derecha; botón principal = acción confirmada; peligro usa variante de peligro con doble confirmación cuando es irreversible.
- Al abrir: fondo inerte (`aria-hidden` + sin tabulación). **Móvil: panel inferior** (abajo, radio arriba 12px).
- **Diálogo de confirmación de cambio de estado (clientes y estados gestionados):**
  - Contenido: nombre del cliente, estado actual (etiqueta), y lista de **consecuencias** (p.ej. "No podrá firmar contratos nuevos", "Los contratos vigentes continúan hasta su término", "El portal inquilino queda sin ingreso" si aplica). Variante `danger` si desactiva, `info/success` si reactiva.
  - Botón primario con la **acción concreta** ("Desactivar cliente" / "Reactivar cliente"), no "Aceptar".
  - Si el backend rechaza por candados (RD-CLI-07), se muestra el error **dentro del diálogo** (no aviso breve fugaz): advertencia con el detalle y permanece el botón primario deshabilitado o navegación a "Ver recibos pendientes".
  - Para operaciones irreversibles se usa **doble confirmación** (§6.9 base) con casilla de verificación explícita ("Entiendo que…").

### 6.10 Panel deslizante (lateral)

- Anchos: 360 (acciones/filtros), 480 (detalle), 720 (edición compleja). Z `z-drawer`.
- Fondo oscurecido; cierre con Esc/backdrop; foco regresa al elemento que lo abrió.
- Usado para: edición rápida, detalle maestro-detalle, filtros, historial lateral.

### 6.11 Aviso breve / Notificación

- Apila arriba a la derecha, ancho 360; z `z-toast`; cierre automático 4–6s (éxito/información), 8s error (sin auto en errores críticos).
- Variantes semánticas (icono + color + texto): éxito / error / advertencia / información. `role=status` para éxito, `role=alert` para error.
- Debe haber modo de cerrar manual e historial (bandeja de notificaciones).

### 6.12 Alerta / Aviso destacado

- Contextual en página: variantes semánticas, icono + título + descripción + acción opcional.
- Usos: aviso de bloqueo de período, advertencia de bandera de funcionalidad deshabilitada, aviso "modo solo lectura", avisos de validación de cierre.
- No desaparece automáticamente (a diferencia de los avisos breves).

### 6.13 Estado vacío

- Icono en círculo `bg-subtle` 48px, título 16px/600, descripción `text-secondary`, botón principal opcional.
- Mensajes por recurso (ej: "Aún no hay clientes registrados — crea el primero").
- **Nunca** una tabla vacía sin contexto: siempre explicar (búsqueda sin resultados vs. sin datos).

### 6.14 Estado de carga (esqueleto)

- Esqueleto que mide 1:1 como el diseño final (bloques con brillo sutil neutro-100 → neutro-200).
- Botones en estado de carga muestran rueda pequeña sin cambiar el ancho.
- **Sin ruedas de carga a pantalla completa** para operaciones de página: esqueleto por sección (sección 7).
- Límite UX: cualquier espera >800ms muestra esqueleto; >2s muestra indicador de progreso con acción (cancelar) para operaciones largas (cierres).
- Semántica de carga: `aria-busy="true"` en el contenedor mientras se carga; para operaciones <300ms no mostrar ningún indicador (evita parpadeo).

### 6.15 Estado de error

- Icono alerta, título (ej: "No se pudo cargar los asientos"), descripción técnica legible + `trace_id` (mono-xs, no expone internos), botones: Reintentar / Volver.
- El error nunca deja la pantalla a medias: se ofrece estado por sección con respaldo.

### 6.16 Paginación

- En tablas y listas largas; muestra `1–50 de 387`; botones ‹ › + página activa; selector tamaño por página; atajos de teclado donde aplique.
- **Evitar** "cargar más" infinito en tablas de datos maestros (contabilidad necesita paginación predecible).

### 6.17 Protección de pantalla / Guardia de permiso

- Vista "Sin permiso": icono candado, texto "Tu rol actual no incluye el permiso X", botón "Volver al inicio". No mostrar contenido de fondo (evita fuga de información visual).
- Región solo lectura (vista permisos `*.read`): barra de acciones se desactiva con nota.

### 6.18 Línea de tiempo (historial)

- Línea vertical con puntos semánticos + fecha `text-xs` + evento + autor + recurso vinculado.
- Usos: historial de persona, historial de inmueble, historial de incidencia, auditoría.

### 6.19 Calendario / Agenda

- Componente de calendario mensual (táctil primero), vista agenda; eventos con color semántico **+ etiqueta**; estilo formal (celdas con borde fino, hoy con anillo marca).

### 6.20 Pasos (asistente)

- Pasos numerados con estado `completado (✓) / activo / pendiente / error`; usado en el asistente de cierre y en los pasos de registro de pago/liquidación.
- Mostrar siempre el texto "Paso N de M" y, si el paso puede durar >2s, una barra de progreso con la fase actual (el motor marca como severidad media no indicar progreso en procesos multi-paso).

### 6.21 Nota emergente (al pasar el cursor)

- Texto corto al pasar el cursor o al recibir foco; aparición 0–200ms; sin datos sensibles; en móvil usar pista en línea (no nota emergente al pasar el cursor).

### 6.22 Menú / Lista desplegable / Menú contextual

- Para acciones de fila o cortes; z `z-modal`-ish (>= panel deslizante, dentro de tabla se renderiza en capa superpuesta para no recortarse); ancho según contenido; separador para acciones destructivas; elemento deshabilitado con nota emergente del motivo.
- Especificación del **menú de fila de tabla**:
  - Disparador: botón de icono `⋮` fantasma (sin borde heredado del navegador, §6.1), `aria-haspopup="true"`, `aria-expanded` sincronizado.
  - Contenido: lista de `<button>`/`<li>` con icono + etiqueta (nunca solo icono); acciones sensibles (p.ej. "Desactivar", "Anular") en bloque **separado** con estilo `text-danger`.
  - El item **"Cambiar estado"** de Clientes solo se muestra con `clientes.estado.cambiar` (ver §5.9); la acción destructiva "Desactivar/eliminar" solo con `clientes.delete`.
  - Navegación por teclado: flechas ↑/↓, `Home/End`, `Enter` ejecuta, `Esc` cierra y devuelve foco al botón `⋮`; clic fuera cierra.
  - Posicionamiento: esquina del botón hacia abajo-derecha; si no cabe en viewport, se abre hacia arriba o se invierte.
  - Fondos/tokens: `bg-content`, borde `border-subtle`, radio `radius-lg`, sombra `shadow-lg`, padding `sp-1`.
- MudBlazor: `MudMenu` con `Dense`, `ActivatorClass="btn-icon-row"` y `Class="row-menu"`.

### 6.23 Búsqueda global

- En la barra superior: panel de resultados con agrupación por tipo (Clientes, Inmuebles, Contratos, Folios/Recibos); buscador asíncrono con mínimo 3 caracteres; navegación con teclado (flechas + Enter); atajo `/`.

### 6.24 Comprobante de pago (PDF / vista)

- Diseño formal de documento (ver esquema 8.11): encabezado con nombre de la empresa + RUC, folio mono, datos del inquilino, detalle periódico, montos en grilla derecha, QR/hash de integridad, nota legal "Comprobante generado electrónicamente".
- En pantalla: vista previa + botón Descargar (URL firmada).

### 6.25 Grupo de formulario

- Agrupa etiqueta + campo + texto de ayuda + error + indicador de obligatorio; usa `aria-describedby`; error con `role=alert` y `aria-invalid`.
- Resumen de errores al enviar el formulario: se coloca arriba del formulario, recibe foco (`tabindex="-1"`), enlaza cada ítem al campo inválido y NO reemplaza los errores en línea. Patrón validado (severidad alta): `role="alert"` + enlaces `href="#campo"`, foco movido al resumen tras un envío fallido (no en cada salida de campo).

### 6.26 Avatar

- Iniciales 32/40px, fondo `scaffold-bg` texto blanco (formal); foto opcional; en ficha 64px.

### 6.27 Indicador de progreso / Etiqueta de estado de proceso

- Para procesos largos (cierre, conciliación, generación de recibos): barra de progreso + porcentaje + fase actual + "cancelar" si aplica; al terminar, resultado.

### 6.28 Encabezado de informe / barra de exportación

- Acción "Exportar": menú con PDF / Excel / CSV; acorde con permiso (`contabilidad.estados-financieros.ver`, `reportes.ver`).
- Encabezado de informe: fuente de datos (período), fecha de emisión, filtros aplicados, usuario/firma del CPA si aplica.

### 6.29 Zona de carga / Adjuntar documento (upload)

Usado para: contrato firmado obligatorio en el asistente (§5.4, RF-CON-07), documentos de la ficha del cliente e inmueble (§8.5/§8.6, CU-CLI-07).

- **Estados:** reposo → arrastre/inserción → validando → cargado; error (descripción) → sección interrumpible.
- **Reposo:** área punteada `border: 1.5px dashed var(--border)` con `background: var(--bg-subtle)`; icono adjuntar (24px) + texto primario "Subir contrato firmado" + texto secundario "PDF, JPG o PNG · máx. 10 MB".
- **Única vs. múltiple:** contrato firmado = archivo único → chip de archivo seleccionado (nombre + tamaño + botón remover). Documentos de ficha = múltiple → lista de chips con "Cargado" ✓.
- **Feedback:** mientras valida → spinner en chip; al cargar → chip `success` con icono de verificación; al errar → chip `error` con descripción en texto secundario dentro del área ("El archivo supera 10 MB").
- **Accesibilidad:** `role="button"`/`tabindex="0"` + teclado (Enter/Espacio abre selector); `aria-label` = "Subir documento — formatos PDF, JPG o PNG, tamaño máximo 10 MB"; anuncio de estado con `aria-live="polite"` ("contrato-firmado.pdf cargado").
- **Accesible por teclado:** además del área, siempre un botón visible "Seleccionar archivo" para apertura sin drag.
- **Obligatorio vs. opcional:** el asistente marca el paso `Requerido` (asterisco rojo + nota "Sin este archivo no se puede guardar el contrato"); el botón de guardado queda deshabilitado hasta completarlo (el backend revalida, RN-S01).
- **Tokens:** `bg-subtle`, `border`, `radius-lg`, `text-secondary`, `text-success`, `text-error`, `sp-2/3`, typo 14px.

### 6.30 Pestaña "Documentos" en fichas (listado + descarga)

Usado en: ficha de contrato (foco en RF-CON-07), ficha de persona/cliente (§8.5), ficha de inmueble (§8.6).

- **Estructura:** listado de documentos (icono tipo + nombre + tamaño + fecha de subida + origen cuando aplica + badge de versión si existe) con acciones: descargar (icono ↓) y, según permiso, subir/remover.
- **Origen de datos:** cada ítem indica procedencia — `Cliente · subido por M. García (12/09/2026)` o `Contrato ARR-2026-041 · contrato firmado`.
- **Descarga:** pide **URL firmada** al BFF (nunca expone ruta interna); si caduca, se regenera en el momento. Mantiene `aria-label` "Descargar <nombre del archivo>".
- **Subida adicional:** botón primario o ghost "+ Subir documento" abre la zona de carga (§6.29); permiso gobernado por `clientes.documentos.gestionar` (cliente) o `contratos.create` (contrato firmado).
- **Vacío (sin documentos):** estado vacío con icono + "Sin documentos" + acción de subir si hay permiso.
- **Móvil:** listado se convierte en filas apiladas (icono + nombre + tamaño + acciones); el área táctil de descargar ≥44px.

---

## 7. Estados de interfaz (sistema completo)

| Estado | Componentes | Comportamiento |
|---|---|---|
| **Carga** | Esqueleto por sección | Tabla: esqueleto de 5 filas; KPIs: tarjetas en esqueleto; formularios: campos en esqueleto. Opcional franja fina global en la barra superior. |
| **Vacío** | Estado vacío | Mensaje por contexto + acción de llamado. Nunca "0 registros" pelado. |
| **Error** | Estado de error / Aviso breve / Alerta | Pantalla completa (error fatal) vs. en línea por sección (error parcial) vs. aviso breve (error de acción). Siempre incluye `trace_id`. |
| **Éxito** | Aviso breve de éxito | Confirmación de acciones mutables (guardado, pago, aprobación). |
| **Sin permiso** | Guardia de permiso | Ruta protegida sin permiso → vista "Sin permiso" (no 403 en blanco). |
| **Sin conexión / tiempo agotado** | Estado de error + Reintentar | Para llamadas API: mensaje + reintento con espera progresiva. |
| **Confirmación** | Diálogo de confirmación | Para acciones destructivas/irreversibles: pago anulado, aprobación, cierre, reapertura, eliminación. |

**Mapeo HTTP → interfaz:**

| HTTP | Interfaz |
|---|---|
| 400 | Aviso breve de error + resaltar campos en formulario (mensaje del RFC7807) |
| 401 | Redirigir a inicio de sesión (portal correspondiente) con mensaje "Tu sesión expiró" |
| 403 | Guardia de permiso en página / acción deshabilitada |
| 404 | Estado de error por sección ("El recurso ya no existe") |
| 409 | Diálogo de conflicto con opciones (refrescar con cambios; recargar y perder lo local) |
| 429 | Aviso breve + estimación de espera (`Retry-After`) |
| 500 / 503 | Estado de error con trace_id + opciones |

---

## 8. Esquemas ASCII (planos por pantalla)

> Dimensiones de referencia: Admin y portales del tablero lg≥1280 (barra lateral 256px); portal móvil 390px. La numeración permite trazabilidad.

### 8.1 Inicio de sesión (Admin y portales)

```
┌──────────────────────────────────────────────────────────────────┐
│ ▓ LOGO 64px                            Plataforma · Panamá       │
├──────────────────────────────────────────────────────────────────┤
│                          ╔══════════════════════╗                │
│                          ║  Iniciar sesión      ║                │
│                          ║                      ║                │
│                          ║  Correo electrónico  ║                │
│                          ║  ┌────────────────┐  ║                │
│                          ║  │                │  ║                │
│                          ║  └────────────────┘  ║                │
│                          ║                      ║                │
│                          ║  Contraseña          ║                │
│                          ║  ┌────────────────┐  ║                │
│                          ║  │          ╺┿╸    │  ║                │
│                          ║  └────────────────┘  ║                │
│                          ║  ☐ Mantener sesión    ║                │
│                          ║                      ║                │
│                          ║  ┌────────────────┐  ║                │
│                          ║  │   Ingresar     │  ║   ← btn primary │
│                          ║  └────────────────┘  ║                │
│                          ║  ¿Olvidaste tu       ║                │
│                          ║   contraseña?        ║                │
│                          ╚══════════════════════╝                │
│   © 2026 Empresa · Términos · Privacidad                         │
└──────────────────────────────────────────────────────────────────┘
```

Notas: formulario centrado 400px, sin fondo decorativo; mensajes de error en línea bajo cada campo + resumen arriba ("X campos requieren atención"); foco visible; `autocomplete` correcto (email/current-password); en móvil el formulario ocupa 100% con padding 24.

### 8.2 Marco de aplicación Admin

```
┌────────────┬─────────────────────────────────────────────────────┐
│ ▓ LOGO     │ 🔍 Buscar cliente, inmueble, folio…  [🔔 3][?][▣ A] │
│            ├─────────────────────────────────────────────────────┤
│            │ Inicio › Contabilidad › Asientos                    │
│ ┌────────┐ │                                                     │
│ │Resumen  ││  Asientos                          [+ Nuevo asiento]│
│ │Clientes ││                                                     │
│ │▸Inmuebles││  ┌━ Panel de filtros (colapsable) ──────────────┐  │
│ │Contratos││  │ [Período][Estado][Tipo][Buscar]  [Limpiar]    │  │
│ │Cobros   ││  └──────────────────────────────────────────────┘  │
│ │▸Incidencias││                                                  │
│ │L.blanca ││  ┌─────────────────────────────────────────────┐  │
│ │▸Contab. ││  │ Fecha│Folio│Descripción│Cuenta│Débito│Crédito│  │
│ │▸Reportes││  │ 01/09│A-001│Alquiler    │1110  │50.00 │       │  │
│ │Admin    ││  └─────────────────────────────────────────────┘  │
│ └────────┘│  1–25 de 143  [‹][1][2][3][›]                       │
└───────────┴─────────────────────────────────────────────────────┘
```

### 8.3 Tablero Resumen (Admin)

```
[ Resumen                        Período: Septiembre 2026 ▾  ]
┌────────────┬────────────┬────────────┬────────────┐
│ INGRESOS   │ PAGO ESP.  │ EN MORA    │ OCUPACIÓN  │
│ B/. 84,230 │ B/. 2,410  │ 8          │ 96%        │
│ +6.2% ▲    │ 3 recibos  │ B/. 5,780  │ 387/403    │
└────────────┴────────────┴────────────┴────────────┘
┌───────────────────────────────┬──────────────────────────────┐
│ Cobros 12 meses          (▲)  │ Tareas de hoy                │
│ [gráfica de líneas/barras    ] │ [x] Cierre mensual pendiente│
│                               │ [o] 3 visitas programadas    │
│                               │ [o] 2 incidencias sin asignar│
└───────────────────────────────┴──────────────────────────────┘
```

**Tablero adaptativo por permisos (§4.2):** cada grupo del tablero exige su permiso. Si el rol no lo tiene, el grupo **no se renderiza** (evita fuga visual de datos) y los botones de acción se ocultan:

| Grupo del tablero | Permiso requerido |
|---|---|
| KPIs Ingresos / Pagos esperados / En mora | `cobros.*`, `liquidaciones.*`, `contabilidad.*` o `estados-financieros.ver` |
| Gráfica "Cobros 12 meses" | Igual que el grupo financiero |
| KPI Ocupación + "Ocupación por tipo" | `inmuebles.read` |
| Tarjetas Incidencias abiertas / Próximas visitas | `incidencias.*` |
| Tarea "Cierre mensual" | `contabilidad.cierres.*` o `conciliacion` |
| Tarea MORA | `cobros.mora.consultar`, `cobros.*` o `liquidaciones.*` |
| Botón "Generar recibos" | `cobros.recibos.generar` |

Si el rol no tiene ningún grupo permitido se muestra un **dashboard mínimo de bienvenida** (sin datos) + CTA a sus módulos (§6.17 evita el "403 blanco"). Un rol con `clientes.read`/`inmuebles.read`/`reportes.ver` (ej. "Solo lectura") **no** debe ver el resumen contable ni los KPIs de cobros.

**Responsive de la fila de KPIs (regla clara):** la cuadrícula usa `repeat(auto-fit, minmax(220px, 1fr))` — 4 tarjetas en ≥1280px, 3 en ≥960px, 2 en ≥600px, 1 en <600px. **El tablero nunca genera desplazamiento horizontal:** si el ancho disponible no admite otra columna, las tarjetas saltan de fila en lugar de desbordar (§6.7 y §9).

### 8.4 Listado Clientes (patrón lista base)

```
[ Clientes                              [+ Nuevo cliente] ]
[ Buscar nombre o cédula… ][Filtros][Cols][Exportar]
Chips: [Tipo: Propietario ×][Ciudad: Panamá ×]
┌───────────────────────────────────────────────────────────────┐
│ ☐ │ Nombre              │ Tipo      │ Cédula      │ Teléfono│ ⋮│
│ ☐ │ Ana Rodríguez       │ Ambos     │ 8-123-456   │ +507…  │ ⋮│
│ ☐ │ Pedro Martínez      │ Inquilino │ 4-987-654   │ +507…  │ ⋮│
│ ☐ │ María Vega          │ Propiet.  │ PE-123456   │ +507…  │ ⋮│
└───────────────────────────────────────────────────────────────┘
1–25 de 684   [‹][1][2][3][4][5]…[28][›]
```

El botón `⋮` es un **botón de icono fantasma** (sin borde heredado del navegador, objetivo táctil 44px; §6.1/§6.5). Al abrir, el menú muestra (según permisos):

```
Ver ficha                    👤  (clientes.read)
Editar                       ✏️  (clientes.update)
Exportar ficha               ⬇  (clientes.read)
──────────────────────────────  separador
Cambiar estado               🔄  (clientes.estado.cambiar [P])
Desactivar cliente           🗑  (clientes.delete) → bloque destructivo
```

Nota: "Cambiar estado" conduce al diálogo de §5.9; el backend valida candados (RD-CLI-07). En móvil (<Md) la columna `⋮` se mantiene en cada tarjeta de cliente con el mismo menú (§9).

### 8.5 Ficha Persona (master-detail)

```
[ Foto ] Ana Rodríguez         [ 🟢 Inquilino activo ]  [Editar][⋮]
         Cédula 8-123-456 · ana@correo.com · +507 0000-0000
         Ocupación: Ingeniera · Empresa XYZ

[ Datos ][ Contactos ][ Laboral ][ Documentos ][ Bancarios ][ Historial ]
─────────────────────────────────────────────────────────────────────
  DATOS PERSONALES                     INMUEBLES / CONTRATOS
  Fecha nacimiento  12/04/1990         Apartamento 3B — Alquilado
  Estado civil      Soltera            Canon B/. 900.00 · vence 30/09
  Nacionalidad      Panameña           Contrato ARR-2026-041 (desde
  Notas             (observaciones)      01/03/2026)

  DOCUMENTOS
  Origen: Cliente        Origen: Contrato
  [📄 Cédula]            [📄 Contrato firmado
  [📄 Contrato laboral]    ARR-2026-041]
  [+ Subir documento]      (PDF · 2.1 MB · 12/09/2026)
```

### 8.6 Ficha Inmueble

```
[ Imagen principal ] Apt. 3B — Torres del Mar    [ 🟢 Alquilado ]
  Torre 2 · Piso 3 · Panamá, Vía Argentina       [Editar][⋮]
  ───────────────────────────────────────────────
  RESUMEN:  94 m² · 2 hab · 2 baños · 1 parqueo · Amueblado
  Servicios: A/C, agua, internet · Antigüedad: 5 años

[ Datos ][ Atributos ][ Fotos ][ Documentos ][ Línea blanca ][ Historial ]
  ┌──────────────────────────────────────────────────────────┐
  │ Electrodomésticos instalados                             │
  │ A/C marca X (2024) · Últ. manto: 12/07/2026 · en plan    │
  │ Nevera marca Y (2021) · Últ. manto: 03/03/2026           │
  └──────────────────────────────────────────────────────────┘
```

### 8.7 Editor de Asiento (partida doble)

```
[ Nuevo asiento                              [Guardar borrador][Aprobar]]
 Período: Septiembre 2026 ▾   Fecha: 10/09/2026   Tipo: [Manual]   Folio: (auto)
 Descripción: Pago de alquiler — Apt 3B

 ┌─────────────────────────────────────────────────────┐
 │ Cuenta (buscar)         │  Centro costo│ Débito │Crédito│
 │ 1110 Banco              │    3B        │ 900.00 │       │
 │ 4101 Ingresos arrend.   │    3B        │        │ 900.00│
 │ (+ agregar línea)                        SUMAS   900.00 900.00 ✓
 └─────────────────────────────────────────────────────┘
 Validación: débitos = créditos ✓ (verde, check)
 Errores      : ✗ (paneles de error por línea)
```

### 8.8 Cierre contable — configuración y ejecución

```
[ Cierres contables                     [+ Nuevo tipo de cierre] ]
┌──────────────────────────────────────────────────────────────┐
│ Tipos de cierre                                              │
│ ▸ Mensual (día 28)  · bloqueo auto  · EF: Sí                 │
│ ▸ Anual  (31 dic)   · asiento cierre · EF: Sí                │
│ ▸ Diario (fin día)  · caja           · EF: No                │
├──────────────────────────────────────────────────────────────┤
│ Períodos — Mensual 2026                                      │
│ Ene ✓  Feb ✓  Mar ✓  Abr ✓  May ✓  Jun ✓  Jul ✓  Ago ✓     │
│ Sep ● (En cierre)   Oct ○  Nov ○  Dic ○                      │
└──────────────────────────────────────────────────────────────┘
```

Asistente al ejecutar: Configurar (período+cortes) → Verificar (balancea, asientos sin aprobar → advertencias) → Ejecutar (confirmación irreversible) → Resultado (asientos: 14, estados financieros generados, TraceId `…`, [Descargar]).

### 8.9 Portal Inquilino — Tablero (desktop ≥960px / móvil <960px)

```
┌──────────────────────────────┐
│ ☰    Hola, María        [🔔2]│
│ ┌──────────────────────────┐ │
│ │ PRÓXIMO PAGO             │ │
│ │ B/. 900.00               │ │
│ │ vence en 5 días (30/09)  │ │
│ │      [ Pagar ahora  ]    │ │
│ └──────────────────────────┘ │
│ Incidencias abiertas: 1      │
│ Visitas programadas: 1 (jue) │
│ ┌──────────────────────────┐ │
│ │ Calendario:  ▾ Septiembre 2026  │ │
│ │  25 ● Pago 900 (3 días)  │ │
│ │  26 ● Mantenimiento A/C  │ │
│ └──────────────────────────┘ │
│ [Inicio][Calendario][Pagos][Perfil]  ← barra de navegación inferior
└──────────────────────────────────────┘
```

> **Escritorio (≥960px):** el portal adopta el marco de aplicación del Admin — barra lateral oscura (Resumen, Calendario, Pagos, Incidencias, Perfil + Sistema: Notificaciones, Cerrar sesión), barra superior con "Portal del Inquilino", campana de notificaciones y ficha de usuario con avatar, nombre, rol y salida; contenido `.content` (máx. 1500px) con ruta de navegación y título. **Móvil (<960px):** barra lateral oculta; menú hamburguesa abre panel deslizante con la misma navegación; barra de navegación inferior Inicio/Calendario/Pagos/Perfil. El portal Propietario usa el mismo marco (Resumen, Pagos, Perfil + Sistema).

### 8.10 Portal Inquilino — Registrar pago y comprobante

```
┌──────────────────────────────┐
│ Pagar alquiler               │
│ Período: Septiembre 2026     │
│ Monto: B/. 900.00            │
│ Método: [Transferencia ▾]    │
│ Referencia: ABC-123456       │
│ Comprobante: [📎 Adjuntar]   │
│        [ Registrar pago ]    │
│ ┌──────────────────────────┐ │
│ │ ✅ Pago registrado       │ │
│ │ Comprobante CRE-2026-0147│ │
│ │        [ Descargar PDF ] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### 8.11 Comprobante de pago (PDF layout)

```
┌────────────────────────────────────────────────┐
│ NOMBRE DE LA EMPRESA          Comprobante      │
│ RUC 000000000000    Tel +507 0000-0000         │
│ ────────────────────────────────────────────── │
│ FOLIO: REC-2026-0147   (mono, tabular)         │
│ Fecha emisión: 10/09/2026                      │
│ ────────────────────────────────────────────── │
│ Inquilino: Ana Rodríguez                       │
│ Cédula: 8-123-456                              │
│ Inmueble: Apt 3B — Torres del Mar              │
│ ───────────────────────────┬────────────────── │
│ Alquiler Septiembre 2026   │ B/.   900.00      │
│ ITBMS 0% (exento)          │ B/.     0.00      │
│                            ├────────────────── │
│ TOTAL                      │ B/.   900.00      │
│ ───────────────────────────┴────────────────── │
│ Método: Transferencia · Ref ABC-123456         │
│ Hash de integridad: 7F93…                      │
│ Generado electrónicamente — no requiere firma  │
└────────────────────────────────────────────────┘
```

### 8.12 Filtro/mora (Cobros)

```
[ Cobros — Recibos                          [+ Generar recibos] ]
[ Período Septiembre 2026 ▾][ Estado: Todos ▾][Buscar folio…]
┌─────────────────────────────────────────────────────────────┐
│ Folio       │ Inquilino │ Inmueble│ Vence  │Monto   │Estado │
│ REC-2026-001│ P. Martín │ Apt 2A  │ 30/09  │ 950.00 │ ● Pagado│
│ REC-2026-002│ A. Vega   │ Apt 3B  │ 30/09  │ 900.00 │ ● En mora│
│ …           │           │         │        │        │ ● Emitido│
└─────────────────────────────────────────────────────────────┘
Acciones fila: [Ver][Registrar pago][Enviar recordatorio][⋮(anular)]
```

---

## 9. Responsive y comportamiento por breakpoint

Breakpoints (equivalentes MudBlazor): **Xs <600 · Sm ≥600 · Md ≥960 · Lg ≥1280 · Xl ≥1920**

| Área | Estrategia |
|---|---|
| Admin | **Primero escritorio.** A <960px: barra lateral colapsada a iconos; <600px: barra lateral → panel deslizante superpuesto + barra superior compacta; tablas → tarjetas apiladas en móvil (con alternar "Tabla/Tarjetas"); filtros en panel deslizante. |
| Portales | **Tablero adaptativo.** ≥960px: barra lateral de portal (mismo marco de aplicación del Admin, scaffold oscuro, ancho 256px) + contenido máx. 1500px. <960px: barra lateral colapsa a panel deslizante (menú hamburguesa) + barra de navegación inferior (Inicio/Calendario/Pagos/Perfil); táctil ≥44px. |
| Tablero / grillas de tarjetas | `repeat(auto-fit, minmax(220px, 1fr))` para KPIs; `minmax(180px, 1fr)` para tuplas pequeñas. Columnas: 4 → 3 → 2 → 1 según breakpoint (≥1280 / ≥960 / ≥600 / <600). **Regla absoluta: ningún diseño produce desplazamiento horizontal.** Las tarjetas bajan de fila en lugar de desbordar; los textos internos fluyen. |
| Tablas | ≥Md: tabla completa (el **único** desplazamiento horizontal permitido es dentro del contenedor de la tabla, con su propia barra, nunca la página entera; sin encabezado fijo con el contenido visible y acciones en menú); <Md: convertir a tarjetas (cada fila = tarjeta con datos clave y acciones) **salvo** tablas estructurales de contabilidad (asientos) que en móvil se presentan como lista de asiento + detalle expandible. |
| Formularios | 2 columnas ≥Md; 1 columna <Md; el panel deslizante de edición a <Md se vuelve pantalla completa. |
| Diálogos | ≥Md: diálogo centrado; <Md: panel inferior. |

Regla: **no duplicar lógica de negocio en el responsive** — solo transformación de presentación.

---

## 10. Accesibilidad — WCAG 2.2 AA+ (requisito)

### 10.1 Contraste (verificado en tokens)

- Texto normal ≥ 4.5:1: `text-primary`, `text-secondary`, `text-tertiary`, `text-placeholder`, semánticos de texto.
- Texto grande / UI ≥ 3:1 (botones, iconos significativos, bordes de control).
- Estados semánticos: el texto de las etiquetas/contadores cumple AA sobre su fondo (verificación en 2.1.3).
- Dark/gráficos: series en gráficos usan `chart-*` y siempre van con label/patrón.

### 10.2 Foco y teclado

- `:focus-visible` global 2px brand + offset 2px (CSS en tokens.css).
- Todo componente interactivo navegable y operativo por teclado (Enter/Espacio/Arrows/Esc).
- Diálogos: foco atrapado (focus trap) + retorno al elemento que lo abrió; `aria-modal="true"`, `role="dialog"`.
- Tablas: header ordenable con `aria-sort`; menús de fila con `aria-haspopup`/`aria-expanded`.
- Bandeja de notificaciones y menús: `aria-expanded`, esc cierra, foco sincronizado.

### 10.3 Semántica / ARIA

- Marco de aplicación con `role=banner` (barra superior), `role=navigation` (barra lateral), `role=main` (contenido), `role=contentinfo` (pie de página).
- Landmarks por módulo (clientes, cobros, etc.) en páginas largas.
- Formularios: `label` siempre visible (borde fino en el borde del campo de entrada); `aria-label` en iconos sin texto; errores `aria-describedby` + `aria-invalid`; resumen de errores con foco al primer error.
- Componentes: aviso breve con `role=status/alert`; etiquetas de estado con texto real (no solo color); tablas con `<caption>` descriptivo y `aria-rowcount` para listas largas.
- En cabeceras fijas, añadir compensación para que el foco no quede oculto (`scroll-padding-top`).
- **Foco no oculto (WCAG 2.2 AA):** al abrir diálogo/panel deslizante, cerrar o pausar las capas superpuestas persistentes antes de mover el foco; ninguna cabecera/pie fijo debe tapar el control enfocado.

### 10.4 Motion & color

- `prefers-reduced-motion: reduce` → sin transiciones ni shimmer (implementado en tokens.css).
- **No usar color como único canal**: todo estado crítico lleva icono + texto (P5/P7).
- Flashing: respeta límites WCAG (sin parpadeo >3/s).

### 10.5 Objetivos táctiles

- Mínimo 24px en escritorio (WCAG 2.2), **≥44px recomendado y obligatorio en táctil** para botones de portal, barra de navegación inferior y **botones de acción de fila de tablas (⋮)**.
- En táctil, el área tocable del `⋮` es ≥44px aunque el icono visual sea 20px (padding compacto dentro de la celda, sin desbordar la fila); en móvil el menú de fila se preserva en cada tarjeta (§9).

### 10.6 Pruebas

Checklist antes de entregar módulo: teclado completo, contraste AA+ en todos los textos, foco visible en 100% de interacciones, `prefers-reduced-motion`, lector de pantalla (NVDA/VoiceOver) en flujos críticos (inicio de sesión, pago, cierre contable), resolución 390px y landscape.

---

## 11. Gráficos y reportes

### 11.1 Paleta de gráficos

Restringida y formal (colorblind-safe, con patrones opcionales):

| Serie | Token |
|---|---|
| Serie principal | `chart-ink` #1F2A37 |
| Serie secundaria | `chart-slate-500` #7C8694 |
| Complemento bajo | `chart-slate-300` #C0C7D1 |
| Énfasis positivo | `chart-green` #166B48 |
| Énfasis negativo/alerta | `chart-red` #B42318 |
| Informativo | `chart-blue` #2456CC |
| Advertencia | `chart-amber` #9A6B00 |

Reglas: series ≤ 7; usar **línea continua/discontinua/patrón** junto con color; ejes con `text-secondary`; leyenda con `label-caps`; **notas con datos** (mostrar los valores exactos, B/. con formato) al pasar el cursor; **sin efecto 3D**, sin gradientes, sin cuadrícula decorativa. No usar `candlestick`/OHLC (es dominio de trading): este sistema usa línea/barras (el motor los marca con accesibilidad condicional).

### 11.2 Tipos recomendados por caso

| Reporte | Tipo |
|---|---|
| Ingresos del mes (cobros ya cobrados) | Barra (día) / línea acumulada |
| Tendencia 12 meses | Línea |
| Ocupación/estados de inmuebles | Anillo (donut, con % y totales en el centro) o barras apiladas |
| Morosidad | Barra apilada por antigüedad (30/60/90+) |
| Estados financieros | Tabla de reporte (Balance en árbol) — los EF **no se grafican**, se exportan |
| Comparativo presupuesto vs real | Barras agrupadas |
| KPI vs objetivo (meta mensual de cobros, ocupación, mora objetivo) | **Gráfico de bala** por KPI (3–10 en grilla): barra de rendimiento + línea de meta; el valor y la meta se muestran como texto visible (el color es suplementario). Alternativa simple: barra + línea punteada de meta |
| Costos de mantenimiento por equipo | Barra horizontal |

Implementación genérica: Chart.js / MudBlazor `MudChart` / SVG; el dataset se colorea con los tokens de la sección 11.1.

---

## 12. Handoff e implementación (open design)

### 12.1 Prompt de recuperación jerárquica (para cualquier IA)

```
Voy a implementar la UI de la Plataforma de Administración de Inmuebles,
Portales y Contabilidad.
Lee, en este orden:
  1. docs/ui/tokens.dtcg.json   → tokens W3C DTCG (fuente de verdad).
  2. docs/ui/tokens.css         → variables CSS derivadas.
  3. docs/ui/diseno-ui-design-system.md → documentos maestro: patrones,
     componentes, esquemas, accesibilidad.
No inventes colores, tipografías ni espaciados que no existan en los tokens.
Respeta: densidad de datos, estados (carga/vacío/error/éxito), una acción
primaria por pantalla, formato monetario B/. con cifras de ancho fijo, y WCAG 2.2 AA+.
```

### 12.2 Implementación MudBlazor (stack objetivo)

1. Cargar la fuente Inter/IBM Plex Mono (Google Fonts, local para prod).
2. Configurar `MudTheme` con `PaletteLight`:
   - `Primary = brand-primary (#1B212B)` (grafito hasta recibir branding)
   - `AppbarBackground = #FFFFFF` y `DrawerBackground = #141A22` (scaffold)
   - `Surface = #FFFFFF`, `Background = #F6F7F9`
   - `TableHeader...` alineado a tokens; radios `radius-md/lg`.
3. Escribir componentes custom en `Components/` (Button, DataTableColumn, StatusChip, MoneyInput, EmptyState, SkeletonTable, PermissionGuard) mapeados a los specs de la sección 6.
4. Aplicar CSS variables globales (tokens.css) como respaldo y para estilos no cubiertos por MudBlazor (focus-visible, tabular, labels caps).
5. Área por rol (`/app`, `/portal/inquilino`, `/portal/propietario`) usando el mismo `AppShell` con layout distinto (Admin dark scaffold; portales scaffold claro u overlay móvil).

### 12.3 Migración de marca (cuando el cliente entregue logo y colores)

| Pasos |
|---|
| 1. Solicitar: logo (SVG + variantes claro/oscuro), colores primarios/secundarios, tipografía de marca si aplica (opcional). |
| 2. Reemplazar SOLO en `tokens.dtcg.json`: `brand.*` (primary/hover/active/on) y si el cliente lo pide `scaffold.*`. |
| 3. Regenerar `tokens.css` (o usar certificador de tokens). |
| 4. **Validar contraste AA+** de los nuevos colores primarios sobre blanco (textos) y del texto sobre primarios (botones). Si no pasan, definir variantes "on-brand" o fondos con suficiencia — documentado antes de aplicar. |
| 5. No se cambian los semánticos de estado (`status-*`) salvo que el cliente solicite y pasen contraste. |

> **Candidato corporativo pre-validado (motor de diseño):** si el cliente aprueba una identidad en tonos corporativos, aplicar Slate `#0F172A` como primario, `#334155` como secundario y acento Sky `#0369A1` (texto blanco sobre el acento; acento sobre blanco ≥5.5:1). Son compatibles con el resto de tokens semánticos de GRAFITO. |

### 12.4 Plan de fases (alineado al documento de arquitectura)

| Fase | Diseño a implementar |
|---|---|
| Fase 0–1 (Fundación + Núcleo) | Inicio de sesión, marco de aplicación, tabla de datos, formularios, fichas (clientes/inmuebles/contratos), cobros con recibos y comprobante PDF, tablero básico inquilino |
| Fase 2 (Operación) | Calendario, incidencias, línea blanca, notificaciones/bandeja, reportes operativos |
| Fase 3 (Contabilidad) | Plan de cuentas (árbol), editor de asientos, cierres (asistente), conciliación, impuestos, activos fijos, estados financieros exportables |
| Fase 4 (Extensión) | Portal propietario (bandera de funcionalidad), proveedores reales, adaptación branding |

---

## 13. Matriz de cobertura (requisito → diseño)

| Requisito (fuente) | Diseño que lo cubre |
|---|---|
| RF-C1..C9 (Clientes) | 8.4 listado, 8.5 ficha persona, 5.2 maestro-detalle, 6.7 tarjetas, 6.14/6.15 estados, formularios 6.3+5.3, 6.24 documentos. **v1.6:** cambio de estado `clientes.estado.cambiar` (5.9), menú de fila sin borde del navegador (6.1/6.5/8.4). **v1.7:** gestión de documentos en ficha (`clientes.documentos.gestionar`) — 6.29 zona de carga, 6.30 pestaña Documentos |
| RF-I1..I9 (Inmuebles) | 8.6 ficha inmueble, 6.5 tabla de datos atributos, 6.2 etiquetas de estado, 6.18 historial, galería de fotos (patrón 5.2). **v1.6:** exclusividad de ocupación en selector (5.8) |
| RF-CT1..CT6 (Contratos) | 6.7 tarjetas con resumen de parámetros, 5.3 formularios, 6.24 documentos PDF, 6.16 paginación. **v1.7:** carga de contrato firmado obligatorio (RF-CON-07) — asistente 5.4 paso de adjunto, zona de carga 6.29, pestaña Documentos 6.30 |
| RF-F1..F5 (Cobros/recibos) | 8.12 mora, 5.5 dinero, 6.2 etiquetas de recibo, 6.9 confirmación, 6.22 menú fila, 8.11 comprobante |
| RF-O1..O6 (Operaciones) | 6.5 tablero, 6.18 línea de tiempo, 6.19 calendario, 5.6 agenda, 6.20 asistente de visita/cierre |
| RF-N1..N5 (Notificaciones) | 5.7 bandeja, 6.11 avisos breves, 6.15 alertas, 6.19 calendario |
| RF-B1..B7 (Línea blanca) | 8.6 pestaña línea blanca, 6.2 estado, 6.18 historial mantenimiento, 5.4 informe |
| RF-CN01..17 + RN-CN* (Contabilidad) | 8.7 editor asientos, 8.8 cierres, 6.5 tabla densa, 5.4 asistente, 6.28 barra de exportación, 11.2, 6.27 indicador de progreso |
| Roles y permisos | 4.2 visibilidad, 6.17 guardia de permiso, 6.3 formularios roles, 6.22 menús |
| Responsive | Sección 9 (tablas→tarjetas, barra de navegación inferior en portales, diálogo→panel inferior) |
| Accesibilidad | Sección 10 (contraste, foco, teclado, ARIA, motion reducido, táctil) |
| Seguridad (BFF/cookies) | UX de sesión: inicio de sesión 8.1, expiración 401, "Sin permiso" 6.17 — nunca tokens en el cliente |
| Estados y errores | Sección 7 (carga/vacío/error/409/429) |

---

## 14. Riesgos de diseño y supuestos abiertos

| Riesgo / supuesto | Impacto en UI | Decisión |
|---|---|---|
| Marca no entregada | Neutralidad visual completa | Paleta grafito + semánticos de estado; migración tokenizada (§12.3) |
| Portal propietario en discusión | Menú/features invisibles | Diseñado y feature flag `features.portal-propietario`; sin costos de UI |
| Marco legal/fiscal a validar (CPA) | Textos de avisos legales, exenciones ITBMS | Approve placeholders neutrales; textos parametrizables, no hardcode |
| Tasa de cambio B/. vs USD | Formato de moneda | `B/.` como sufijo local; token de símbolo editable en configuración |
| Volumen bajo (400 inmuebles) | Sin video directo en listas | Paginación 25/50/100 y filtros suficientes |
| Users externos con móvil básico | Costo de TI | Portales responsive (dashboard ≥960px / bottom nav <960px), distancias táctiles ≥44px, sin features que exijan navegador moderno |

---

## 15. Glosario breve

**Lenguaje del negocio (evitar tecnicismos):**
- **Cobros**: la recaudación de alquileres (módulo **Cobros**); en algunos contextos se dice "cobranza", pero la UI usa **cobros**. Permisos: `cobros.*`.
- **Inquilino**: el arrendatario que alquila/vive el inmueble.
- **Propietario**: dueño del inmueble administrado.
- **En mora**: recibo/contrato/cliente con pago vencido (estado derivado, nunca manual).
- **Comprobante**: recibo de pago descargable en PDF (folio + hash de integridad).
- **Línea blanca**: electrodomésticos del inmueble (A/C, neveras, lavadoras, calentadores).

**Términos técnicos usados (con su equivalente coloquial):**
- **Scaffold** → "marco de la aplicación" (barra lateral/barra superior/encabezado).
- **Canvas** → "fondo de página" detrás de las tarjetas.
- **Tabular figures** → "cifras de ancho fijo" para números y fechas alineados.
- **Drawer** → panel lateral deslizante.
- **Bottom nav** → barra de navegación inferior (móvil).
- **Bottom sheet** → panel que sube desde abajo (móvil), en lugar de diálogo centrado.
- **Breakpoint** → punto de corte (medida donde cambia el diseño).
- **Partida doble**: débito = crédito; el editor de asientos lo verifica en vivo (§8.7).
- **Folio**: numeración contable/recibo, siempre en mono, alineada.
- **Etiqueta de estado**: píldora con icono+texto que comunica estado (nunca solo color).

---

## Anexo A — Validación con el motor de diseño (`ui-ux-pro-max`)

GRAFITO se validó contra el motor de diseño local de la skill (que agrega 79 estilos, 192 paletas, 119 directrices UX, 74 pares tipográficos y 25 tipos de gráfico). Resultado y refinamientos incorporados:

| Consulta al motor | Resultado | Impacto en GRAFITO |
|---|---|---|
| Design system global (enterprise property/accounting, formal/minimal) | **Minimalism & Swiss Style** — el patrón recomendado para enterprise apps, tableros, SaaS y herramientas profesionales; Inter en headings y body; primario near-black `#0F172A` sobre superficies claras; motion sutil | Confirma la dirección exacta: tipografía Inter, primario grafito, fondo claro, micro-movimiento (§2 y §3) |
| Paleta corporativa | "Professional navy + blue CTA": primario `#0F172A`, secundario `#334155`, acento `#0369A1` | Documentado como **candidato** de marca en §12.3; se mantiene 100% neutro hasta recibir branding del cliente |
| Forms / accesibilidad | Resumen de errores con foco y enlaces a campos (severidad alta); foco visible en diálogos; foco no ocultado (AA) | Aplicado en 6.25 y 10.3 |
| KPIs de tablero | Gráfico de bala para "KPI vs objetivo" (texto + marcador de meta; color suplementario) | Aplicado en 6.7 y 11.2 |
| Feedback de carga | Progreso en procesos multi-paso ("Paso 2 de 4"); `aria-busy`; esqueleto estable sin parpadeo | Aplicado en 6.14, 6.20 y 7 |
| Tablas | Desplazamiento horizontal o tarjetas en móvil; acciones en lote con selección | Aplicado en 6.5 y sección 9 |
| Gráficos financieros | No usar candlestick/OHLC (dominio de trading); línea/barras con etiquetas textuales | Aplicado en 11.1 |
| Tipografía | Cuerpo/head que más cuadra: Inter (ya elegido). Alternativas documentadas: "Fira" (datos de tablero) y "Corporate Trust" (Lexend + Source Sans 3, alta accesibilidad) | Inter se mantiene; alternativas mencionadas en §2.2 si el cliente prefiere |

El motor también validó el pre-delivery checklist (sin emojis como iconos, `cursor-pointer` en todo lo clickeable, al pasar el cursor 150–300ms, contraste 4.5:1, foco visible, `prefers-reduced-motion`, adaptativo 375/768/1024/1440) — todos ya son requisito en este documento.

---

## Anexo B — Prototipo de validación (`prototipo-validacion.html`)

**Cómo usar:** abrir `docs/ui/prototipo-validacion.html` en cualquier navegador moderno (no requiere build, ni servidor, ni dependencias). Seleccionar rol en el inicio de sesión. Todo el contenido (vistas, tablas, formularios, diálogos, avances paso a paso y datos de muestra) está embebido con el fin de validar **fidelidad al documento maestro** y servir de referencia viva al developer.

### B.1 Cobertura validada

| Área | Rutas | Estado |
|---|---|---|
| Admin — operación | `/app/resumen`, `/app/clientes`, `/app/inmuebles`, `/app/contratos`, `/app/cobros`, `/app/liquidaciones` | Implementadas con datos simulados (§8.1–8.4, 8.12) |
| Admin — mantenimiento | `/app/incidencias`, `/app/lineablanca` | Implementadas (kanban + línea de tiempo) |
| Admin — contabilidad (Fase 3) | `/app/contabilidad/{plan, asientos, cierres, conciliacion, impuestos, activos, ef}` | Implementadas; **editor de asiento con validación en vivo débito = crédito (§8.7)**; cierre con asistente de 4 pasos y confirmación irreversible sustentada (§8.8); gráficos de bala para KPIs (§11.2) |
| Admin — sistema | `/app/reportes`, `/app/notificaciones`, `/app/administracion`, `/app/administracion/roles`, `/app/guia` | Implementadas; roles clonables + matriz de permisos precargada |
| Admin — permisos (demo) | `/app/*` con control por rol | **Implementado en v1.4:** `can()`/`hasPerm()` con los 6 roles semilla; barra lateral, menú móvil, tablero (§8.3), búsqueda global y rutas protegidas respetan el permiso; vista "Sin permiso" (§6.17); interruptor de usuario de prueba en la ficha de usuario de la barra superior |
| Portal inquilino | `/portal/inquilino/{resumen, calendario, pagos, incidencias, perfil, notificaciones}` | Implementadas como tablero con barra lateral (≥960px) y barra de navegación inferior + panel deslizante (<960px) (§8.9–8.10); pago con método/referencia/adjunto y comprobante (§8.11) |
| Portal propietario | `/portal/propietario/{resumen, pagos, perfil, notificaciones}` | Implementadas **detrás de la bandera de funcionalidad `features.portal-propietario` (Fase 4)** — en la demo se permite entrar para validar el diseño; el aviso destacado explica el estado (§11) |
| Estados | carga (esqueleto), vacío, error, éxito, advertencia, foco y teclado | Cubiertos en `/app/guia` y en los flujos (§7) |
| Accesibilidad | Contraste AA, foco visible, `aria-modal`/`aria-label`, `prefers-reduced-motion`, `Escape` cierra diálogos, `/` abre búsqueda en admin | Verificables en el prototipo |

### B.2 Correcciones detectadas durante la validación (aplicadas aquí y en el documento cuando aplica)

Durante el desarrollo del prototipo se detectaron y corrigieron estos puntos del HTML:

1. **Icono `sliders` faltante** en la barra de Filtros de Clientes (renderizaba vacío) → añadido al set de iconos.
2. **Expresión de canon malformada** en la ficha de Inmuebles (`D.recibos.find(...)` con ternario inválido, riesgo de `ReferenceError`) → reemplazada por helper `canonOf(ref)` que lee el canon del contrato vigente.
3. **`comprobante()`** pasaba un tercer argumento ignorado a `modalHead` y abría el modal sin tamaño → ahora abre modal ancho (`openModal(html,'lg')`).
4. **Router:** `setPortalHeader()` se invocaba en el área admin donde `PORTAL_USER['admin']` no existe → corregido: el encabezado de portal solo se aplica en área `/portal/*`.
5. **Permisos no respetados en el tablero y la navegación (feedback del usuario):** antes, cualquier rol veía el resumen contable completo (Ingresos, mora, cierre contable) y todos los módulos del menú. Implementado modelo de permisos en tiempo de ejecución: barra lateral/menú móvil filtrados por `can(modulo)`, vistas protegidas con `sinPermiso()` (§6.17), tablero adaptativo por permiso (§8.3) y búsqueda global filtrada; añadido interruptor de usuario de prueba en la ficha de usuario para validar los 6 perfiles.

**Sintaxis y tiempo de ejecución:** el script embebido se validó con `node --check` y un smoke test que ejecuta todas las rutas de renderizado sin errores. No se usan librerías externas.

### B.3 Simplificaciones deliberadas del prototipo (para desarrollo)

- **Tablas admin en pantallas pequeñas:** el documento §9 pide convertir tablas a tarjetas apiladas `< 600px`. El prototipo conserva la tabla con desplazamiento horizontal (más barato de validar); la transformación a tarjetas es trabajo de implementación.
- **Portales:** diseño de tablero con barra lateral permanente en ≥960px (marco de aplicación compartido con Admin, ancho 256px, contenido máx. 1500px); en <960px la barra lateral colapsa a panel deslizante con menú hamburguesa y aparece la barra de navegación inferior. Corrección aplicada en el prototipo por feedback del usuario ("los portales no deben verse como dispositivo móvil en escritorio"). El portal propietario se encuentra en discusión (bandera OFF por defecto en Fase 0–3).
- **Integraciones:** adjunto de comprobante, envíos de notificación (email/SMS/WhatsApp Fase 2), generación real de PDF/DGI y programación de reportes se muestran como acciones con confirmación (aviso breve), no con lógica real.
- **Emojis en datos simulados:** los "iconos" de inmueble (`🏙`, `🏢`, …) son marcadores de posición decorativos de la ficha, no iconos funcionales del sistema; deben reemplazarse por fotografía o SVG de marca en producción.
- **Acciones de página no filtradas por permiso en cada grilla:** el prototipo oculta/adapta las acciones sensibles de la cabecera del tablero y filtra navegación y rutas; los botones internos de cada lista (`Nuevo`, `Exportar`, editar fila…) permanecen visibles en la demo. En producción, cada endpoint valida el permiso y la UI se deriva de los permisos reales del usuario (la regla completa de "oculta vs deshabilitada con nota emergente" del §4.2 se implementa con los permisos reales del backend).

---

*Documento maestro de diseño. La fuente de verdad son los tokens (`tokens.dtcg.json`). Al recibir el branding del cliente, ejecutar la migración de la sección 12.3 y actualizar la tabla de meta-información (Estado → "Brand aplicado").*