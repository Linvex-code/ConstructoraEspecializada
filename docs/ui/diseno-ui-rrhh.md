# Diseño de Interfaz — Módulo de Recursos Humanos y Planilla (RH)

| Campo | Valor |
|---|---|
| **Versión** | 1.2 |
| **Fecha** | 19/09/2026 |
| **Estado** | Documento de diseño oficial del módulo RH — alimenta `ui/prototipo-demo.html` |
| **Documento base** | `docs/modulos/recursos-humanos.md` v1.0 (requerimiento RF-RH-001 + RF-RH-01…46) |
| **Sistema de diseño** | GRAFITO v1.5 — `docs/ui/diseno-ui-design-system.md` · `docs/ui/tokens.css` · `docs/ui/tokens.dtcg.json` |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` v1.5 (ADR-022, PA-17) · `docs/modulos/README.md` v1.2 (catálogo de permisos) · `docs/modulo-contabilidad.md` v1.0 (§3.7/§4) |
| **Prototipo** | `ui/prototipo-demo.html` → copia a `site/prototipo-demo.html` |
| **Permisos del catálogo** | 24 permisos `rrhh.*` (ver §2) |
| **Feature flags** | `features.rrhh` · `features.nomina` · `features.asistencia` · `features.portal-empleado` · `features.reclutamiento` · `features.seguridad-ocupacional` |

> Regla transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX. Este documento describe pantallas, flujos y estados tal como deben verse en el prototipo y en producción.
>
> ⚠️ Marco panameño: las reglas de cálculo de nómina (CSS, ISR/retenciones DGI, décimo tercer mes, horas extras, vacaciones, preaviso e indemnización) requieren validación con CPA y asesor legal (`SUPUESTO PA-17`). En el prototipo **no hay reglas fiscales simuladas**: el motor de nómina se muestra **parametrizable** y el cálculo demo usa conceptos simples con montos en B/.

## Cómo usar este documento (contrato open design)

- Es el plano de pantallas del módulo RH: cualquier IA o desarrollador debe poder producir la MÍSMA interfaz usando GRAFITO + este inventario.
- Cada pantalla tiene: ruta de hash, permisos que controlan la visibilidad, estructura ASCII, componentes GRAFITO reutilizados y anotaciones de flujo/estado.
- La numeración (`P.ADM.01`, `P.PE.01`, `P.PS.01`…) permite trazabilidad hacia las secciones 3/5/8 del módulo RH.

## 1. Inventario de pantallas

### 1.1 Áreas y sitemap

```
┌─ Autenticación (reutiliza GRAFITO §8.1)─────────────────────────┐
│  /login → /olvide-contrasena → /verificacion-otp               │
│        → /restablecer-contrasena                                │
│  Modo demo: selección de usuario admin, o portales              │
│  (inquilino / propietario / empleado / supervisor)              │
└─────────────────────────────────────────────────────────────────┘

┌─ Admin RH /app/rrhh/* (escritorio-first)────────────────────────┐
│  /app/rrhh                  → Panel RH (KPIs + alertas + tiles) │
│  /app/rrhh/organizacion     → Organización                       │
│  /app/rrhh/proyectos        → Proyectos y obras + asignación    │
│  /app/rrhh/empleados        → Empleados (registro + ficha)        │
│  /app/rrhh/altas            → Registrar empleado nuevo (solo      │
│  │                             candidatos que superaron el         │
│  │                             reclutamiento)                      │
│  /app/rrhh/empleado         → Ficha empleado (master-detail)     │
│  /app/rrhh/contratos        → Contratos laborales y adendas      │
│  /app/rrhh/asistencia       → Horarios, marcaciones, horas       │
│  │                             extras, feriados (tabs)            │
│  /app/rrhh/tiempo-libre     → Vacaciones, permisos,              │
│  │                             incapacidades (tabs)               │
│  /app/rrhh/compensaciones   → Conceptos, préstamos, anticipos   │
│  /app/rrhh/nomina           → Períodos y planillas + detalle     │
│  /app/rrhh/planilla         → Detalle de planilla por período    │
│  /app/rrhh/liquidaciones    → Liquidaciones laborales           │
│  /app/rrhh/reclutamiento    → Vacantes, candidatos, onboarding,  │
│  │                             offboarding (tabs)                 │
│  /app/rrhh/desarrollo       → Evaluaciones y capacitaciones      │
│  /app/rrhh/seguridad        → EPP, accidentes, equipos (tabs)    │
│  /app/rrhh/reportes         → Reportes RH                        │
│  /app/rrhh/configuracion    → Reglas, conceptos, feriados,       │
│                                políticas                          │
└──────────────────────────────────────────────────────────────────┘

┌─ Portal Empleado /portal/empleado/* (barra lateral ≥960 · bottom nav <960)┐
│  /resumen        → Tablero autoservicio (próximo pago, saldos)   │
│  /recibos        → Recibos de pago (PDF)                        │
│  /asistencia     → Marcaciones, horas extras (solo las propias)  │
│  /tiempo-libre   → Vacaciones y permisos + solicitar             │
│  /solicitudes    → Mis solicitudes (vacaciones/permisos/         │
│                     anticipos/horas extra)                        │
│  /prestamos      → Préstamos y anticipos (amortización)          │
│  /documentos     → Expediente digital (solo autorizados)        │
│  /datos          → Datos personales y cuenta bancaria            │
│  /notificaciones → Notificaciones del portal empleado            │
│  /perfil         → Perfil y preferencias                          │
└──────────────────────────────────────────────────────────────────┘

┌─ Portal Supervisor /portal/supervisor/* (mismo shell)────────────┐
│  /resumen        → Tablero del equipo                            │
│  /equipo         → Mi equipo (solo estructura a cargo)           │
│  /asistencia     → Asistencia del equipo                         │
│  /horas-extras   → Horas extras por aprobar                      │
│  /ausencias      → Vacaciones/permisos por aprobar               │
│  /evaluaciones   → Evaluaciones de desempeño del equipo          │
│  /notificaciones → Notificaciones del supervisor                 │
│  /perfil         → Perfil                                         │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Mapa pantalla → requerimiento

| Pantalla | Ruta | RF base | Permiso de acceso |
|---|---|---|---|
| P.ADM.01 Panel RH | `/app/rrhh` | RF-RH-44, RF-RH-45 | `rrhh.empleados.ver` |
| P.ADM.02 Organización | `/app/rrhh/organizacion` | RF-RH-01…04 | `rrhh.organizacion.gestionar` (ver datos: `rrhh.empleados.ver`) |
| P.ADM.03 Proyectos y obras | `/app/rrhh/proyectos` | RF-RH-05, RF-RH-11 | `rrhh.proyectos.asignar` |
| P.ADM.04 Empleados (listado) | `/app/rrhh/empleados` | RF-RH-06…09 | `rrhh.empleados.ver` |
| P.ADM.04B Registrar empleado nuevo | `/app/rrhh/altas` | RF-RH-06, RF-RH-33 | `rrhh.empleados.gestionar` — listado alimentado **solo** por candidatos de Reclutamiento en etapa final (`Oferta enviada`) |
| P.ADM.05 Ficha empleado | `/app/rrhh/empleado?id=` | RF-RH-06…10 | `rrhh.empleados.ver` (salario: `rrhh.salarios.ver`) |
| P.ADM.06 Contratos | `/app/rrhh/contratos` | RF-RH-10 | `rrhh.contratos.gestionar` |
| P.ADM.07 Asistencia | `/app/rrhh/asistencia` | RF-RH-12…15 | `rrhh.asistencia.ver` (gestionar: `rrhh.asistencia.gestionar`, extras: `rrhh.horasextras.aprobar`) |
| P.ADM.08 Tiempo libre | `/app/rrhh/tiempo-libre` | RF-RH-16…18 | `rrhh.ausencias.aprobar` (incapacidades: `rrhh.incapacidades.gestionar`) |
| P.ADM.09 Compensaciones | `/app/rrhh/compensaciones` | RF-RH-19…22 | `rrhh.prestamos.gestionar` (ver salario: `rrhh.salarios.ver`) |
| P.ADM.10 Nómina | `/app/rrhh/nomina` | RF-RH-23…29 | `rrhh.nomina.crear` (ver: `rrhh.empleados.ver`) |
| P.ADM.11 Detalle planilla | `/app/rrhh/planilla?id=` | RF-RH-27…29, RF-RH-31, RF-RH-32 | `rrhh.nomina.crear` / `rrhh.salarios.ver` |
| P.ADM.12 Liquidaciones | `/app/rrhh/liquidaciones` | RF-RH-30 | `rrhh.liquidaciones.gestionar` |
| P.ADM.13 Reclutamiento | `/app/rrhh/reclutamiento` | RF-RH-33…35 | `rrhh.reclutamiento.gestionar` |
| P.ADM.14 Desarrollo | `/app/rrhh/desarrollo` | RF-RH-36, RF-RH-37 | `rrhh.desarrollo.gestionar` |
| P.ADM.15 Seguridad ocupacional | `/app/rrhh/seguridad` | RF-RH-38, RF-RH-39 | `rrhh.seguridad-ocupacional.gestionar` |
| P.ADM.16 Reportes RH | `/app/rrhh/reportes` | RF-RH-43, RF-RH-45 | `rrhh.reportes.ver` |
| P.ADM.17 Configuración RH | `/app/rrhh/configuracion` | RF-RH-25, RF-RH-26 | `rrhh.configuracion` |
| P.PE.01 Resumen Empleado | `/portal/empleado/resumen` | RF-RH-40 | Recurso derivado: solo su relación |
| P.PE.02 Recibos | `/portal/empleado/recibos` | RF-RH-28, RF-RH-40 | Recurso derivado |
| P.PE.03 Asistencia (autoservicio) | `/portal/empleado/asistencia` | RF-RH-13, RF-RH-40 | Recurso derivado |
| P.PE.04 Tiempo libre (autoservicio) | `/portal/empleado/tiempo-libre` | RF-RH-16, RF-RH-40 | Recurso derivado |
| P.PE.05 Solicitudes | `/portal/empleado/solicitudes` | RF-RH-14, RF-RH-16…22, RF-RH-40 | Recurso derivado |
| P.PE.06 Préstamos | `/portal/empleado/prestamos` | RF-RH-21, RF-RH-22, RF-RH-40 | Recurso derivado |
| P.PE.07 Documentos | `/portal/empleado/documentos` | RF-RH-08, RF-RH-40 | Recurso derivado + permisos de documento |
| P.PE.08 Datos y cuenta | `/portal/empleado/datos` | RF-RH-06, RF-RH-40 | Recurso derivado |
| P.PE.09 Notificaciones | `/portal/empleado/notificaciones` | RF-RH-42 | Recurso derivado |
| P.PE.10 Perfil | `/portal/empleado/perfil` | RF-RH-40 | Recurso derivado |
| P.PS.01 Resumen Supervisor | `/portal/supervisor/resumen` | RF-RH-41 | Alcance organizacional (equipo a cargo) |
| P.PS.02 Mi equipo | `/portal/supervisor/equipo` | RF-RH-41 | Alcance organizacional |
| P.PS.03 Asistencia del equipo | `/portal/supervisor/asistencia` | RF-RH-41 | Alcance organizacional |
| P.PS.04 Horas extras por aprobar | `/portal/supervisor/horas-extras` | RF-RH-14, RF-RH-41 | Alcance organizacional + `rrhh.horasextras.aprobar` |
| P.PS.05 Ausencias por aprobar | `/portal/supervisor/ausencias` | RF-RH-16, RF-RH-17, RF-RH-41 | Alcance organizacional |
| P.PS.06 Evaluaciones | `/portal/supervisor/evaluaciones` | RF-RH-36, RF-RH-41 | Alcance organizacional |
| P.PS.07 Notificaciones | `/portal/supervisor/notificaciones` | RF-RH-42 | Recurso derivado |
| P.PS.08 Perfil | `/portal/supervisor/perfil` | RF-RH-40 | Recurso derivado |

## 2. Permisos y navegación

Catálogo oficial (24 permisos, §4 de `docs/modulos/README.md`). El menú y las acciones se muestran/ocultan según el rol activo en el prototipo (RBAC demo con «Entrar como»): **el backend es la autoridad real**.

| Categoría | Permiso | Ejemplo de efecto en UI |
|---|---|---|
| Datos no salariales | `rrhh.empleados.ver` | Visibilidad del panel RH, listado de empleados y ficha sin tab de salario |
| Gestión de personal | `rrhh.empleados.gestionar` | Botones crear/editar empleado, subir documento, historial |
| Salarios | `rrhh.salarios.ver` | Columna Salario, tab Salario en ficha, detalle de planilla |
| Organización | `rrhh.organizacion.gestionar` | P.ADM.02 y alta de departamentos/puestos/centros de costo |
| Proyectos | `rrhh.proyectos.asignar` | P.ADM.03 y distribución de costos en ficha |
| Contratos | `rrhh.contratos.gestionar` | P.ADM.06 y adendas |
| Asistencia | `rrhh.asistencia.ver` / `rrhh.asistencia.gestionar` | Lectura de marcaciones / corrección de marcaciones |
| Horas extras | `rrhh.horasextras.aprobar` | Acciones aprobar/rechazar en P.ADM.07 y P.PS.04 |
| Ausencias | `rrhh.ausencias.aprobar` | Aprobar vacaciones/permisos en P.ADM.08 y P.PS.05 |
| Incapacidades | `rrhh.incapacidades.gestionar` | Tab Incapacidades (datos médicos restringidos) |
| Préstamos | `rrhh.prestamos.gestionar` | Tab Préstamos/Anticipos en P.ADM.09 |
| Nómina | `rrhh.nomina.crear` / `.revisar` / `.aprobar` / `.pagar` / `.reabrir` / `.contabilizar` | Botones según estado: Calcular, Revisar, Aprobar, Generar ACH, Reabrir, Contabilizar |
| Liquidaciones | `rrhh.liquidaciones.gestionar` | P.ADM.12 y cálculo de liquidación |
| Reclutamiento | `rrhh.reclutamiento.gestionar` | P.ADM.13 y checklists |
| Desarrollo | `rrhh.desarrollo.gestionar` | P.ADM.14 |
| Seguridad ocupacional | `rrhh.seguridad-ocupacional.gestionar` | P.ADM.15 |
| Configuración | `rrhh.configuracion` | P.ADM.17 (reglas, conceptos, feriados, políticas) |
| Reportes | `rrhh.reportes.ver` | P.ADM.16 |

**Navegación admin (grupo «Recursos Humanos» en la barra lateral):**

```
Recursos Humanos (visible si can('rrhh'))
├─ Panel RH          /app/rrhh
├─ Empleados         /app/rrhh/empleados
├─ Asistencia        /app/rrhh/asistencia
├─ Tiempo libre      /app/rrhh/tiempo-libre
├─ Compensaciones    /app/rrhh/compensaciones
├─ Nómina            /app/rrhh/nomina
├─ Liquidaciones     /app/rrhh/liquidaciones
├─ Reclutamiento     /app/rrhh/reclutamiento
├─ Seguridad ocup.   /app/rrhh/seguridad
├─ Reportes RH       /app/rrhh/reportes
└─ Configuración RH  /app/rrhh/configuracion   (solo rrhh.configuracion)
```

Organización y Proyectos se acceden desde el Panel RH y desde la ficha de empleado (no son ítems de nivel superior en el sidebar para no saturarlo; están enrutados igualmente).

**Roles demo** (semilla clonable, patrón Admin): `RRHH` (Gerente de RRHH, casi todo el catálogo salvo `pagar`, `reabrir`, `contabilizar`), `NOMINA` (Analista de nómina: crear/revisar/contabilizar, sin aprobar ni pagar — separación de funciones FL-RH-02), `PAGOSRH` (Pagador: `rrhh.nomina.pagar` y solo lectura). El rol `ADMIN` (acceso total) ve todo. El rol `CONTADOR` conserva `contabilidad.*`: aprueba los asientos borrador que genera la planilla (FL-RH-06) y no ve el detalle salarial salvo lo necesario.

## 3. Estados y flujos clave

### 3.1 Estados del empleado (chip de estado)

`Preingreso · Activo · Suspendido · En vacaciones · En licencia · En incapacidad · Inactivo · Renunciado · Terminado · Jubilado`

- Transiciones validadas por backend (FL-RH-01); el chip usa la paleta semántica GRAFITO:
  - Éxito: `Activo`
  - Info: `Preingreso`, `En vacaciones`, `En licencia`
  - Warning: `Suspendido`, `En incapacidad`, `Inactivo`
  - Neutral: `Renunciado`, `Terminado`, `Jubilado`
- El historial de estados se muestra como **línea de tiempo** (componente GRAFITO §6.18) en la ficha del empleado, con responsable y fecha. Append-only (RD-RH-06).

### 3.2 Estados de la planilla (flujo principal RF-RH-27)

```
Borrador → Calculada → Revisada → Aprobada → Cerrada → Pagada
   ↑                                                        │
   └────── Reabierta (permiso rrhh.nomina.reabrir + motivo) ┘
```

| Estado | Acciones visibles (siempre con su permiso) | Nota |
|---|---|---|
| `Borrador` | Editar conceptos, **Calcular planilla** | única etapa no inmutable |
| `Calculada` | **Revisar** | snapshot de reglas/cálculo (RN-RH-11) |
| `Revisada` | **Aprobar** (usuario ≠ creador), **Regenerar** | FL-RH-02 separación de funciones |
| `Aprobada` | **Cerrar** / **Generar archivo ACH** / **Contabilizar** | contabilización idempotente por periodo, asientos borrador (FL-RH-06) |
| `Cerrada` | **Pagar** / **Reabrir** (con motivo) | cerrada es inmutable (RD-RH-05) |
| `Pagada` | Ver recibo, **Reabrir** (proceso controlado) | requiere proceso de reversión |

- Acción primaria por estado (una sola; ver §5). Botones deshabilitados con nota emergente «Se requiere permiso X» en vez de ocultos para acciones de lectura; **ocultos** para acciones sensibles (aprobar, pagar, reabrir).
- Reapertura: diálogo de confirmación pidiendo **motivo obligatorio** (RD-RH-05, RN-RH-12) y registrando responsable/fecha.

### 3.3 Flujo de solicitudes (vacaciones, permisos, horas extras, anticipos)

```
Empleado → Supervisor → RRHH → Aprobado / Rechazado
```

- Cada solicitud tiene historial (FL-RH-04) y estados `Borrador · Enviada · En revisión · Aprobada · Rechazada · Cancelada` (chip).
- **Horas extras**: solo entran a planilla las aprobadas (RN-RH-07); en el portal solicita → supervisor aprueba → RRHH confirma.
- **Vacaciones**: no se pide por encima del saldo disponible (RN-RH-06); el saldo se descuenta al aprobarse y se muestra «Saldo disponible · Pendientes · Historial».

### 3.4 Portal del empleado (IDOR)

- El portal del empleado **nunca muestra un listado global**: solo su información y sus solicitudes (FL-RH-08). El panel de resumen muestra su próximo pago, saldo de vacaciones y estado de sus solicitudes.
- El portal del supervisor solo ve el equipo bajo su responsabilidad (estructura organizacional), nunca un listado global.

## 4. Esquemas ASCII (planos por pantalla)

### 4.1 P.ADM.01 Panel RH (`/app/rrhh`)

```
Papelera › Recursos Humanos
Panel RH · Período: Septiembre 2026          [🡇 Exportar resumen]
┌──────────┬──────────┬──────────┬──────────┐
│ Empleados│  Activos │  Plantilla│  Costo   │
│  12      │  10      │  B/. 8,940│ por obra │
│  +1 este │ 3 obras  │  Sep 2026 │ B/. 3,120│
│  mes     │          │  Cerr.    │ CON-001  │
└──────────┴──────────┴──────────┴──────────┘
[⚠ Aviso] 4 planilla(s) por aprobar · 2 documentos por vencer
┌────────────────────────┬─────────────────────────┐
│ Organización · Empleados│ Próximas liquidaciones  │
│ Proyectos · Contratos  │ Vencimientos de contrato │
│ Asistencia · Nómina    │ Solicitudes por aprobar  │
│ ... (tiles de módulo)  │ Cumpleaños del mes       │
└────────────────────────┴─────────────────────────┘
```

- KPIs (componente GRAFITO §8.3): total/activos, costo nómina período, costo mano de obra por proyecto, ausentismo.
- Tiles de submódulos con chip «Permiso disponible / Sin permiso» (patrón de `viewContabilidad`).
- Avisos tipo alerta (GRAFITO §6.12): planillas por aprobar, solicitudes, vencimientos.

### 4.2 P.ADM.04/05 Empleados (registro + altas + ficha master-detail)

La sección Empleados tiene **dos pestañas** (mismo patrón de tabs de Reclutamiento/Asistencia):

- **Registro de empleados** (`/app/rrhh/empleados`): listado denso histórico de la plantilla (patrón §5.1). El registro **no se captura manualmente**: la acción primaria «Registrar empleado nuevo» navega a la pestaña de altas.
- **Registrar empleado nuevo** (`/app/rrhh/altas`): listado que proviene **exclusivamente** de Reclutamiento · Candidatos que **superaron la etapa final del reclutamiento** (etapa `Oferta enviada`). No hay captura manual: la fila muestra candidato, cédula, vacante, departamento, propuesta salarial y fecha de etapa final; la acción «Crear empleado» abre el preingreso con los datos del candidato (RF-RH-33 → RF-RH-06, RN-RH-02). Acceso con `rrhh.empleados.gestionar`; sin permiso, el listado es de solo lectura con botones deshabilitados.

Listado (denso, patrón §5.1) — cada dato en su columna: código (`EMP-xxx`), empleado, cédula, cargo, departamento, contrato, salario, estado y acción:

```
Papelera › RH › Empleados
[Registro de empleados | Registrar empleado nuevo]
Empleados [Registrar empleado nuevo]
🔍 Buscar nombre, cédula, puesto…   [Filtros ▾]
┌────────────────────────────────────────────────────────────┐
│Código  Empleado      Cédula       Cargo        Depto    Est│
│● Luis Sandoval  8-822-1401  Conserje       Mnto.    Activo │
│● María Vega     8-844-2201  Asistente adm. Admin    Activo │
│● Carlos Matus   4-776-0092  Operador TI    TI       Inactiv│
│1–12 de 12   [25 ▼]  ‹ ›                                    │
└────────────────────────────────────────────────────────────┘

Registrar empleado nuevo (altas) · solo candidatos que superaron el reclutamiento
┌──────────────────────────────────────────────────────────────┐
│ Candidato       Cédula      Vacante         Propuesta  Etapa│
│ ● Marissa Lee   8-777-221   Asist. contable  B/. 1,150 Ofer.│
│ ● Manuel Quinte 8-909-112   Técnico electri. B/. 1,250 Ofer.│
│   [Crear empleado]  → preingreso con datos del candidato    │
└──────────────────────────────────────────────────────────────┘
```

Ficha (P.ADM.05) — master-detail con tabs:

```
Volver a Empleados › María Vega
María Vega · 8-844-2201          [Editar] [⋮]
Asistente administrativa · Administración · Activo
[Información] [Laboral] [Contratos] [Expediente] [Historial]
┌────────────────┬─────────────────────────────────────────┐
│ Datos person.  │ Laboral: puesto, jefe, proyecto 30%,     │
│ contacto emerg.| centro de costo, fechas, frecuencia pago│
│ cuenta B/.     │ Salario (si rrhh.salarios.ver): B/. 1,100│
└────────────────┴─────────────────────────────────────────┘
```

- **Expediente** (RF-RH-08): tabla de documentos con tipo, versión, vencimiento (alerta), descarga; subida vía zona de carga (GRAFITO §6.29). Datos médicos restringidos (RD-RH-07).
- **Historial** (RF-RH-09): línea de tiempo append-only con valor anterior → nuevo y motivo.

### 4.3 P.ADM.10/11 Nómina (`/app/rrhh/nomina`)

```
Panel RH › Nómina
Nómina · Períodos de planilla          [+ Nuevo período]
🔍 Buscar período…        [Filtro: estado ▾]
┌─────────────────────────────────────────────────────────────┐
│ Período          Tipo       Empleados  Neto       Estado   │
│ Sep 2ª quincena  Quincenal  12         B/. 4,512  Revisada │
│ Sep 1ª quincena  Quincenal  12         B/. 4,428  Aprobada │
│ Agosto           Mensual    11         B/. 8,650  Pagada   │
│ Julio            Mensual    11         B/. 8,540  Pagada   │
└─────────────────────────────────────────────────────────────┘
```

Detalle (P.ADM.11) — fila por empleado con conceptos:

```
Planilla › Quincena 2 · Septiembre 2026      estado: Revisada
Período 16/09–30/09 · Pago 30/09 · Empresa CE, S.A.
[Calcular] [Revisar] [Aprobar] [Generar ACH] [Contabilizar]  ← según estado+permiso
┌───────────────────────────────────────────────────────────────┐
│ Empleado     Ingresos     Deducciones     Neto      Estado   │
│ María Vega   B/. 585.00   B/. 75.00       B/. 510.00 Revisado │
│ ...                                                            │
└───────────────────────────────────────────────────────────────┘
Conceptos por empleado (drawer): base, extras, bonos | CSS, préstamo, anticipo
Costos por proyecto (carta): CON-001 B/. 1,560 · ADM-001 B/. 950 …
```

- El detalle de conceptos (append-only `PlanillaConcepto`) se abre en **panel deslizante** (GRAFITO §6.10) por empleado.
- Sección «Costos por proyecto» (RF-RH-29, RF-RH-45): snapshot, no editable (FL-RH-09).
- Tarjeta de contabilización: chip «Asiento borrador generado · Pendiente de aprobar en Contabilidad» con referencia `AS-2026-…`.
- Tarjeta de pago: estados `Generado → Enviado → Confirmado → Pagada` (FL-RH-07).

### 4.4 P.ADM.07 Asistencia (`/app/rrhh/asistencia`) — tabs

```
Tabs: Horarios | Marcaciones | Horas extras | Feriados
Marcaciones · Septiembre 2026         [⏺ Registrar marcación]
┌────────────────────────────────────────────────────────────┐
│ Empleado       Entrada   Salida   Horas  Tardía  Obra      │
│ Luis Sandoval  07:01     15:58    8:57   —       CON-001   │
│ ...                                                         │
└────────────────────────────────────────────────────────────┘
Horas extras (tab): solicitudes por aprobar [Aprobar]/[Rechazar]
```

### 4.5 P.ADM.08 Tiempo libre (`/app/rrhh/tiempo-libre`) — tabs

```
Tabs: Vacaciones | Permisos | Incapacidades
Vacaciones · solicitudes       Saldo agregado por empleado
┌────────────────────────────────────────────────────────────┐
│ Empleado   Días   Desde–Hasta       Estado     Aprobador   │
│ M. Vega    5      05/10–09/10       Aprobada   S. Ríos     │
└────────────────────────────────────────────────────────────┘
Incapacidades (solo rrhh.incapacidades.gestionar): datos médicos ▭▭ (enmascarados para otros roles)
```

### 4.6 P.PE.01 Resumen Empleado (`/portal/empleado/resumen`)

```
┌────────────────────────────────────────────────────────────┐
│ Hola, María · Quincena 2 · Septiembre                      │
│  Tu próximo pago                    B/. 510.00             │
│  Recibo disponible 30/09 · Banco General •• 4567           │
└────────────────────────────────────────────────────────────┘
[Mi saldo de vacaciones] [Mis solicitudes] [Asistencia de hoy]
```

- Hero (GRAFITO portales §8.9) enmarcado en brand: próximo pago neto, fecha, cuenta bancaria.
- KPIs: saldo vacacional (días), solicitudes pendientes, horas extra del período.
- Solo su información (IDOR). Nota RBAC «El portal muestra únicamente tu información laboral (RN-RH-10).»

### 4.7 P.PE.05 Solicitudes (`/portal/empleado/solicitudes`)

```
Mis solicitudes                      [+ Nueva solicitud ▾]
[Vacaciones] [Permiso] [Horas extra] [Anticipo]
┌────────────────────────────────────────────────────────────┐
│ Tipo        Detalle                Fecha     Estado        │
│ Vacaciones  5 días · 05/10–09/10   15/09     En revisión   │
│ Permiso     Cita médica · 2 h      12/09     Aprobado      │
└────────────────────────────────────────────────────────────┘
```

### 4.8 P.PS.04/05 Portal supervisor (aprobaciones)

```
Mi equipo › Horas extras por aprobar
Asistente de obra: Carlos Villar · 18/09 · 3 h · Obra CON-001
[Horario de obra 07:00–16:00 · EPP entregado ✓]
[✓ Aprobar] [✕ Rechazar]   ← requiere rrhh.horasextras.aprobar
```

## 5. Componentes GRAFITO reutilizados

| Componente | Uso en RH |
|---|---|
| Barra lateral del Admin (grupos + ítem activo con viñeta) | Grupo «Recursos Humanos» del sidebar |
| Tabla de datos densa + paginación `1–25 de N` | Todos los listados |
| Filtros (barra de búsqueda + chips) | Empleados, nómina, asistencia, solicitudes |
| Ficha master-detail con tabs | Ficha de empleado |
| Calendario (GRAFITO §6.19) | Vacaciones por equipo, feriados |
| Timeline (historial) | Historial laboral y de estados |
| Diálogo de confirmación | Reabrir planilla, aprobar, anular solicitud, liquidar |
| Panel deslizante (drawer) | Detalle de conceptos de planilla, ficha rápida de empleado |
| Estado vacío / esqueleto / error con trace_id | Todas las secciones |
| Guardia de permiso | Rutas protegidas sin permiso |
| Alerta demo RBAC | «El backend es la autoridad real…» |
| Chip de estado | Estados de empleado, planilla, solicitudes, documentos |
| Comprobante (GRAFITO §6.24) | Recibo de pago del empleado (PDF/vista) |

## 6. Datos mock y convenciones (prototipo)

- Moneda `B/. 1,234.56` · cifras tabulares · derecha en tablas · negativos con signo (regla GRAFITO §5.5).
- Fechas `DD/MM/YYYY` en pantalla · períodos «Septiembre 2026».
- Folios/códigos en fuente mono: `EMP-001…12`, `CT-2026-041`, `AD-2026-002`, `PLA-2026-02`, `REC-2026-Q2-001`, `LIQ-2026-001`, `PRE-2026-01`, `VAC-2026-001`, `HE-2026-018`, `CAN-2026-005`.
- Empresa demo: «Constructora Especializada, S.A.» · RUC `155-1234-56789` · sucursal «Panamá — Sede Central».
- Centros de costo: `CON-001 Torre Central (construcción)`, `ADM-001 Administración`, `MNT-001 Mantenimiento`, `ALQ-001 Alquileres`.
- Proyectos demo: `PRY-2026-001 Torres del Mar — Torre 3 (obra gris)`, `PRY-2026-002 Residencial Las Cumbres — Casa 18`, `PRY-2026-003 Rehabilitación Local C-1`.
- Empleados demo (reutiliza y amplía los existentes del prototipo): María Vega (asistente admin), Luis Sandoval (conserje), Carlos Matus (operador TI) → se añaden supervisores/técnicos de obra con contrato indefinido/temporal.
- Contratistas (D8): se listan aparte como terceros, **fuera de planilla**.
- Reglas legales: sin cifras fiscales simuladas; tarjetas de configuración con `(SUPUESTO PA-17 — pendiente validación CPA/legal)`. El motor de nómina se presenta parametrizable (versión de regla vigente).

## 7. Responsive y accesibilidad

- Admin RH: escritorio-first (sidebar 256px; <960px panel deslizante). Tablas densas → tarjetas en móvil cuando aplique; **sin desplazamiento horizontal de página**.
- Portales empleado/supervisor: barra lateral ≥960px, bottom-nav <960px (patrón GRAFITO §9).
- WCAG 2.2 AA+: labels visibles, `:focus-visible`, contraste según tokens, `aria-*` en tabs/drawer/switch, `prefers-reduced-motion` heredado de GRAFITO, objetivos táctiles ≥44px en bottom-nav.

## 8. Matriz de cobertura (pantallas del documento → prototipo)

| Documento | Pantallas | Prototipo |
|---|---|---|
| §1.1 Admin RH | 18 pantallas (P.ADM.01–17 + P.ADM.04B) | 18 |
| §1.2 Portal empleado | 10 pantallas (P.PE.01–10) | 10 |
| §1.3 Portal supervisor | 8 pantallas (P.PS.01–08) | 8 |
| Autenticación | GRAFITO §8.1 (login, olvidé, OTP, restablecer) | reutilizada |

**Total: 36 pantallas + autenticación.**

## 9. Control de versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.1 | 19/09/2026 | Solution Architect / UI Prototype | Se incorpora la pantalla P.ADM.04B «Registrar empleado nuevo» (`/app/rrhh/altas`): listado alimentado solo por candidatos de Reclutamiento que superaron la etapa final (`Oferta enviada`); el registro de empleados pasa a ser pestaña de solo lectura y la acción primaria «Registrar empleado nuevo» navega a la pestaña de altas. |
| 1.0 | 19/09/2026 | Solution Architect / UI Prototype | Documento de diseño inicial del módulo RH (inventario de pantallas, permisos, estados, planos ASCII y convenciones) con base en RF-RH-001 y GRAFITO v1.5. |
