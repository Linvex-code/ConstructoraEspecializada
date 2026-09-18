# Módulo de Reportes

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 9 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §19/§21 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `reports` |
| **Feature flag** | `features.reportes` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `reportes.ver` · `reportes.generar` **[P]** (+ permiso fuente del tipo de reporte) |

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
| Generar bajo demanda / programar | `reportes.generar` **+ permiso fuente** |

## 5. Restricciones de datos (RD)

- **RD-REP-01** Un usuario solo ve los tipos de reporte permitidos por sus permisos: **los financieros nunca llegan a Operaciones/Mant. ni Solo lectura**.
- **RD-REP-02** La exportación hereda el permiso del consultor (no permite "bajar el Excel" sin ver).
- **RD-REP-03** Historial inmodificable (append-only).

## 6. Restricciones de flujo (FL)

- **FL-REP-01** `Pendiente (bajo demanda) → Listo` con archivo; error visible con trazabilidad.
- **FL-REP-02** Programado: `Programado → Pendiente → Listo` según cron.
- **FL-REP-03** Ningún resultado se cachea sin incluir el contexto de permisos del que lo generó (caché por rol).

## 7. Casos de uso (CU)

- **CU-REP-01 Generar reporte de mora.** Precond: `reportes.ver` + `cobros.mora.consultar`. Resultado: PDF/CSV con el listado visible.
- **CU-REP-02 Generar EF.** Precond: `reportes.ver` + `estados-financieros.ver`.
- **CU-REP-03 Programar reporte de ocupación.** Precond: `reportes.generar` + `inmuebles.read`.
- **CU-REP-04 Consultar historial.** Precond: `reportes.ver`.

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

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §9. | Equipo de diseño |

---

*Fin del documento del módulo de Reportes v1.0.*