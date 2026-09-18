# Módulo de Contabilidad

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 — resume el diseño funcional de `docs/ui/requerimientos-modulos.md` §8; el detalle completo del módulo vive en `docs/modulo-contabilidad.md` (v1.0) |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 8 |
| **Documentos relacionados** | `docs/modulo-contabilidad.md` (v1.0) · `docs/diseno-arquitectura.md` (v1.1) — §15 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `accounting` |
| **Feature flags** | `features.contabilidad` · `features.conciliacion` (definidos en `docs/diseno-arquitectura.md` §18) |
| **Permisos del catálogo** | `contabilidad.plan-cuentas.editar` · `contabilidad.asientos.crear` · `contabilidad.asientos.aprobar` · `contabilidad.cierres.ejecutar` · `contabilidad.impuestos.registrar` **[P]** · `contabilidad.activos.editar` **[P]** · `conciliacion` · `estados-financieros.ver` |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.
> ⚠️ **Marco panameño**: requiere validación con **CPA y asesor legal** antes de implementar reglas fiscales (ver `docs/modulo-contabilidad.md`).

---

## 1. Objetivo

Contabilidad integral de la administración: plan de cuentas, partida doble, cierres, conciliación, impuestos, activos fijos y estados financieros.

## 2. Requisitos funcionales

- **RF-CTB-01** **Plan de cuentas** jerárquico (grupos y cuentas) con naturaleza (deudora/acreedora) y balance.
- **RF-CTB-02** **Asientos** de partida doble: crear borrador, editar borrador, aprobar. Separación: **el que crea no aprueba**.
- **RF-CTB-03** **Cierres mensuales**: único por período; abrir/cerrar período.
- **RF-CTB-04** **Conciliación bancaria** por cuenta y período.
- **RF-CTB-05** **Impuestos**: ITBMS recaudado por declarar / declarado / pagado.
- **RF-CTB-06** **Activos fijos** `[P]`.
- **RF-CTB-07** **Estados financieros** por período: EF, Resultados, Balanza; para períodos cerrados (o provisional con marca).
- **RF-CTB-08** Integración: cobros y liquidaciones generan **asientos borrador** (caja) pendientes de aprobar.

## 3. Campos (resumen)

| Submódulo | Entidad | Reglas clave |
|---|---|---|
| Plan | cuenta `{code, name, type:(g/a), nature:(D/C), bal, children}` | jerárquica · códigos únicos |
| Asientos | `{num, fecha, ref, items:[{cuenta, debe, haber}], estado}` | **debe = haber** |
| Cierres | `{periodo, estado, fecha}` | único por periodo |
| Conciliación | `{banco, periodo, dif, estado}` | única por banco+periodo |
| Impuestos | `{tipo, periodo, monto, estado}` | ITBMS según recibos con itbms |
| Activos fijos | `{codigo, nombre, fecha, costo, depreciacion}` | catálogo simple |

> Modelo de datos completo (esquema `accounting`) en `docs/modulo-contabilidad.md` §8.

## 4. Permisos

| Acción | Permiso |
|---|---|
| Editar plan | `contabilidad.plan-cuentas.editar` |
| Crear asiento (borrador) | `contabilidad.asientos.crear` |
| Aprobar asiento | `contabilidad.asientos.aprobar` |
| Cierre mensual | `contabilidad.cierres.ejecutar` |
| Conciliación | `conciliacion` |
| Impuestos / activos | `contabilidad.impuestos.*` / `contabilidad.activos.*` |
| Ver EF | `estados-financieros.ver` |

## 5. Restricciones de datos (RD)

- **RD-CTB-01** Todo asiento **balanceado**: suma débitos = suma créditos. No se guarda borrador desbalanceado (valida al guardar).
- **RD-CTB-02** Un cierre por período; un período cerrado **no admite asientos nuevos** (excepto reversión aprobada con motivo, periodo abierto de nuevo).
- **RD-CTB-03** Conciliación única por banco+período; con diferencia solo si está marcada como en proceso.
- **RD-CTB-04** EF solo de períodos cerrados, salvo marca `provisional` visible solo con permiso de EF.
- **RD-CTB-05** Asiento aprobado es **inmutable** (toda corrección = asiento de reversión aprobado).

## 6. Restricciones de flujo (FL)

- **FL-CTB-01** Asiento: `Borrador → (editable) → Aprobado → registrado`; aprobación por usuario con `contabilidad.asientos.aprobar` distinto del creador (salvo Admin con TODOS).
- **FL-CTB-02** Cierre mensual requiere: todos los asientos del período aprobados **y** conciliación del período terminada `[DECISIÓN: global #9 — ¿bloquear cierre si no conciliado? Sí, recomendado]`.
- **FL-CTB-03** Los cobros generan asiento borrador de ingreso; la liquidación pagada genera asiento borrador de egreso. Ambos esperan aprobación.
- **FL-CTB-04** Impuesto ITBMS: se calcula de los recibos con `itbms` cobrados del período; `Pendiente` → `Declarado` → `Pagado` (con fecha).

## 7. Casos de uso (CU)

- **CU-CTB-01 Crear y aprobar asiento.** Precond: `contabilidad.asientos.crear` (crear), `contabilidad.asientos.aprobar` (aprobar, diferente usuario). Resultado: asiento registrado.
- **CU-CTB-02 Ejecutar cierre mensual.** Precond: `contabilidad.cierres.ejecutar`, todas las condiciones de FL-CTB-02. Resultado: período cerrado, EF disponibles.
- **CU-CTB-03 Conciliar banco.** Precond: `conciliacion`.
- **CU-CTB-04 Ver EF por período.** Precond: `estados-financieros.ver`.
- **CU-CTB-05 Declarar/pagar ITBMS.** Precond: `contabilidad.impuestos.*`.
- **CU-CTB-06 Ajustar plan de cuentas.** Precond: `contabilidad.plan-cuentas.editar`.

## 8. Resumen en dashboard

Widget **Contabilidad**: Utilidad del mes (EF Resultados, **B/.88,590** en mock) · ITBMS por declarar · Cierre pendiente (permiso: `estados-financieros.ver` o `contabilidad.*`).

## 9. Dependencias con otros módulos

- `Cobros` y `Liquidaciones` — generan **asientos borrador** (caja) al pagar (FL-CTB-03).
- `Incidencias` / `Línea blanca` — gastos de mantenimiento y activos fijos (vía `docs/diseno-arquitectura.md` §15).
- `Reportes` — estados financieros y reportes contables (permiso fuente por tipo).

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #9) | ¿El cierre contable se bloquea si el banco no está conciliado? (recomendado: Sí) |
| D2 (global #12) | ¿La separación de funciones (crear ≠ aprobar) aplica también en cobros/contratos? |

> Para el detalle del marco panameño (ISR, ITBMS 7%, retenciones, cierres parametrizables) y el cuestionario de adaptación, ver `docs/modulo-contabilidad.md`.

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §8. Vincula al detalle completo de `docs/modulo-contabilidad.md` (v1.0). | Equipo de diseño |

---

*Fin del documento del módulo de Contabilidad v1.0.*