# Módulo de Administración y Seguridad

| Campo | Valor |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | 18/09/2026 |
| **Estado** | Documento oficial del módulo v1.1 — incorpora **MFA (TOTP)** y **panel de privacidad Ley 81/2019** (ARCO, inventario de datos personales y transferencias) |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 10 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §6/§7 · `docs/modulos/README.md` (v1.1) |
| **Esquema BD (referencia)** | `identity` / `seguridad` (usuarios, roles, permisos, config, feature flags, `MfaConfig`, `SolicitudArco`) + `audit` (auditoría) |
| **Feature flag** | `admin.feature-flags` gestiona los flags de **todos** los módulos · `features.mfa` · `features.privacidad` |
| **Permisos del catálogo** | `admin.usuarios` · `admin.roles` · `admin.permisos` · `admin.configuracion` · `admin.feature-flags` · `admin.mfa.gestionar` **[P]** · `admin.privacidad` **[P]** · `TODOS LOS PERMISOS` (rol Administrador semilla) |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.
> RN-S02: el cliente crea/compone **roles** con el catálogo de permisos; **nunca crea permisos** (catálogo fijo sembrado por desarrollo).

---

## 1. Objetivo

Gestión de usuarios, roles, permisos, feature flags y configuración global. **Transversal a todos los módulos.**

## 2. Requisitos funcionales

- **RF-ADM-01** Usuarios: CRUD, alta con rol inicial, activar/desactivar, reset de acceso.
- **RF-ADM-02** Roles: CRUD y asignación de permisos del catálogo (sección 0 de `docs/modulos/README.md`).
- **RF-ADM-03** Permisos: catálogo oficial, no se crean ad hoc.
- **RF-ADM-04** Feature flags por módulo y entorno (habilitado por rol cuando aplique).
- **RF-ADM-05** Configuración global: % ITBMS, días de mora, umbral de presupuesto de incidencias, canales de notificación.
- **RF-ADM-06** **Auditoría** de cambios de seguridad: quién, qué, cuándo (tabla propia; independiente de la auditoría funcional de cada módulo).
- **RF-ADM-07** **MFA (TOTP)**: activación por usuario, códigos de respaldo, política por rol (obligatorio/opcional), recuperación y bloqueo tras intentos fallidos; el token MFA nunca se almacena en claro.
- **RF-ADM-08** **Panel de privacidad (Ley 81/2019)**: solicitudes **ARCO** (acceso, rectificación, cancelación, oposición) con timeline y plazos, **inventario de datos personales** por módulo, **registro de transferencias** y política de retención.

## 3. Permisos

| Acción | Permiso |
|---|---|
| Usuarios | `admin.usuarios` |
| Roles | `admin.roles` |
| Permisos | `admin.permisos` |
| Configuración | `admin.configuracion` |
| Feature flags | `admin.feature-flags` |
| MFA (política y recuperación) | `admin.mfa.gestionar` |
| Privacidad (ARCO, inventario, transferencias) | `admin.privacidad` |
| **Todo** | `TODOS LOS PERMISOS` (rol Administrador semilla) |

## 4. Restricciones de datos (RD)

- **RD-ADM-01** El rol **Administrador** (TODOS) existe como semilla y **no es eliminable**; sus permisos no se pueden reducir por debajo de TODO sin una verificación explícita `[DECISIÓN: doble confirmación + auditoría]`.
- **RD-ADM-02** Ningún usuario puede **revocarse a sí mismo** su último permiso de administración (protege contra auto-lockout). `[CONFIRMADO]`
- **RD-ADM-03** Un rol no puede asignar permisos que el rol autónomo no posee (delegación contenida).
- **RD-ADM-04** La desactivación de un módulo por feature flag **no elimina** permisos: **flag + permiso** son ambos necesarios (RN-S01); el permiso revocado sí es definitivo hasta que se reasigne.
- **RD-ADM-05** MFA: un rol con `features.mfa` obligatorio no inicia sesión completa sin el segundo factor; los códigos de respaldo son de un solo uso y rotan.
- **RD-ADM-06** Las solicitudes ARCO son **append-only** (timeline con actor y fechas) y respetan los plazos de la Ley 81/2019 `(SUPUESTO PA-###)`; el inventario de datos personales marca la base legal y retención de cada dato.

## 5. Restricciones de flujo (FL)

- **FL-ADM-01** Los cambios de rol/permiso del usuario logueado se reflejan **al siguiente request/token** (no en la sesión actual sin re-autenticar) — límite de seguridad conocido y documentado; el frontend puede forzar refresco de claims.
- **FL-ADM-02** Alta de usuario: sin rol asignado → sin acceso (blank state de nuevo usuario).
- **FL-ADM-03** Separación de funciones aplicada (p.ej. aprobar asientos ≠ crear asientos) se expresa con permisos, no con lógica escondida.
- **FL-ADM-04** **Demo dinámico (prototipo):** conceder `incidencias.leer` (o `cobros.recibos.generar`) a un rol del demo debe hacer aparecer al instante el widget correspondiente en el dashboard y el ítem en el menú — este es el caso de uso que valida la composición dinámica.
- **FL-ADM-05** MFA: alta sin MFA configurado y política obligatoria → se solicita registro en el primer acceso (`enrolamiento → verificado`); la desactivación del MFA de un usuario exige administrador y auditoría.
- **FL-ADM-06** Privacidad: `Recibida → En trámite → Resuelta/Cerrada`; resolver una ARCO de cancelación deriva en ofuscación/retiro de los datos personales del titular con trazabilidad.

## 6. Casos de uso (CU)

- **CU-ADM-01 Crear usuario.** Precond: `admin.usuarios`. Resultado: sin acceso hasta asignar rol.
- **CU-ADM-02 Asignar rol/permisos.** Precond: `admin.roles`/`admin.permisos`. Resultado: efectivo al siguiente request; auditoría.
- **CU-ADM-03 Configurar ITBMS/días de mora.** Precond: `admin.configuracion`.
- **CU-ADM-04 Cambiar feature flag y ver efecto en dashboard.** Precond: `admin.feature-flags` (demo con toggles en vivo).
- **CU-ADM-05 Revisar auditoría de seguridad.** Precond: `admin.usuarios` (lectura de auditoría).
- **CU-ADM-06 Activar MFA de un usuario.** Precond: `admin.mfa.gestionar`. Resultado: usuario con segundo factor activo (y códigos de respaldo emitidos).
- **CU-ADM-07 Gestionar solicitud ARCO.** Precond: `admin.privacidad`. Resultado: solicitud con timeline y resolución registrada; cancelación → retiro/ofuscación del dato personal.

## 7. Resumen en dashboard

Sin widget propio por defecto. `[CONFIRMADO: global #10 — ¿widget "Usuarios activos / roles" solo para Admin? Recomendado NO incluir — la seguridad no va al resumen.]`

## 8. Dependencias con otros módulos

- **Transversal**: todos los módulos dependen de este módulo (roles, permisos, flags, configuración, auditoría).
- Modelo en `docs/diseno-arquitectura.md` §7: permisos fijos (desarrollo) + roles dinámicos (cliente).

## 9. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 | ¿Reducir permisos del rol Administrador requiere doble confirmación + auditoría? (recomendado: sí) |
| D2 | ¿Protección contra auto-lockout (no revocarse el último permiso de administración)? (recomendado: sí) |
| D3 (global #10) | ¿Widget de Administración en el dashboard? (recomendado: NO) |
| D4 (global #11) | ¿Permisos nuevos `[P]` aceptados en el catálogo? |
| D5 | MFA: ¿obligatorio para roles financieros (Contador, Cobros/Finanzas, Gerente) desde la semilla? (recomendado: sí) |
| D6 | ARCO: ¿el retiro de un dato personal en un registro con obligación contable se resuelve como **segregación + ofuscación** (no borrado físico)? (recomendado: sí) |

## 10. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §10. | Equipo de diseño |
| 1.1 | 18/09/2026 | **MFA (TOTP)** (RF-ADM-07) y **panel de privacidad Ley 81/2019** (RF-ADM-08): ARCO, inventario de datos y transferencias. Permisos `admin.mfa.gestionar` **[P]** y `admin.privacidad` **[P]**; flags `features.mfa` y `features.privacidad`; tablas `MfaConfig` y `SolicitudArco`. | Equipo de diseño |

---

*Fin del documento del módulo de Administración y Seguridad v1.0.*