# Módulo de Cobros

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 4 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §11 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `finances` (recibos, pagos) |
| **Feature flag** | `features.cobros` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `cobros.recibos.generar` · `cobros.recibos.anular` **[P]** · `cobros.pagos.registrar` · `cobros.mora.consultar` |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Emitir y gestionar recibos de canon, registrar pagos y controlar la mora.

## 2. Requisitos funcionales

- **RF-COB-01** **Generación masiva** de recibos por período a partir de contratos vigentes (canon + ITBMS + servicios), con unicidad `contrato × período`.
- **RF-COB-02** Generación individual de recibo.
- **RF-COB-03** Registrar pago (total; parcial `[DECISIÓN: global #5 — recomendado NO en v1]`), con fecha, método y comprobante opcional `CRE-…`.
- **RF-COB-04** Estados: `Emitido`, `Pagado`, `En mora` (derivado), `Anulado`.
- **RF-COB-05** **Mora automática** por vencimiento (día de mora calculado); consulta de mora por período.
- **RF-COB-06** Anulación de recibo (solo si no está pagado) con motivo.
- **RF-COB-07** Conciliación bancaria de pagos `[P]`. Nota: la caja diaria y la conciliación formal viven en Contabilidad (asientos), aquí se registra el cobro.

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id / folio | pk / texto | folio único `REC-YYYY-NNNN` |
| inquilino / inm | fk | del contrato |
| periodo | texto | `Septiembre 2026` |
| vence | fecha | del `dia` del contrato |
| monto | número | > 0 · canon+ITBMS+servicios |
| estado | enum | Emitido / Pagado / **En mora (derivado)** / Anulado |
| pago | fecha | requerida para Pagado |
| mor | número | días de mora (derivado) |
| itbms | texto | opcional |
| comp | texto | comprobante opcional |
| **metodo / notas** **[P]** | enum/texto | método de pago |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Generar recibos | `cobros.recibos.generar` |
| Anular recibo | `cobros.recibos.anular` |
| Registrar pago | `cobros.pagos.registrar` |
| Consultar mora | `cobros.mora.consultar` |
| Ver listado | `cobros.recibos.generar` o `cobros.mora.consultar` (OR) |

## 5. Restricciones de datos (RD)

- **RD-COB-01** Un recibo por `(contrato, período)` (unique compuesto).
- **RD-COB-02** `monto > 0`; `vence` derivado del contrato; `mor` derivado (`hoy − vence` si Emitido/En mora sin pago).
- **RD-COB-03** `En mora` es **derivado**: recibo Emitido con `vence < hoy` → pasa a `En mora`. Nunca editable.
- **RD-COB-04** ITBMS: solo si el contrato lo define; se propaga de Contratos.
- **RD-COB-05** Al anular: el recibo deja de impactar ingresos; no se reutiliza el folio.

## 6. Restricciones de flujo (FL)

- **FL-COB-01** Transiciones: `Emitido → Pagado` (fecha pago requerida) · `Emitido → En mora` (automático) · `En mora → Pagado` (normal) · `Emitido → Anulado` (solo no pagado) · `En mora → Anulado` (gestión de cartera `[DECISIÓN: ¿requiere motivo + supervisor?]`).
- **FL-COB-02** Al pagar: actualiza **contrato** (limpia Mora) y **cliente** (limpia Mora). Los recibos generados por el periodo actualizan el estado.
- **FL-COB-03** Al generar recibos del período: el contrato pasa a reflejar el canon facturado; si el período está prorrateado (contrato terminado a mitad), se genera recibo proporcional con notas. `[DECISIÓN: fórmula de prorrateo = (canon/díasMes)×díasVigentes — validar]`
- **FL-COB-04** El registro de pago genera un **asiento de caja pendiente de aprobación** en Contabilidad (integración), no un asiento directo. `[DECISIÓN: ¿automático o manual? Recomendado: automático como borrador.]`

## 7. Casos de uso (CU)

- **CU-COB-01 Generar recibos del período.** Precond: `cobros.recibos.generar`. Resultado: N recibos `Emitido` por contratos vigentes; error si `(contrato, periodo)` ya existe.
- **CU-COB-02 Registrar pago.** Precond: `cobros.pagos.registrar`. Pasos: recibo → método → guardar. Resultado: `Pagado`, comprobante opcional, contrato/cliente limpian Mora.
- **CU-COB-03 Anular recibo.** Precond: `cobros.recibos.anular` + motivo. Resultado: `Anulado` (si no pagado).
- **CU-COB-04 Consultar mora.** Precond: `cobros.mora.consultar`. Resultado: listado por días de mora/importe, exportable con `reportes.ver`.
- **CU-COB-05 Cobrar en ventanilla.** Precond: `cobros.pagos.registrar`. Resultado: pago inmediato + comprobante.

## 8. Resumen en dashboard

Widget **Cobros**: Recibos 7 · Pagados 3 · Emitidos 2 · Por cobrar B/.3,392 (permiso: `cobros.recibos.generar` o `cobros.mora.consultar`).

## 9. Dependencias con otros módulos

- `Contratos` — fuente de canon/ITBMS/`dia`/periodicidad.
- `Clientes` — actualización de estado de mora al pagar/vencer.
- `Contabilidad` — genera asiento de caja (ingreso) como borrador pendiente de aprobación.
- `Reportes` — mora exportable con `reportes.ver`.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #5) | ¿Pagos parciales permitidos? (recomendado: NO en v1; cuotas como recibos separados) |
| D2 | ¿Anular recibo `En mora` requiere motivo + supervisor? |
| D3 | ¿Fórmula de prorrateo confirmada: `(canon/díasMes)×díasVigentes`? |
| D4 | Asiento de caja: ¿automático como borrador (recomendado) o manual? |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §4. | Equipo de diseño |

---

*Fin del documento del módulo de Cobros v1.0.*