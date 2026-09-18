# Módulo de Liquidaciones

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 5 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §11 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `finances` (liquidaciones, pago a propietario) |
| **Feature flag** | `features.liquidaciones` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `liquidaciones.generar` · `liquidaciones.confirmar` · `liquidaciones.consultar` **[P]** · `liquidaciones.anular` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Liquidar a propietarios el ingreso neto (ingreso cobrado − comisión) en contratos de administración.

## 2. Requisitos funcionales

- **RF-LIQ-01** Generar liquidación por **contrato de Administración + período**: base = ingresos **cobrados** del período (no los emitidos).
- **RF-LIQ-02** Cálculo: `neto = ingreso − comisión` (comisión del contrato).
- **RF-LIQ-03** Estados: `Pendiente`, `Pagado`, `Anulado`.
- **RF-LIQ-04** Confirmar pago (método, fecha) y consultar historial.
- **RF-LIQ-05** Anulación de una liquidación Pendiente que libera el período para regenerar.

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id / ret | pk / texto | ret única `LIQ-YYYY-NNN` |
| prop / inm | fk | del contrato de administración |
| periodo | texto | único por contrato |
| ingreso | número | derivado de recibos cobrados del período |
| comision | % / número | del contrato |
| neto | número | `ingreso − comision` (validado) |
| estado | enum | Pendiente / Pagado / Anulado |
| pago | fecha | requerida para Pagado |
| **refRecibos / metodo** **[P]** | array/texto | fuentes del ingreso |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Generar | `liquidaciones.generar` |
| Confirmar pago | `liquidaciones.confirmar` |
| Consultar / exportar | `liquidaciones.consultar` (exportar con `reportes.ver`) |
| Anular | `liquidaciones.anular` |

## 5. Restricciones de datos (RD)

- **RD-LIQ-01** `neto = ingreso − comision`; `ingreso` es **derivado** de recibos `Pagado` del período (no incluye Emitido/En mora).
- **RD-LIQ-02** Unicidad `(contrato, periodo)`.
- **RD-LIQ-03** No se confirma una `Anulada`; no se anula una `Pagada`.
- **RD-LIQ-04** Comisión debe estar dentro del rango configurado del contrato.

## 6. Restricciones de flujo (FL)

- **FL-LIQ-01** `Pendiente → Pagado` (confirmar con fecha/método) · `Pendiente → Anulado` (liberar → regenerable) · nunca `Pagado → Anulado`.
- **FL-LIQ-02** La generación requiere que al menos un recibo fuente esté `Pagado`; si no, la liquidación del período no existe (o aparece con `ingreso = 0` y se oculta por defecto). `[DECISIÓN: global #6 — ¿ocultar vs mostrar 0?]`
- **FL-LIQ-03** El pago de liquidación genera un asiento de egreso (caja) en Contabilidad (borrador pendiente de aprobar).

## 7. Casos de uso (CU)

- **CU-LIQ-01 Generar liquidación.** Precond: `liquidaciones.generar`, hay recibos cobrados. Resultado: `Pendiente` con neto calculado.
- **CU-LIQ-02 Confirmar pago a propietario.** Precond: `liquidaciones.confirmar`. Resultado: `Pagado` + historial.
- **CU-LIQ-03 Anular y regenerar.** Precond: `liquidaciones.anular` (solo Pendiente). Resultado: período liberado.
- **CU-LIQ-04 Consultar estados por período/propietario.** Precond: `liquidaciones.consultar`.

## 8. Resumen en dashboard

Widget **Liquidaciones**: Emitidas 3 · Pagadas 2 · Pendiente B/.1,520 (permiso: `liquidaciones.confirmar` o `liquidaciones.consultar`).

## 9. Dependencias con otros módulos

- `Contratos` — contratos de Administración (comisión, período).
- `Cobros` — ingreso cobrado del período (recibos `Pagado`).
- `Contabilidad` — asiento de egreso (caja) borrador al confirmar pago.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #6) | ¿La liquidación con ingreso 0 se oculta o se muestra? |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §5. | Equipo de diseño |

---

*Fin del documento del módulo de Liquidaciones v1.0.*