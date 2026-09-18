# Módulo de Administración y Seguridad

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 — **transversal a todos los módulos** |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 10 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §6/§7 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `identity` / `seguridad` (usuarios, roles, permisos, config, feature flags) + `audit` (auditoría) |
| **Feature flag** | `admin.feature-flags` gestiona los flags de **todos** los módulos |
| **Permisos del catálogo** | `admin.usuarios` · `admin.roles` · `admin.permisos` · `admin.configuracion` · `admin.feature-flags` · `TODOS LOS PERMISOS` (rol Administrador semilla) |

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

## 3. Permisos

| Acción | Permiso |
|---|---|
| Usuarios | `admin.usuarios` |
| Roles | `admin.roles` |
| Permisos | `admin.permisos` |
| Configuración | `admin.configuracion` |
| Feature flags | `admin.feature-flags` |
| **Todo** | `TODOS LOS PERMISOS` (rol Administrador semilla) |

## 4. Restricciones de datos (RD)

- **RD-ADM-01** El rol **Administrador** (TODOS) existe como semilla y **no es eliminable**; sus permisos no se pueden reducir por debajo de TODO sin una verificación explícita `[DECISIÓN: doble confirmación + auditoría]`.
- **RD-ADM-02** Ningún usuario puede **revocarse a sí mismo** su último permiso de administración (protege contra auto-lockout). `[CONFIRMADO]`
- **RD-ADM-03** Un rol no puede asignar permisos que el rol autónomo no posee (delegación contenida).
- **RD-ADM-04** La desactivación de un módulo por feature flag **no elimina** permisos: **flag + permiso** son ambos necesarios (RN-S01); el permiso revocado sí es definitivo hasta que se reasigne.

## 5. Restricciones de flujo (FL)

- **FL-ADM-01** Los cambios de rol/permiso del usuario logueado se reflejan **al siguiente request/token** (no en la sesión actual sin re-autenticar) — límite de seguridad conocido y documentado; el frontend puede forzar refresco de claims.
- **FL-ADM-02** Alta de usuario: sin rol asignado → sin acceso (blank state de nuevo usuario).
- **FL-ADM-03** Separación de funciones aplicada (p.ej. aprobar asientos ≠ crear asientos) se expresa con permisos, no con lógica escondida.
- **FL-ADM-04** **Demo dinámico (prototipo):** conceder `incidencias.leer` (o `cobros.recibos.generar`) a un rol del demo debe hacer aparecer al instante el widget correspondiente en el dashboard y el ítem en el menú — este es el caso de uso que valida la composición dinámica.

## 6. Casos de uso (CU)

- **CU-ADM-01 Crear usuario.** Precond: `admin.usuarios`. Resultado: sin acceso hasta asignar rol.
- **CU-ADM-02 Asignar rol/permisos.** Precond: `admin.roles`/`admin.permisos`. Resultado: efectivo al siguiente request; auditoría.
- **CU-ADM-03 Configurar ITBMS/días de mora.** Precond: `admin.configuracion`.
- **CU-ADM-04 Cambiar feature flag y ver efecto en dashboard.** Precond: `admin.feature-flags` (demo con toggles en vivo).
- **CU-ADM-05 Revisar auditoría de seguridad.** Precond: `admin.usuarios` (lectura de auditoría).

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

## 10. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §10. | Equipo de diseño |

---

*Fin del documento del módulo de Administración y Seguridad v1.0.*