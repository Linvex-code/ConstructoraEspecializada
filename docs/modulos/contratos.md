# Módulo de Contratos

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 18/09/2026 |
| **Estado** | Documento oficial del módulo v1.1 — incorpora **firma electrónica en plataforma** (RF-CON-07), conforme a la Ley 51 de 2008 de Panamá |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 3 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §10/§22 · `docs/modulos/README.md` (v1.1) |
| **Esquema BD (referencia)** | `contracts` (incluye `ContratoFirma`) |
| **Feature flag** | `features.contratos` · `features.firma-electronica` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `contratos.read` · `contratos.create` **[P]** · `contratos.update` **[P]** · `contratos.firmar` **[P]** · `contratos.firmas.gestionar` **[P]** · `contratos.terminar` **[P]** · `contratos.anular` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Gestionar contratos de arrendamiento y de administración (canon, vigencia, garantía, comisión, ITBMS) y disparar los flujos de cobros y liquidación.

## 2. Requisitos funcionales

- **RF-CON-01** Crear contrato a partir de **cliente + inmueble** con validaciones cruzadas (disponibilidad del inmueble y estado del cliente).
- **RF-CON-02** Tipos: `Arrendamiento` (canon) y `Administración` (comisión % sobre ingreso, canon null).
- **RF-CON-03** Vigencia por fechas (ini/fin), día de facturación (`dia`), garantía (meses/monto), ITBMS configurable (p.ej. 7%).
- **RF-CON-04** Renovación (extensión de fin) y **terminación anticipada** con cálculo de prorrateo y liquidación de depósito `[DECISIÓN: fórmula exacta a definir]`.
- **RF-CON-05** Estados: `Vigente`, `Mora (derivado)`, `Terminado`, `Anulado`.
- **RF-CON-06** Historial de versiones/renovaciones y motivo de terminación.
- **RF-CON-07** **Firma electrónica del contrato en plataforma** (Ley 51 de 2008): la empresa y/o el inquilino firman digitalmente el PDF generado; se registra evidencia completa (**hash del documento, timestamp, IP, consentimiento explícito**); el PDF firmado se archiva en Object Storage y es descargable; anula la necesidad de subir el PDF escaneado (RN-CT7 se mantiene como alternativa).

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id / ref | pk / texto | ref única `ARR-YYYY-NNN` |
| persona | fk cliente | obligatorio · tipo compatible (Arrendamiento: Inquilino/Ambos · Administración: Propietario/Ambos) |
| inm | fk inmueble | obligatorio |
| canon | número | > 0 para Arrendamiento · **null para Administración** |
| moneda | enum | USD (B/.) |
| ini / fin | fecha | fin > ini |
| dia | número | día de facturación (1-28) |
| garantia | texto/número | opcional |
| estado | enum | Vigente / **Mora (derivado)** / Terminado / Anulado |
| tipo | enum | Arrendamiento / Administración |
| comision | % | obligatoria (Administración) · rango configurado |
| itbms | texto | opcional (p.ej. `ITBMS 7%`) |
| **motivoTermino / renovaciones** **[P]** | texto/array | para trazabilidad |
| **firmas** **[P]** | array | `{rol, nombre, fecha, ip, hash, consentimiento}` (firma electrónica) |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver | `contratos.read` |
| Crear / editar | `contratos.create` / `contratos.update` |
| Firmar en plataforma | `contratos.firmar` (empresa e inquilino) |
| Gestionar/revocar firmas | `contratos.firmas.gestionar` |
| Terminar / anular | `contratos.terminar` / `contratos.anular` |

La firma electrónica requiere además el flag `features.firma-electronica` (RN-S01). La **Ley 51 de 2008** (firma electrónica y firmas digitales) debe validarse con asesor legal antes de implementar `(SUPUESTO PA-###)`.

Regla de negocio: **el que crea un contrato no puede anularlo en el mismo día si tiene `contratos.anular`** (auditoría básica de separación). `[DECISIÓN: global #12 — ¿separación de funciones?]`

## 5. Restricciones de datos (RD)

- **RD-CON-01** `fin > ini`; `canon > 0` salvo Administración (null).
- **RD-CON-02** **Un solo contrato `Vigente` por inmueble** (unicidad activa).
- **RD-CON-03** El cliente debe estar `Activo` y su `tipo` compatible con el tipo de contrato.
- **RD-CON-04** `Mora` es derivado de los cobros (recibo vencido sin pago), no editable.
- **RD-CON-05** ITBMS se propaga al cálculo del recibo de canon.
- **RD-CON-06** En firma electrónica, un contrato `Vigente` debe tener **todas las firmas requeridas** o el contrato firmado subido (RN-CT7); la evidencia de firma es **inmutable** (append-only, se agregan firmas, nunca se editan).

## 6. Restricciones de flujo (FL)

- **FL-CON-01** Transiciones: `Vigente → Terminado` (por fin de vigencia o `terminar`); `Vigente → Anulado` (solo si **no tiene recibos cobrados/incidencias**) `[DECISIÓN]`; `Vigente → Mora` (derivado) `→` se limpia al pagar.
- **FL-CON-02** Al terminar un Arrendamiento: el sistema **libera el inmueble** (→ Disponible) y actualiza el cliente (queda sin inm principal, conserva historial). Invoca a Cobros para prorrateo y a Liquidaciones/Depósito si procede.
- **FL-CON-03** Al terminar una Administración: se genera la **liquidación final** pendiente de pagar.
- **FL-CON-04** Renovación = nuevo fin + nueva versión visible en el historial (no duplica el contrato).
- **FL-CON-05** Firma: `Pendiente de firma → Parcialmente firmado → Firmado`; un contrato no firma **después** de terminar/anular; el vínculo firma → usuario con `contratos.firmar` queda auditable en cada evento del historial.

## 7. Casos de uso (CU)

- **CU-CON-01 Crear contrato (Arrendamiento).** Precond: `contratos.create`, inmueble disponible, cliente Activo. Pasos: seleccionar inmueble → seleccionar cliente → canon/día/garantía/ITBMS → estado `Vigente`. Resultado: inmueble → `Alquilado`.
- **CU-CON-02 Crear contrato (Administración).** Precond: `contratos.create`, propietario. Resultado: comisión fijada, base para Liquidaciones.
- **CU-CON-03 Renovar.** Precond: `contratos.update`. Resultado: nuevo fin + versión histórica.
- **CU-CON-04 Terminar anticipadamente.** Precond: `contratos.terminar` + motivo. Resultado: prorrateo→recibo, inmueble liberado, liquidación de depósito si aplica.
- **CU-CON-05 Anular.** Precond: `contratos.anular`, sin movimientos cobrados. Resultado: `Anulado`, inmueble liberado.
- **CU-CON-06 Consultar vigencia por inmueble/cliente.** Precond: `contratos.read`.
- **CU-CON-07 Firmar electrónicamente.** Precond: `contratos.firmar` + `features.firma-electronica`. Resultado: firma con evidencia (hash, timestamp, IP) y contrato `Firmado` al completar todas las firmas.

## 8. Resumen en dashboard

Widget **Contratos**: Vigentes · Por vencer en 60 días · En mora (permiso: `contratos.read`; los datos de mora requieren además `cobros.mora.consultar` si el widget cruza módulos). `[DECISIÓN: ¿separar o permiso AND?]`

## 9. Dependencias con otros módulos

- `Clientes` × `Inmuebles` — disponibilidad + estado del cliente (RF-CON-01).
- `Cobros` — genera recibos a partir del contrato (canon/ITBMS/`dia`); terminar contrato invoca prorrateo.
- `Liquidaciones` — contratos de Administración son base y disparan liquidación final al terminar.
- `Incidencias` — vincular incidencias al contrato cuando corresponda.
- `Inmuebles` — libera/ocupa según transiciones (FL-CON-02).

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #3) | ¿Fórmula exacta para prorrateo/terminación anticipada? |
| D2 (global #4) | ¿Anular contrato requiere cero movimientos cobrados? |
| D3 | ¿Anular recibo en mora requiere motivo + supervisor? |
| D4 | ¿Separación de funciones para crear/anular contrato? (regla actual: no anular el mismo día que se creó) |
| D5 (global #12) | ¿La separación de funciones (crear ≠ aprobar) aplica también a contratos/recibos? |
| D6 | Widget Contratos: ¿permiso AND (`contratos.read` + `cobros.mora.consultar`) o separado? |
| D7 | Firma electrónica: ¿requiere firma de **ambas** partes (empresa + inquilino) o basta la del inquilino si la empresa pre-firma? (recomendado: ambas) |
| D8 | Validación legal de la Ley 51 de 2008 (firma electrónica/simple vs firma digital certificada) — pendiente con asesor legal |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §3. | Equipo de diseño |
| 1.1 | 18/09/2026 | **Firma electrónica en plataforma** (RF-CON-07) conforme a la Ley 51 de 2008: evidencia inmutable (hash, timestamp, IP, consentimiento), tabla `ContratoFirma`, permisos `contratos.firmar` y `contratos.firmas.gestionar` **[P]**, flag `features.firma-electronica` (ADR-020). | Equipo de diseño |

---

*Fin del documento del módulo de Contratos v1.0.*