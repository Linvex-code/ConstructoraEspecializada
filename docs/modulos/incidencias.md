# Módulo de Incidencias

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 18/09/2026 |
| **Estado** | Documento oficial del módulo v1.1 — incorpora **mantenimiento preventivo planificado de inmuebles** (RF-INC-09…10): planes con recurrencia y checklist, órdenes de trabajo y avisos |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 6 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §12/§18 · `docs/modulos/README.md` (v1.1) |
| **Esquema BD (referencia)** | `ops` (incluye `PlanMantenimiento`) |
| **Feature flag** | `features.incidencias` · `features.mant-preventivo` (definido en `docs/diseno-arquitectura.md` §18) |
| **Permisos del catálogo** | `incidencias.leer` · `incidencias.crear` **[P]** · `incidencias.asignar` · `incidencias.registrar_costo` **[P]** · `incidencias.cerrar` · `incidencias.visitas.programar` · `incidencias.planes.gestionar` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Gestionar reportes de problemas en inmuebles (inquilino → administración → proveedor → cierre) con timeline auditable y visitas programadas.

## 2. Requisitos funcionales

- **RF-INC-01** Reportar incidencia desde cliente o inmueble con categoría y urgencia.
- **RF-INC-02** Categorías: Aire acondicionado, Plomería, Electricidad, Estructura, Electrodoméstico, Otros. Urgencias: Alta/Media/Baja.
- **RF-INC-03** Flujo de estados: `Reportada → Presupuesto → Asignada → En ejecución → Cerrada`.
- **RF-INC-04** Asignar proveedor/técnico; registrar costo (presupuesto y/o ejecución).
- **RF-INC-05** Timeline **append-only** (cada transición agrega evento con fecha y actor).
- **RF-INC-06** Visitas programadas (preventivos, inspecciones) con notificación (plataforma + SMS/email).
- **RF-INC-07** SLA por urgencia `[P]`: Alta < 24 h, Media < 72 h, Baja < 7 días (propuesta a validar).
- **RF-INC-08** Adjuntar fotos `[P]`.
- **RF-INC-09** **Mantenimiento preventivo planificado de inmuebles**: planes por inmueble y servicio (A/C, plomería, pintura, planta eléctrica, seguridad, fumigación…) con **recurrencia** (diaria/semanal/mensual/trimestral/cuatrimestral/semestral/anual), checklist de tareas y proveedor/técnico asignado; complementa el preventivo de Línea Blanca (RF-LB-03).
- **RF-INC-10** **Órdenes de trabajo (OT)**: el scheduler genera OT desde los planes por vencer; cada OT consume una visita programada y su registro de ejecución (checklist completado, fotos, costo, resultado); al costo se le sugiere asiento de gasto en Contabilidad (como RF-O5).

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id | pk | auto |
| cat | enum | catálogo |
| urg | enum | Alta/Media/Baja |
| titulo | texto | obligatorio |
| por | fk cliente | opcional (puede reportar admin) |
| inm | fk inmueble | obligatorio |
| estado | enum | Reportada / Presupuesto / Asignada / En ejecución / Cerrada |
| fecha | fecha | reporte |
| tecnico / proveedor | texto/fk | requerido en `Asignada+` |
| costo | número | opcional · **requerido si hubo ejecución** |
| timeline | array | append-only `{f,t,c}` |
| **fechaCierre / fotos / slaDue** **[P]** | fecha/array/fecha | para trazabilidad y SLA |
| **checklist** **[P]** | array | `{tarea, hecho}` (OT de mantenimiento preventivo) |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver (lista, ficha, costos, timeline) | `incidencias.leer` |
| Reportar | `incidencias.crear` (y `clientes.read` / `inmuebles.read` para seleccionar) |
| Asignar | `incidencias.asignar` |
| Registrar presupuesto/costo | `incidencias.registrar_costo` |
| Cerrar | `incidencias.cerrar` |
| Programar visitas | `incidencias.visitas.programar` |
| Gestionar planes de mantenimiento preventivo | `incidencias.planes.gestionar` |

## 5. Restricciones de datos (RD)

- **RD-INC-01** `titulo`, `cat`, `urg`, `inm` obligatorios; estado inicial siempre `Reportada`.
- **RD-INC-02** `tecnico` requerido para moverse a `Asignada` o `En ejecución`.
- **RD-INC-03** Si la incidencia llegó a `En ejecución` o `Presupuesto` con costo, **cerrar requiere registrar el costo** (o motivo de costo nulo). `[DECISIÓN: costo 0 permitido si el proveedor no cobró]`
- **RD-INC-04** Timeline **inmutable**: solo agrega eventos; las correcciones se registran como nuevo evento (nunca se edita el pasado).
- **RD-INC-05** Una `Cerrada` **no se reabre**; se crea una nueva incidencia referenciando la anterior. `[DECISIÓN: global #7 — ¿reapertura con motivo para casos de recaída?]`
- **RD-INC-06** Un `PlanMantenimiento` exige inmueble, recurrencia y checklist no vacío; las OT comparten el folio de la incidencia; solo el inmueble `Disponible`, `Alquilado` o `Reservado` admite preventivo (obra/mantención usa incidencia de obra en `En mantenimiento`).

## 6. Restricciones de flujo (FL)

- **FL-INC-01** Transiciones: `Reportada → Presupuesto` (costo estimado) · `Reportada → Asignada` (sin presupuesto si urgencia Alta o costo umbral < configurado `[DECISIÓN: global #8 — umbral B/. 100 como default]`) · `Presupuesto → Asignada` (aprobado) · `Asignada → En ejecución` · `En ejecución → Cerrada` (requiere permiso cerrar + costo).
- **FL-INC-02** Cualquier transición registra automáticamente el timeline con actor, fecha y estado resultante.
- **FL-INC-03** Al cerrar: si hay un proveedor con costo, se **sugiere crear la entrada en Línea blanca** (mantenimiento correctivo) cuando la incidencia es de un equipo `[DECISIÓN: asociación opcional]`.
- **FL-INC-04** Si el ocupante reporta y el inmueble está `En mantenimiento`, la incidencia se marca como obra/administración de inmueble (no inquilino).
- **FL-INC-05** Mantenimiento preventivo: el scheduler genera OT **N días antes** de la próxima fecha del plan (configurable); al registrarse la visita se dispara la notificación al ocupante/técnico (RN-N2); al completar el checklist con costo, se sugiere el asiento de gasto (integración Contabilidad).

## 7. Casos de uso (CU)

- **CU-INC-01 Reportar incidencia.** Precond: `incidencias.crear`. Resultado: `Reportada` con timeline inicial.
- **CU-INC-02 Presupuestar / aprobar costo.** Precond: `incidencias.registrar_costo`. Resultado: estado `Presupuesto` con costo.
- **CU-INC-03 Asignar proveedor.** Precond: `incidencias.asignar`. Resultado: `Asignada`, técnico fijado, notificación.
- **CU-INC-04 Ejecutar y cerrar.** Precond: `incidencias.cerrar` (+ costo si hubo). Resultado: `Cerrada`, timeline completo, sugerencia a Línea blanca.
- **CU-INC-05 Programar visita.** Precond: `incidencias.visitas.programar`. Resultado: visita con fecha/hora y notificación.
- **CU-INC-06 Consultar timeline y costos.** Precond: `incidencias.leer`.
- **CU-INC-07 Crear plan de mantenimiento preventivo.** Precond: `incidencias.planes.gestionar`. Resultado: plan con recurrencia y checklist; el scheduler agenda las OT.
- **CU-INC-08 Ejecutar OT preventiva.** Precond: `incidencias.visitas.programar` + checklist. Resultado: checklist completado, fotos, costo y sugerencia de asiento de gasto.

## 8. Resumen en dashboard

Widget **Incidencias**: Abiertas 4 (no cerradas) · Cerradas 1 · En ejecución 1 · Sin asignar 1 · Visitas 2 (permiso: `incidencias.leer`). Es el caso del coordinador con proveedores.

## 9. Dependencias con otros módulos

- `Inmuebles` — inmueble afectado (obligatorio).
- `Clientes` — opcional: quien reporta la incidencia.
- `Línea blanca` — sugerencia de mantenimiento correctivo al cerrar si el equipo está registrado.
- `Contabilidad` — costo de mantenimiento como gasto (asiento borrador, vía `incidencias.registrar_costo`).

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #7) | ¿Reabrir incidencias cerradas (recaída) o crear nueva referenciada? |
| D2 (global #8) | ¿Umbral de presupuesto para asignar sin pasar por Presupuesto? (default B/. 100) |
| D3 | ¿Costo 0 permitido al cerrar si el proveedor no cobró? |
| D4 | Incidencia de equipo: ¿asociación opcional con Línea blanca al cerrar? |
| D5 | Mantenimiento preventivo: ¿plan por **servicio/categoría** con templates de checklist reutilizables o checklist libre por plan? (recomendado: templates por servicio) |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §6. | Equipo de diseño |
| 1.1 | 18/09/2026 | **Mantenimiento preventivo planificado de inmuebles** (RF-INC-09…10): planes con recurrencia y checklist, OT generadas por el scheduler y avisos. Permiso `incidencias.planes.gestionar` **[P]**, flag `features.mant-preventivo`, tabla `PlanMantenimiento`. | Equipo de diseño |

---

*Fin del documento del módulo de Incidencias v1.0.*