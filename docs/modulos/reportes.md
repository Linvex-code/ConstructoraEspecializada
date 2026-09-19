# Módulo de Reportes

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 18/09/2026 |
| **Estado** | Documento oficial del módulo v1.1 — incorpora **KPIs ejecutivos** (RF-REP-06) y **analítica** (RF-REP-07): score de morosidad y sugerencia de canon |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 9 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §19/§21/§22 · `docs/modulos/README.md` (v1.1) |
| **Esquema BD (referencia)** | `reports` (vistas materializadas + tablas de reporting y métricas KPI) |
| **Feature flag** | `features.reportes` · `features.kpis` · `features.analitica` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `reportes.ver` · `reportes.generar` **[P]** · `reportes.kpis.ver` **[P]** · `analitica.ver` **[P]** (+ permiso fuente del tipo de reporte) |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.
> Regla clave: **los reportes financieros exigen su permiso fuente, no solo `reportes.ver`**.

---

## 1. Objetivo

Generar, consultar y exportar reportes operativos y financieros según permisos.

## 2. Requisitos funcionales

- **RF-REP-01** Catálogo de reportes: estado de cuenta, mora, ocupación, incidencias, liquidaciones, ingresos y EF.
- **RF-REP-02** Generación bajo demanda con filtros (período, cliente, inmueble) y formato (PDF/CSV/Excel).
- **RF-REP-03** Programación de reportes periódicos `[P]`.
- **RF-REP-04** Historial de generación (quién, cuándo, qué filtros, resultado).
- **RF-REP-05** **Permisos por tipo**: los reportes financieros exigen su permiso fuente, no solo `reportes.ver`.
- **RF-REP-06** **KPIs ejecutivos** (dashboard): ocupación, rentabilidad por inmueble/propietario, cartera por antigüedad (aging), flujo de caja proyectado; sobre vistas materializadas del esquema `reports` (objetivo < 2 s).
- **RF-REP-07** **Analítica** v1: **score de morosidad** (probabilidad de no pago) y **sugerencia de canon** por comparables internos; reglas **parametrizables y versionadas**, sin ML en v1 `[DECISIÓN: modelo ML en Fase 4]`; toda salida se marca como **estimación**, nunca como regla contractual.

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id / tipo | pk / enum | catálogo |
| filtros | json | período, cliente, inmueble |
| formato | enum | PDF/CSV/Excel |
| usuario / fecha | fk/fecha | autogenerado |
| estado | enum | Pendiente / Listo / Error |
| url | texto | archivo generado |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver/consultar | `reportes.ver` **+ permiso fuente del tipo** (p.ej. financieros requieren `estados-financieros.ver`) |
| Ver KPIs ejecutivos | `reportes.kpis.ver` **+ permiso fuente de cada métrica** |
| Ver analítica (score morosidad / sugerencia de canon) | `analitica.ver` **+ permiso fuente** |
| Generar bajo demanda / programar | `reportes.generar` **+ permiso fuente** |

KPIs y analítica se rigen además por `features.kpis` y `features.analitica` (RN-S01).

## 5. Restricciones de datos (RD)

- **RD-REP-01** Un usuario solo ve los tipos de reporte permitidos por sus permisos: **los financieros nunca llegan a Operaciones/Mant. ni Solo lectura**.
- **RD-REP-02** La exportación hereda el permiso del consultor (no permite "bajar el Excel" sin ver).
- **RD-REP-03** Historial inmodificable (append-only).
- **RD-REP-04** Los KPIs y la analítica son **estimaciones derivadas** (no fuente de verdad): nunca modifican recibos, contratos ni saldos; los comparables de canon excluyen unidades `En mantenimiento` o sin historial mínimo.
- **RD-REP-05** El score de morosidad se recalcula por lote (scheduler, bandera) o demanda autorizada; su versión de reglas queda registrada junto al resultado.

## 6. Restricciones de flujo (FL)

- **FL-REP-01** `Pendiente (bajo demanda) → Listo` con archivo; error visible con trazabilidad.
- **FL-REP-02** Programado: `Programado → Pendiente → Listo` según cron.
- **FL-REP-03** Ningún resultado se cachea sin incluir el contexto de permisos del que lo generó (caché por rol).
- **FL-REP-04** KPI/analítica: cálculo bajo demanda o periódico; las salidas se marcan con fecha y versión de reglas; un fallo de fuente (módulo apagado por kill-switch) degrada el KPI afectado sin bloquear el resto (ADR-016/017).

## 7. Casos de uso (CU)

- **CU-REP-01 Generar reporte de mora.** Precond: `reportes.ver` + `cobros.mora.consultar`. Resultado: PDF/CSV con el listado visible.
- **CU-REP-02 Generar EF.** Precond: `reportes.ver` + `estados-financieros.ver`.
- **CU-REP-03 Programar reporte de ocupación.** Precond: `reportes.generar` + `inmuebles.read`.
- **CU-REP-04 Consultar historial.** Precond: `reportes.ver`.
- **CU-REP-05 Consultar KPIs ejecutivos.** Precond: `reportes.kpis.ver` + permiso fuente por métrica.
- **CU-REP-06 Consultar score de morosidad / sugerencia de canon.** Precond: `analitica.ver` + permiso fuente. Resultado: estimación con fecha y versión de reglas.

## 8. Resumen en dashboard

Widget **Reportes**: Reportes del mes · Programados (permiso: `reportes.ver`).

## 9. Dependencias con otros módulos

- **Consume datos de todos los módulos** (Clientes, Inmuebles, Contratos, Cobros, Liquidaciones, Incidencias, Línea blanca, Contabilidad).
- Cada tipo de reporte exige **el permiso fuente del módulo** (contable → `estados-financieros.ver`, mora → `cobros.mora.consultar`, etc.).

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 | ¿La generación en background (cola/scheduler) debe ser sincrónica o asíncrona para reportes pesados? (diseño actual: `Pendiente → Listo`) |
| D2 | ¿Programación de reportes periódicos forma parte de la v1? (campo `[P]`) |
| D3 | KPIs: ¿métricas contables (rentabilidad) visibles con `reportes.kpis.ver` + `estados-financieros.ver`, o solo gerencia? |
| D4 (global) | Analítica v1 sin ML: ¿los modelos predictivos (score/canon) se planifican para Fase 4? (recomendado: sí) |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §9. | Equipo de diseño |
| 1.1 | 18/09/2026 | **KPIs ejecutivos** (RF-REP-06) y **analítica v1** (RF-REP-07): score de morosidad y sugerencia de canon con reglas parametrizables (ADR-021). Permisos `reportes.kpis.ver` **[P]** y `analitica.ver` **[P]**; flags `features.kpis` y `features.analitica`. | Equipo de diseño |

---

*Fin del documento del módulo de Reportes v1.0.*