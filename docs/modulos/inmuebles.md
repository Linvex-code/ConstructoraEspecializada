# Módulo de Inmuebles

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 2 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §9 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `properties` |
| **Feature flag** | `features.inmuebles` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `inmuebles.read` · `inmuebles.create` **[P]** · `inmuebles.update` **[P]** · `inmuebles.delete` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Catálogo de unidades bajo administración (apartamentos, locales, casas, oficinas) con características, estado operativo y titularidad.

## 2. Requisitos funcionales

- **RF-INM-01** CRUD de inmuebles con filtros (tipo, estado, torre/ubicación) y paginación.
- **RF-INM-02** Tipos: `Apartamento`, `Local comercial`, `Casa`, `Oficina`. Estados: `Disponible`, `Alquilado`, `En mantenimiento`, `Reservado` **[P]**.
- **RF-INM-03** Ficha con datos, titularidad, contrato vigente, incidencias activas, equipos de línea blanca asociados.
- **RF-INM-04** Vista de ocupación: total, alquilados, disponibles por tipo (dato del widget y de Reportes).
- **RF-INM-05** Historial de estados con fechas **[P]** (para trazabilidad).

## 3. Campos

| Campo | Tipo | Regla |
|---|---|---|
| id | pk | auto |
| ref | texto | obligatorio · único (Apt 3B, Local C-1) |
| tipo | enum | obligatorio |
| torre / dir | texto | según corresponda |
| m2 | número | > 0 |
| hab / banios / parq | número | ≥ 0 · banios ≥ 0 |
| ambl | enum | Amueblado / Parcial / Sin amueblar / — |
| estado | enum | Disponible / Alquilado / En mantenimiento / **Reservado** |
| img | emoji/url | opcional |
| serv | texto | servicios incluidos |
| prop | texto | titularidad (puede ser `—` admin) |
| **fechaAdquisicion / costo / avaluo** **[P]** | fecha/número | opcional · solo gerencia |

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver | `inmuebles.read` |
| Crear / editar | `inmuebles.create` / `inmuebles.update` |
| Eliminar/desactivar | `inmuebles.delete` |

## 5. Restricciones de datos (RD)

- **RD-INM-01** `ref` única; `tipo` y `estado` obligatorios; `m2 > 0`.
- **RD-INM-02** `Alquilado` y `Reservado` **requieren** contrato de arrendamiento vigente o previsto (reserva sin firmar) `[DECISIÓN: ¿Reservado admite 0 contratos?]`.
- **RD-INM-03** `En mantenimiento` admite incidencias de obra pero **bloquea nuevos contratos**.
- **RD-INM-04** No se borra físicamente si tiene historial → `Desactivado` **[P]** (estado adicional o `delete` con restricción). `[DECISIÓN]`

## 6. Restricciones de flujo (FL)

- **FL-INM-01** Transiciones válidas: `Disponible → Reservado → Alquilado` (reserva opcional), `Alquilado → Disponible` solo tras **fin/terminación de contrato** (lo hace Contratos, no Inmuebles), `Disponible/Alquilado → En mantenimiento` (requiere aviso si hay ocupante), `En mantenimiento → Disponible`.
- **FL-INM-02** Un inmueble `En mantenimiento` con inquilino activo: los cobros siguen, pero las incidencias internas se marcan como obra. `[DECISIÓN: ¿se inhabilita reporte de incidencia del ocupante? NO, preferido mantener reporte.]`
- **FL-INM-03** No puede haber dos contratos vigentes sobre el mismo inmueble (validado en Contratos, visible aquí).

## 7. Casos de uso (CU)

- **CU-INM-01 Registrar inmueble.** Precond: `inmuebles.create`.
- **CU-INM-02 Consultar ficha** (contrato, incidencias, equipos, estados). Precond: `inmuebles.read`.
- **CU-INM-03 Cambiar estado** con validación de FL-INM-01. Precond: `inmuebles.update`.
- **CU-INM-04 Ver ocupación por tipo.** Precond: `inmuebles.read`.

## 8. Resumen en dashboard

Widget **Inmuebles**: Total 7 · Alquilados 5 · Disponibles 1 · En mantenimiento 1 (permiso: `inmuebles.read`; detalle por tipo en la ficha/Reportes).

## 9. Dependencias con otros módulos

- `Clientes` — titularidad (`prop`) y cliente principal (`inm`).
- `Contratos` — contrato vigente; transición de estado la lidera Contratos (FL-INM-01).
- `Incidencias` — incidencias del inmueble (activas y activas de obra en mantenimiento).
- `Línea blanca` — equipos instalados por inmueble.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 | ¿`Reservado` admite 0 contratos (reserva sin firmar)? |
| D2 (global #2) | ¿Borrado físico con restricción (Admin central + auditoría) o `Desactivado` permanente? |
| D3 | ¿En mantenimiento con inquilino activo: se mantiene el reporte de incidencias del ocupante? (preferido: sí) |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §2. | Equipo de diseño |

---

*Fin del documento del módulo de Inmuebles v1.0.*