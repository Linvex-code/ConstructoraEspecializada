# Módulo de Cobros

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 18/09/2026 |
| **Estado** | Documento oficial del módulo v1.1 — incorpora **pagos en línea** (RF-COB-08), **débito automático ACH** (RF-COB-09) y **conciliación semi-automática** (RF-COB-10) |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 4 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §11/§18/§22 · `docs/modulos/README.md` (v1.1) |
| **Esquema BD (referencia)** | `finances` (recibos, pagos, `PagoElectronico`, `MandatoACH`) |
| **Feature flag** | `features.cobros` · `features.pagos-en-linea` · `features.debito-ach` · `features.conciliacion` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `cobros.recibos.generar` · `cobros.recibos.anular` **[P]** · `cobros.pagos.registrar` · `cobros.pagos.en-linea` **[P]** · `cobros.pagos.reembolsar` **[P]** · `cobros.mora.consultar` |

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
- **RF-COB-08** **Pago en línea** desde el portal del inquilino: tarjeta, **Yappy** o **ACH** mediante pasarela **PCI-DSS** (proveedor detrás de `IPaymentProvider`, port-adapter — ADR-019). Estados `Solicitado → Autorizado → Completado / Fallido / Reembolsado`; el recibo pasa a `Pagado` **solo** en `Completado`.
- **RF-COB-09** **Débito automático (mandato ACH)**: el inquilino autoriza débitos recurrentes del canon; aviso previo configurable N días; manejo de rechazos/reversos y cancelación del mandato.
- **RF-COB-10** **Conciliación semi-automática**: cruce de movimientos bancarios descargados contra pagos registrados; emparejamiento `Pendiente → Emparejado → Confirmado`; descuadres quedan visibles para revisión.

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
| **idTx / pasarela** **[P]** | texto | id de transacción y proveedor (pago en línea) |
| **mandatoAch** **[P]** | fk | mandato activo del inquilino (débito automático) |
| **concEmparejado** **[P]** | enum | Pendiente / Emparejado / Confirmado (conciliación) |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Generar recibos | `cobros.recibos.generar` |
| Anular recibo | `cobros.recibos.anular` |
| Registrar pago | `cobros.pagos.registrar` |
| Pagar en línea (inquilino) | `cobros.pagos.en-linea` (portal, vía `portal.ver`) |
| Reembolsar pago | `cobros.pagos.reembolsar` |
| Consultar mora | `cobros.mora.consultar` |
| Ver listado | `cobros.recibos.generar` o `cobros.mora.consultar` (OR) |

Débito ACH y conciliación se rigen por `features.debito-ach` y `features.conciliacion`; el pago en línea por `features.pagos-en-linea` (RN-S01: flag + permiso + regla).

## 5. Restricciones de datos (RD)

- **RD-COB-01** Un recibo por `(contrato, período)` (unique compuesto).
- **RD-COB-02** `monto > 0`; `vence` derivado del contrato; `mor` derivado (`hoy − vence` si Emitido/En mora sin pago).
- **RD-COB-03** `En mora` es **derivado**: recibo Emitido con `vence < hoy` → pasa a `En mora`. Nunca editable.
- **RD-COB-04** ITBMS: solo si el contrato lo define; se propaga de Contratos.
- **RD-COB-05** Al anular: el recibo deja de impactar ingresos; no se reutiliza el folio.
- **RD-COB-06** Un pago en línea `Completado` cierra el recibo de forma **inmutable** (como el pago manual); un reembolso genera **asiento de reversión** y una nueva versión del comprobante, nunca reescritura (RN-F3).
- **RD-COB-07** `idTx` único por pasarela (idempotencia); no se reutiliza para otro pago.
- **RD-COB-08** El mandato ACH exige **consentimiento del titular con fecha y versión** (Ley 81/2019) y vigencia propia.

## 6. Restricciones de flujo (FL)

- **FL-COB-01** Transiciones: `Emitido → Pagado` (fecha pago requerida) · `Emitido → En mora` (automático) · `En mora → Pagado` (normal) · `Emitido → Anulado` (solo no pagado) · `En mora → Anulado` (gestión de cartera `[DECISIÓN: ¿requiere motivo + supervisor?]`).
- **FL-COB-02** Al pagar: actualiza **contrato** (limpia Mora) y **cliente** (limpia Mora). Los recibos generados por el periodo actualizan el estado.
- **FL-COB-03** Al generar recibos del período: el contrato pasa a reflejar el canon facturado; si el período está prorrateado (contrato terminado a mitad), se genera recibo proporcional con notas. `[DECISIÓN: fórmula de prorrateo = (canon/díasMes)×díasVigentes — validar]`
- **FL-COB-04** El registro de pago genera un **asiento de caja pendiente de aprobación** en Contabilidad (integración), no un asiento directo. `[DECISIÓN: ¿automático o manual? Recomendado: automático como borrador.]`
- **FL-COB-05** Pago en línea: `Solicitado → Autorizado` (pasarela) → `Completado` (recibo `Pagado` + asiento) · `Autorizado → Fallido` (reintento opcional, idempotente) · `Completado → Reembolsado` (exige `cobros.pagos.reembolsar` + motivo).
- **FL-COB-06** Débito ACH: mandato activo → el scheduler intenta el cargo el día configurado (default: día de vencimiento menos N); éxito = `Pagado` + asiento; rechazo = notificación + recibo `En mora`.
- **FL-COB-07** Conciliación: `Pendiente → Emparejado` (sugerencia automática) → `Confirmado`; al confirmar se vincula el movimiento al recibo correspondiente.

## 7. Casos de uso (CU)

- **CU-COB-01 Generar recibos del período.** Precond: `cobros.recibos.generar`. Resultado: N recibos `Emitido` por contratos vigentes; error si `(contrato, periodo)` ya existe.
- **CU-COB-02 Registrar pago.** Precond: `cobros.pagos.registrar`. Pasos: recibo → método → guardar. Resultado: `Pagado`, comprobante opcional, contrato/cliente limpian Mora.
- **CU-COB-03 Anular recibo.** Precond: `cobros.recibos.anular` + motivo. Resultado: `Anulado` (si no pagado).
- **CU-COB-04 Consultar mora.** Precond: `cobros.mora.consultar`. Resultado: listado por días de mora/importe, exportable con `reportes.ver`.
- **CU-COB-05 Cobrar en ventanilla.** Precond: `cobros.pagos.registrar`. Resultado: pago inmediato + comprobante.
- **CU-COB-06 Pagar en línea.** Precond: inquilino autenticado (`portal.ver` + `cobros.pagos.en-linea`) / admin con `cobros.pagos.registrar`. Resultado: `Completado`, recibo `Pagado`, comprobante y asiento.
- **CU-COB-07 Reembolsar pago.** Precond: `cobros.pagos.reembolsar` + motivo. Resultado: reversión, contracargo contable y nueva versión del comprobante.
- **CU-COB-08 Conciliar pagos.** Precond: `cobros.pagos.registrar` + flag `features.conciliacion`. Resultado: movimientos emparejados y confirmados.

## 8. Resumen en dashboard

Widget **Cobros**: Recibos 7 · Pagados 3 · Emitidos 2 · Por cobrar B/.3,392 (permiso: `cobros.recibos.generar` o `cobros.mora.consultar`).

## 9. Dependencias con otros módulos

- `Contratos` — fuente de canon/ITBMS/`dia`/periodicidad.
- `Clientes` — actualización de estado de mora al pagar/vencer.
- `Contabilidad` — genera asiento de caja (ingreso) como borrador pendiente de aprobación.
- `Notificaciones` — aviso previo de débito, éxito/fallo del pago en línea y reembolsos (RN-N1).
- `Reportes` — mora exportable con `reportes.ver`.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #5) | ¿Pagos parciales permitidos? (recomendado: NO en v1; cuotas como recibos separados) |
| D2 | ¿Anular recibo `En mora` requiere motivo + supervisor? |
| D3 | ¿Fórmula de prorrateo confirmada: `(canon/díasMes)×díasVigentes`? |
| D4 | Asiento de caja: ¿automático como borrador (recomendado) o manual? |
| D5 | Pasarela de pagos concreta (Yappy/ACH/tarjeta) y proveedor `IPaymentProvider` — a confirmar (port-adapter, ADR-019) |
| D6 | ¿Reembolso automático al inquilino o según política? (default: exigir motivo + aprobación `cobros.pagos.reembolsar`) |
| D7 | ¿Conciliación semi-automática en Fase 2 o junto a la conciliación contable formal (Fase 3)? |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §4. | Equipo de diseño |
| 1.1 | 18/09/2026 | **Pagos en línea** (RF-COB-08), **débito automático ACH** (RF-COB-09) y **conciliación semi-automática** (RF-COB-10). Permisos `cobros.pagos.en-linea` **[P]** y `cobros.pagos.reembolsar` **[P]**; tablas `PagoElectronico` y `MandatoACH`; flags `features.pagos-en-linea`/`features.debito-ach` (ADR-019). | Equipo de diseño |

---

*Fin del documento del módulo de Cobros v1.0.*