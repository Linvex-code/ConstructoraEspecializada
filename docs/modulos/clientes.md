# Módulo de Clientes

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 1 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §8 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `crm` (módulo Clientes en el monolito modular) |
| **Feature flag** | `features.clientes` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `clientes.read` · `clientes.create` **[P]** · `clientes.update` **[P]** · `clientes.delete` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Gestionar personas/empresas vinculadas a la administración (inquilinos, propietarios, ambos) y su relación con inmuebles, contratos, cobros e incidencias.

## 2. Requisitos funcionales

- **RF-CLI-01** Listar clientes con búsqueda y filtros (tipo, estado, nacionalidad, inmueble) y paginación.
- **RF-CLI-02** Crear, editar, desactivar y (restringidamente) eliminar clientes.
- **RF-CLI-03** Tipos: `Inquilino`, `Propietario`, `Ambos`. Estados: `Activo`, `Inactivo`, `Mora` (**derivado**, ver FL).
- **RF-CLI-04** Ficha con historial consolidado: contratos, recibos/pagos, incidencias reportadas, estado de mora.
- **RF-CLI-05** Exportar CSV del listado (hereda `clientes.read`).

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id | pk | auto |
| ini | texto 2-3 | siglas generadas |
| nom | texto | obligatorio |
| tipo | enum | Inquilino / Propietario / Ambos |
| ci | texto | opcional · único |
| cel / mail | texto | mail único si existe · cel opcional |
| trab | texto | opcional |
| nacionalidad | texto | opcional (identifica extranjeros) |
| estado | enum | Activo / Inactivo / **Mora (derivado)** |
| inm | fk inmueble | opcional · inmueble principal |
| ciudad | texto | opcional |
| **fechaRegistro** **[P]** | fecha | alta |
| **notas** **[P]** | texto | opcional |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver / exportar | `clientes.read` |
| Crear | `clientes.create` |
| Editar | `clientes.update` |
| Desactivar/eliminar | `clientes.delete` |

## 5. Restricciones de datos (RD)

- **RD-CLI-01** `ci` y `mail` únicos cuando existen.
- **RD-CLI-02** `tipo` y `estado` obligatorios; estado `Mora` **no editable manualmente** — se deriva de los cobros (contrato/recibo en mora). `[DECISIÓN: ¿el cliente marca Mora si CUALQUIER recibo de un contrato asociado está en mora?]`
- **RD-CLI-03** Si `inm` se asigna: el inmueble debe existir y **no tener un contrato vigente con otro cliente** (exclusividad residencial).
- **RD-CLI-04** Un cliente con estado `Inactivo` no puede ser parte de contratos nuevos ni reportar incidencias.
- **RD-CLI-05** No se permite eliminar (borrado físico) si existen contratos, recibos o incidencias históricos → **soft delete**: el sistema usa `Inactivo`. `[DECISIÓN: filtro para borrado definitivo solo para Administración central, con auditoría.]`

## 6. Restricciones de flujo (FL)

- **FL-CLI-01** Alta de cliente **no crea contrato** ni asigna inmueble automáticamente (flujos separados).
- **FL-CLI-02** `Mora` se recalcula al registrar pago (se limpia) o al emitir recibo vencido (se marca). Es derivado, nunca editado.
- **FL-CLI-03** Desactivar un cliente: bloquea nuevo contrato y nuevas incidencias; los contratos vigentes continúan gestionándose hasta su término (o se evalúa caso a caso). `[DECISIÓN]`
- **FL-CLI-04** Al crear un cliente con `tipo in (Inquilino, Ambos)`, el sistema ofrece (opcional) enviar credenciales del portal inquilino si `portal.ver` está habilitado. `[DECISIÓN]`

## 7. Casos de uso (CU)

- **CU-CLI-01 Registrar cliente.** Precond: permiso `clientes.create`. Pasos: datos → valida unicidad → guarda con estado `Activo`. Resultado: cliente creado, listo para contrato.
- **CU-CLI-02 Consultar ficha con historial.** Precond: `clientes.read`. Resultado: datos + contratos + recibos + incidencias + estado de mora.
- **CU-CLI-03 Editar datos.** Precond: `clientes.update`. No permite editar `estado=Mora` (derivado). Resultado: cambios registrados con auditoría.
- **CU-CLI-04 Desactivar/eliminar.** Precond: `clientes.delete`. Si hay historial → desactiva; si no → borra. Resultado y auditoría según FL-CLI-05.
- **CU-CLI-05 Exportar listado.** Precond: `clientes.read`. Genera CSV con los mismos datos que el listado visible.

## 8. Resumen en dashboard

Widget **Clientes**: Total 8 · Activos 6 · Mora 1 · Propietarios 2 · Inquilinos 4 (permiso: `clientes.read`).

## 9. Dependencias con otros módulos

- `Inmuebles` — asigna `inm` (inmueble principal).
- `Contratos` — el contrato referencia al cliente y valida su tipo/estado.
- `Cobros` — recibe el estado de mora del cliente (recibos vencidos).
- `Incidencias` — opcional: quien reporta la incidencia puede ser el cliente.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #1) | ¿El estado `Mora` del cliente se deriva de CUALQUIER recibo en mora de un contrato asociado? |
| D2 (global #2) | ¿Se permite borrado definitivo con restricción (solo Admin central + auditoría) o solo soft-delete? |
| D3 | Desactivar cliente: ¿qué pasa con los contratos vigentes? (opción preferida: continuar hasta término) |
| D4 | ¿Enviar credenciales del portal inquilino al alta si `portal.ver` está habilitado? |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §1. | Equipo de diseño |

---

*Fin del documento del módulo de Clientes v1.0.*