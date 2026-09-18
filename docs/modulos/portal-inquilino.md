# Módulo de Portal Inquilino

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 — alcance propio; detallado en diseño de portal (`docs/ui/` v1.4) |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 11 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §16/§17 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | Sin esquema propio; **hereda** datos de Clientes (`crm`), Contratos (`contracts`), Cobros (`finances`) e Incidencias (`ops`) |
| **Feature flag** | `features.portal-inquilino` (convención transversal) |
| **Permisos del catálogo** | `portal.ver` **[P]**; cada dato mostrado hereda el permiso del módulo fuente (nunca expone datos de otros) |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Ingreso del inquilino (cliente) para consultar su estado de cuenta, recibos, incidencias y mantenimientos.

## 2. Alcance

Este módulo corresponde a un **área de usuario separada** del dashboard de administración:

| Área | Ruta (propuesta) | Usuario | Funcionalidad clave |
|---|---|---|---|
| Portal Inquilino | `/portal/inquilino/*` | Inquilinos activos | Dashboard, **calendario** (pagos y visitas), **notificaciones**, **reportar incidencia**, pagos y **comprobantes descargables**, datos de contacto |

### 2.1 Reglas de acceso

- **Credencial**: el inquilino accede con su propio usuario (altas por un administrador; puede recibir credenciales del portal al alta — FL-CLI-04).
- **Permisos heredados**: cada sección del portal verifica el permiso correspondiente del módulo fuente (recibos → `cobros.recibos.generar` o `cobros.mora.consultar`; incidencias → `incidencias.crear`).
- **Scope de datos**: el portal **nunca** muestra datos de otros inquilinos. La restricción se valida en backend (IDOR protection).
- **Portal del propietario** (en discusión, `features.portal-propietario`): fuera del alcance actual de este documento.

### 2.2 Funcionalidades esperadas (alcance v1)

| Funcionalidad | Módulo fuente | Permiso requerido |
|---|---|---|
| Ver recibos del inquilino | Cobros (`finances`) | `cobros.recibos.generar` o `cobros.mora.consultar` |
| Descargar comprobante PDF | Cobros (`finances`) | `cobros.pagos.registrar` |
| Ver calendario de pagos | Cobros / Notificaciones | `cobros.mora.consultar` |
| Reportar incidencia | Incidencias (`ops`) | `incidencias.crear` |
| Ver incidencias propias | Incidencias (`ops`) | `incidencias.leer` |
| Ver calendario de visitas | Incidencias / Notificaciones | `incidencias.visitas.programar` |

## 3. Dependencias con otros módulos

- `Administración y Seguridad` — alta del usuario del portal, rol/permisos.
- `Clientes` — identificación del inquilino (relación contrato/inmueble).
- `Cobros` — recibos, pagos, comprobantes.
- `Contratos` — contrato vigente del inquilino.
- `Incidencias` — reporte y consulta.
- `Notificaciones` — bandeja y calendario (vía `features.notificaciones.plataforma`).

## 4. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 (global #11) | `portal.ver` aceptado como permiso nuevo en el catálogo `[P]` |
| D2 | ¿El portal debe integrar calendario (pagos + visitas) desde Fase 1 o solo en Fase 2? (ver `docs/diseno-arquitectura.md` §25 Fase 2) |
| D3 | Portal propietario: alcance y decisión (en discusión) |

## 5. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §11. | Equipo de diseño |

---

*Fin del documento del módulo de Portal Inquilino v1.0.*