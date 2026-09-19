# Módulos — Índice oficial y control de versiones

| Campo | Valor |
|---|---|
| **Versión** | 1.2 |
| **Fecha** | 19/09/2026 |
| **Estado** | Documento oficial de versiones v1.2. Registro maestro de los documentos por módulo. v1.2 incorpora el **módulo Recursos Humanos y Planilla** (`recursos-humanos.md` v1.0, base RF-RH-001): nómina parametrizable con estados inmutables e integración contable/bancaria |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) |

---

## 1. Propósito

Este folder (`docs/modulos/`) contiene **un documento oficial por módulo**, versionado de forma independiente (cada archivo parte como **v1.0**) y derivado, en su mayoría, del borrador único `docs/ui/requerimientos-modulos.md` (v0.1). Excepción: **Recursos Humanos** (`recursos-humanos.md` v1.0) deriva del requerimiento funcional **RF-RH-001** (no está en v0.1).

Esto permite:

- Llevar **control de versiones por módulo** (cadena de cambios y autor por documento; historial íntegro en git).
- Revisar, aprobar y evolucionar cada módulo sin bloquear a los demás.
- Cruzar con los documentos de arquitectura (`docs/diseno-arquitectura.md`, `docs/modulo-contabilidad.md`, `docs/adr-aislamiento-modulos-killswitch.md`).

## 2. Reglas transversales (aplican a todos los módulos)

- **RN-S01**: el **backend valida siempre** `permiso` **+ feature flag + regla de negocio**; el frontend solo controla UX.
- Los permisos siguen la convención `modulo.accion`; el catálogo oficial está en la sección 3.
- Los permisos nuevos (no presentes aún en el prototipo) se marcan `[P]`.
- El estado *derivado* de un registro = calculado por el sistema (no editable). El estado *gestionado* = editable por usuario con permiso.
- Convención de códigos: `RF-xx` requisito funcional · `RD-xx` restricción de datos · `FL-xx` restricción de flujo · `CU-xx` caso de uso.
- Dependencias entre módulos: se expresan por **identidad (IDs) o por eventos, nunca por acceso directo a tablas de otro módulo** (modular monolith con contratos y esquemas por módulo — ver `docs/adr-aislamiento-modulos-killswitch.md`).

---

## 3. Regístro de documentos por módulo

| Módulo | Documento | Versión | Fecha | Estado | Sección origen (v0.1) |
|---|---|---|---|---|---|
| Clientes | [`clientes.md`](clientes.md) | 1.1 | 18/09/2026 | Oficial v1.1 (KYC) | §1 |
| Inmuebles | [`inmuebles.md`](inmuebles.md) | 1.1 | 18/09/2026 | Oficial v1.1 (control de llaves) | §2 |
| Contratos | [`contratos.md`](contratos.md) | 1.1 | 18/09/2026 | Oficial v1.1 (firma electrónica) | §3 |
| Cobros | [`cobros.md`](cobros.md) | 1.1 | 18/09/2026 | Oficial v1.1 (pagos en línea + ACH) | §4 |
| Liquidaciones | [`liquidaciones.md`](liquidaciones.md) | 1.0 | 12/09/2026 | Oficial v1.0 | §5 |
| Incidencias | [`incidencias.md`](incidencias.md) | 1.1 | 18/09/2026 | Oficial v1.1 (mantenimiento preventivo) | §6 |
| Línea blanca | [`linea-blanca.md`](linea-blanca.md) | 1.0 | 12/09/2026 | Oficial v1.0 | §7 |
| Contabilidad | [`contabilidad.md`](contabilidad.md) | 1.0 | 12/09/2026 | Oficial v1.0 (vincula a `docs/modulo-contabilidad.md` v1.0) | §8 |
| Reportes | [`reportes.md`](reportes.md) | 1.1 | 18/09/2026 | Oficial v1.1 (KPIs + analítica) | §9 |
| Administración y Seguridad | [`administracion-seguridad.md`](administracion-seguridad.md) | 1.1 | 18/09/2026 | Oficial v1.1 (MFA + privacidad Ley 81) | §10 |
| Portal inquilino | [`portal-inquilino.md`](portal-inquilino.md) | 1.0 | 12/09/2026 | Oficial v1.0 (alcance propio) | §11 |
| Recursos Humanos | [`recursos-humanos.md`](recursos-humanos.md) | 1.0 | 19/09/2026 | Oficial v1.0 (nómina parametrizable; base RF-RH-001, no deriva de v0.1) | — |

> La fuente original `docs/ui/requerimientos-modulos.md` (v0.1) queda como **ficha técnica/borrador de discusión**. Los documentos de `docs/modulos/` son la fuente oficial por módulo.

---

## 4. Catálogo de permisos (transversal)

| Módulo | Código | Acción |
|---|---|---|
| Clientes | `clientes.read` | Ver listado/ficha/exportar |
| | `clientes.create` **[P]** | Registrar |
| | `clientes.update` **[P]** | Editar |
| | `clientes.estado.cambiar` **[P]** | Cambiar estado gestionado (Activo ↔ Inactivo) |
| | `clientes.documentos.gestionar` **[P]** | Cargar/gestionar documentos de la ficha |
| | `clientes.solicitudes.gestionar` **[P]** | Gestionar solicitudes de arrendamiento (pipeline KYC) |
| | `clientes.verificacion.ejecutar` **[P]** | Ejecutar verificación KYC (OCR, referencias, checklist) |
| | `clientes.delete` **[P]** | Desactivar/eliminar |
| Inmuebles | `inmuebles.read` | Ver catálogo/ficha |
| | `inmuebles.create` **[P]** | Registrar |
| | `inmuebles.update` **[P]** | Editar |
| | `inmuebles.llaves.gestionar` **[P]** | Control de llaves/pases (entrega, custodia) |
| | `inmuebles.delete` **[P]** | Eliminar/desactivar |
| Contratos | `contratos.read` | Ver |
| | `contratos.create` **[P]** | Crear |
| | `contratos.update` **[P]** | Editar (antes de firma) |
| | `contratos.firmar` **[P]** | Firmar electrónicamente (empresa/inquilino) |
| | `contratos.firmas.gestionar` **[P]** | Gestionar/revocar firmas |
| | `contratos.terminar` **[P]** | Terminar anticipadamente |
| | `contratos.anular` **[P]** | Anular |
| Cobros | `cobros.recibos.generar` | Generar recibos (masivo/individual) |
| | `cobros.recibos.anular` **[P]** | Anular recibo |
| | `cobros.pagos.registrar` | Registrar pagos/cobros |
| | `cobros.pagos.en-linea` **[P]** | Pagar en línea (portal inquilino) |
| | `cobros.pagos.reembolsar` **[P]** | Reembolsar pago |
| | `cobros.mora.consultar` | Consultar mora |
| Liquidaciones | `liquidaciones.generar` | Generar liquidaciones |
| | `liquidaciones.confirmar` | Confirmar pago a propietario |
| | `liquidaciones.consultar` **[P]** | Consultar |
| | `liquidaciones.anular` **[P]** | Anular |
| Incidencias | `incidencias.leer` | Ver (incluye costos y timeline) |
| | `incidencias.crear` **[P]** | Reportar |
| | `incidencias.asignar` | Asignar proveedor/técnico |
| | `incidencias.registrar_costo` **[P]** | Registrar presupuesto/costo |
| | `incidencias.cerrar` | Cerrar |
| | `incidencias.visitas.programar` | Programar visitas |
| | `incidencias.planes.gestionar` **[P]** | Gestionar planes de mantenimiento preventivo |
| Línea blanca | `lineablanca.read` | Ver inventario/ficha |
| | `lineablanca.create` **[P]** | Registrar equipo |
| | `lineablanca.update` **[P]** | Editar equipo |
| | `lineablanca.baja` **[P]** | Dar de baja |
| | `lineablanca.mantenimientos.registrar` | Registrar mantenimiento |
| Contabilidad | `contabilidad.plan-cuentas.editar` | Editar plan de cuentas |
| | `contabilidad.asientos.crear` | Crear asiento (borrador) |
| | `contabilidad.asientos.aprobar` | Aprobar asiento |
| | `contabilidad.cierres.ejecutar` | Ejecutar cierre mensual |
| | `contabilidad.impuestos.registrar` **[P]** | Registrar ITBMS declarado/pagado |
| | `contabilidad.activos.editar` **[P]** | Editar activos fijos |
| | `conciliacion` | Conciliar bancos |
| | `estados-financieros.ver` | Ver EF (también da acceso al portal contable en dashboard) |
| Reportes | `reportes.ver` | Ver/consultar reportes habilitados |
| | `reportes.generar` **[P]** | Generar bajo demanda / programar |
| | `reportes.kpis.ver` **[P]** | Ver KPIs ejecutivos |
| | `analitica.ver` **[P]** | Ver score de morosidad / sugerencia de canon |
| Administración | `admin.usuarios` | Usuarios |
| | `admin.roles` | Roles |
| | `admin.permisos` | Catálogo/asignación |
| | `admin.configuracion` | Parámetros globales |
| | `admin.feature-flags` | Feature flags |
| | `admin.mfa.gestionar` **[P]** | Política MFA y recuperación de usuarios |
| | `admin.privacidad` **[P]** | Privacidad Ley 81 (ARCO, inventario, transferencias) |
| Portal | `portal.ver` **[P]** | Ingreso del inquilino al portal |
| Recursos Humanos | `rrhh.empleados.ver` | Ver empleados/expedientes (datos no salariales) |
| | `rrhh.empleados.gestionar` **[P]** | Crear/editar empleados, expedientes e historial laboral |
| | `rrhh.salarios.ver` **[P]** | Ver información salarial y de nómina (protegido) |
| | `rrhh.organizacion.gestionar` **[P]** | Configurar empresas/sucursales, departamentos, puestos, centros de costo |
| | `rrhh.proyectos.asignar` **[P]** | Asignar empleados a proyectos/obras y distribuir costos |
| | `rrhh.contratos.gestionar` **[P]** | Gestionar contratos laborales y adendas |
| | `rrhh.asistencia.ver` | Consultar asistencia (propia o del equipo autorizado) |
| | `rrhh.asistencia.gestionar` **[P]** | Registrar/corregir asistencia y marcaciones |
| | `rrhh.horasextras.aprobar` **[P]** | Aprobar/rechazar horas extras |
| | `rrhh.ausencias.aprobar` **[P]** | Aprobar vacaciones y permisos |
| | `rrhh.incapacidades.gestionar` **[P]** | Registrar incapacidades (datos médicos protegidos) |
| | `rrhh.prestamos.gestionar` **[P]** | Gestionar préstamos y anticipos |
| | `rrhh.nomina.crear` **[P]** | Crear/calcular planilla (borrador → calculada) |
| | `rrhh.nomina.revisar` **[P]** | Revisar planilla calculada |
| | `rrhh.nomina.aprobar` **[P]** | Aprobar/cerrar planilla (usuario distinto del que creó) |
| | `rrhh.nomina.pagar` **[P]** | Generar archivo bancario y registrar pago/confirmación |
| | `rrhh.nomina.reabrir` **[P]** | Reabrir planilla cerrada (permiso especial + motivo) |
| | `rrhh.nomina.contabilizar` **[P]** | Generar asientos borrador hacia Contabilidad |
| | `rrhh.liquidaciones.gestionar` **[P]** | Calcular/aprobar liquidaciones laborales |
| | `rrhh.reclutamiento.gestionar` **[P]** | Vacantes, candidatos, ofertas, onboarding/offboarding |
| | `rrhh.desarrollo.gestionar` **[P]** | Evaluaciones y capacitaciones |
| | `rrhh.seguridad-ocupacional.gestionar` **[P]** | EPP, accidentes/incidentes y equipos entregados |
| | `rrhh.configuracion` **[P]** | Configurar reglas de nómina, conceptos, feriados y políticas |
| | `rrhh.reportes.ver` **[P]** | Ver reportes/dashboard RH (además del permiso fuente del reporte) |

---

## 5. Dependencias entre módulos

```
Clientes ──► Inmuebles (asigna inm principal)
Contratos = Clientes × Inmuebles (disponibilidad + estado)
Cobros ──► Contratos (canon/itbms/dia) y ► Clientes (mora)
Liquidaciones ──► Contratos (Administración) + Cobros (ingreso cobrado)
Incidencias ──► Inmuebles + Clientes (opcional) ─► Línea blanca (sugerencia)
Línea blanca ──► Inmuebles
Contabilidad ──► Cobros + Liquidaciones (asientos borrador) + Impuestos
Reportes ──► Todos (permiso fuente por tipo)
Admin ──► Todos (permisos + flags)
Recursos Humanos ──► Contabilidad (asientos borrador de planilla) + Admin (usuarios/permisos) + Reportes
Recursos Humanos ◄── Contabilidad (catálogo de cuentas para conceptos) + Admin (RBAC/roles)
```

---

## 6. Decisiones y preguntas abiertas (globales)

| # | Decisión | Módulos afectados |
|---|---|---|
| 1 | ¿El estado `Mora` de Cliente se deriva de CUALQUIER recibo en mora de un contrato asociado? | Clientes, Cobros |
| 2 | ¿Se permite borrado definitivo con restricción (solo Admin central + auditoría) o solo soft-delete? | Clientes, Inmuebles |
| 3 | ¿Qué fórmula exacta para prorrateo/terminación anticipada de contrato? | Contratos, Cobros |
| 4 | ¿Anular contrato requiere cero movimientos cobrados? ¿Y anular recibo en mora requiere motivo + supervisor? | Contratos, Cobros |
| 5 | ¿Pagos parciales de recibo permitidos? (recomendado: NO en v1, las cuotas como recibos separados) | Cobros |
| 6 | ¿La liquidación con ingreso 0 se oculta o se muestra? | Liquidaciones |
| 7 | ¿Reabrir incidencias cerradas (recaída) o crear nueva referenciada? | Incidencias |
| 8 | ¿Umbral de presupuesto para asignar incidencia sin pasar por Presupuesto? (default B/. 100) | Incidencias |
| 9 | ¿El cierre contable se bloquea si el banco no está conciliado? (recomendado: Sí) | Contabilidad |
| 10 | ¿Widget de Administración en el dashboard? (recomendado: NO) | Administración |
| 11 | ¿Permisos nuevos `[P]` aceptados en el catálogo (clientes.create, contratos.anular, etc.)? | Todos |
| 12 | ¿La separación de funciones (crear ≠ aprobar asiento) aplica también a contratos/recibos? | Todos |

---

## 7. Cómo versionar un módulo

1. Cada cambio sustancial incrementa la **versión del documento** (SemVer: 1.0 → 1.1 → 2.0).
2. La tabla **Control de versiones** al final de cada documento registra: versión, fecha, cambios, autor.
3. El **historial completo** vive en git (un commit por cambio de documento; mensaje con prefijo del módulo, p.ej. `docs(contratos): ...`).
4. Cuando una decisión abierta de la sección 6 se resuelve, actualizar el documento del módulo y **marcar la decisión como cerrada** en su tabla de decisiones.

---

*Documento de registro v1.2. Los documentos de módulo se versionan de forma independiente a partir de esta estructura. La features v1.1 se detallan en los documentos de cada módulo y en `docs/diseno-arquitectura.md` v1.4 (ADRs 019–021). El módulo Recursos Humanos v1.0 (nómina parametrizable, inmutabilidad e integración contable/bancaria) se describe en `docs/modulos/recursos-humanos.md` y en la v1.5 de `docs/diseno-arquitectura.md`.*