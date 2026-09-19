# Módulo de Recursos Humanos y Planilla

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 19/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 — nuevo módulo derivado del requerimiento funcional **RF-RH-001 (v1.0, propuesta)**: ciclo de vida laboral del colaborador (reclutamiento → contratación → asistencia → nómina → liquidación) + integración contable y bancaria |
| **Documento base** | Requerimiento funcional **RF-RH-001** v1.0 — "Módulo de Recursos Humanos y Planilla" (no forma parte de `docs/ui/requerimientos-modulos.md` v0.1; se registra por primera vez) |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.4) — §4/§18/§22 (ADR-022) · `docs/modulos/README.md` (v1.2) · `docs/modulo-contabilidad.md` (v1.0) §3.7/§4 · `docs/adr-aislamiento-modulos-killswitch.md` (v1.0) |
| **Esquema BD (referencia)** | `hr` (módulo Recursos Humanos en el monolito modular; incluye organización, empleados, contratos, asistencia, nómina, reclutamiento, seguridad ocupacional) |
| **Feature flags** | `features.rrhh` · `features.nomina` · `features.asistencia` · `features.portal-empleado` · `features.reclutamiento` · `features.seguridad-ocupacional` (convención transversal; ver Administración y Seguridad) |
| **Permisos del catálogo** | `rrhh.empleados.ver` · `rrhh.empleados.gestionar` **[P]** · `rrhh.salarios.ver` **[P]** · `rrhh.organizacion.gestionar` **[P]** · `rrhh.proyectos.asignar` **[P]** · `rrhh.contratos.gestionar` **[P]** · `rrhh.asistencia.ver` · `rrhh.asistencia.gestionar` **[P]** · `rrhh.horasextras.aprobar` **[P]** · `rrhh.ausencias.aprobar` **[P]** · `rrhh.incapacidades.gestionar` **[P]** · `rrhh.prestamos.gestionar` **[P]** · `rrhh.nomina.crear` **[P]** · `rrhh.nomina.revisar` **[P]** · `rrhh.nomina.aprobar` **[P]** · `rrhh.nomina.pagar` **[P]** · `rrhh.nomina.reabrir` **[P]** · `rrhh.nomina.contabilizar` **[P]** · `rrhh.liquidaciones.gestionar` **[P]** · `rrhh.reclutamiento.gestionar` **[P]** · `rrhh.desarrollo.gestionar` **[P]** · `rrhh.seguridad-ocupacional.gestionar` **[P]** · `rrhh.configuracion` **[P]** · `rrhh.reportes.ver` **[P]** |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.
> ⚠️ **Marco panameño**: las reglas de cálculo de nómina (CSS, ISR y retenciones DGI, décimo tercer mes, horas extras, vacaciones, preaviso e indemnización) requieren validación con **CPA y asesor legal** antes de implementar (`SUPUESTO PA-17`). El motor de nómina se diseña **parametrizable** para absorber esos valores sin rediseño.

---

## 1. Objetivo

Gestionar de extremo a extremo el ciclo de vida laboral de los colaboradores de la empresa —personal administrativo, técnico, operativo, de construcción, supervisores y temporal— incluyendo: organización y puestos, expedientes y contratos, proyectos/obras y centros de costo, asistencia y tiempo libre, compensaciones y prestaciones, **planilla parametrizable** con estados inmutables, liquidaciones, reclutamiento/onboarding/offboarding, seguridad ocupacional y portales de autoservicio.

El alcance responde a una empresa que administra inmuebles y alquileres **y además construye edificios y obras**: el módulo debe permitir responder *cuánto cuesta la mano de obra de cada proyecto* y alimentar Contabilidad, costos de proyecto y Reportes.

## 2. Alcance (ciclo de vida)

```
RECLUTAMIENTO → CANDIDATO → CONTRATACIÓN → EMPLEADO → CONTRATO
      → PUESTO + DEPARTAMENTO → PROYECTO / OBRA → HORARIO / TURNO
      → ASISTENCIA → HORAS EXTRAS / AUSENCIAS / VACACIONES
      → INCIDENCIAS → CÁLCULO DE PLANILLA → REVISIÓN → APROBACIÓN
      → PAGO → CONTABILIZACIÓN → COSTO DEL PROYECTO → REPORTES
```

## 3. Requisitos funcionales

### 3.1 Organización y empleados

- **RF-RH-01** **Multiempresa y sucursales**: empresas, sucursales, ubicaciones, datos fiscales/legales y configuración de planilla por empresa; **todos** los datos RH quedan aislados por empresa (ver RD-RH-11).
- **RF-RH-02** **Departamentos**: administración, RRHH, finanzas, contabilidad, construcción, ingeniería, arquitectura, mantenimiento, operaciones, ventas, alquileres, seguridad, limpieza (catálogo abierto).
- **RF-RH-03** **Puestos**: código, nombre, departamento, descripción, nivel jerárquico, salario mínimo/máximo, jefe inmediato (por defecto del puesto), requisitos y estado.
- **RF-RH-04** **Centros de costo**: código (p.ej. `CON-001` Torre Central, `ADM-001`, `MNT-001`, `ALQ-001`), empresa, departamento, proyecto/obra y cuenta contable asociada.
- **RF-RH-05** **Proyectos y obras**: proyectos de construcción y obras con ubicación, etapas, supervisores y centros de costo; asignación de empleados y distribución de costos (porcentaje, horas o directa). *(Decisión D3: en v1, `Proyecto`/`Obra` viven en el esquema `hr` como datos de referencia para costos laborales; un módulo de Gestión de Proyectos futuro podría absorberlos.)*
- **RF-RH-06** **Registro de empleado**: datos personales (código único por empresa, nombres, apellidos, fecha de nacimiento, nacionalidad, estado civil, identificación, teléfono, correo, dirección, contacto de emergencia) y datos laborales (empresa, sucursal, departamento, puesto, jefe inmediato, proyecto, centro de costo, tipo de empleado, tipo de contrato, fechas de ingreso/contrato/fin de contrato, salario, frecuencia de pago, jornada, horario, estado laboral, cuenta bancaria para pago).
- **RF-RH-07** **Estados del empleado** con historial: `Preingreso`, `Activo`, `Suspendido`, `En vacaciones`, `En licencia`, `En incapacidad`, `Inactivo`, `Renunciado`, `Terminado`, `Jubilado`. Todo cambio de estado queda en el historial (FL-RH-01).
- **RF-RH-08** **Expediente digital**: documentos (identidad, contrato, adendas, hoja de vida, títulos, certificaciones, licencias, certificados médicos, documentos fiscales/bancarios/seguridad, evaluaciones, memorandos, terminación, otros) con **carga, descarga, visualización, eliminación según permisos, versionado, fecha de vencimiento y alerta, clasificación, acceso restringido y auditoría** (binarios en Object Storage, hash en BD — ADR-014).
- **RF-RH-09** **Historial laboral** (append-only): cambios de puesto, departamento, salario, proyecto, jefe, contrato, horario, centro de costo y estado con fecha, usuario, **valor anterior, valor nuevo** y motivo.
- **RF-RH-10** **Contratos laborales**: tipo (indefinido, temporal, por proyecto, por obra determinada, tiempo parcial, pasantía, otros), fechas, salario, jornada, horario, periodo de prueba, puesto, departamento, proyecto, jefe, centro de costo, forma y frecuencia de pago, beneficios y deducciones. Historial de contratos y adendas.
- **RF-RH-11** **Asignación de costos por proyecto**: un empleado puede trabajar en varios proyectos/obras con distribución por porcentaje (50/30/20), por horas (80/50/30) o directa (100% → un proyecto), manual o automática, asociada a centro de costo.

### 3.2 Asistencia y tiempo libre

- **RF-RH-12** **Horarios y turnos**: administrativos, de obra, rotativos, nocturnos, jornadas extendidas/parciales, días laborables, descansos, horarios de comida y turnos especiales; horario asignado por empleado.
- **RF-RH-13** **Asistencia**: marcación de entrada/salida/pausas, horas trabajadas, horas normales, horas extras, llegadas tardías, salidas anticipadas, ausencias y feriados. La integración con **relojes biométricos, tarjetas, apps móviles o control de acceso** va detrás de un port-adapter (`IMarcacionProvider`), Fase 2 `(SUPUESTO PA-###)`.
- **RF-RH-14** **Horas extras**: registro o solicitud → **aprobación** (supervisor de obra → jefe de proyecto → RRHH) → clasificación → asociación a proyecto/centro de costo → cálculo → incorporación automática a la planilla. No entran a planilla sin aprobar (RN-RH-07).
- **RF-RH-15** **Feriados**: calendario configurable de feriados nacionales y empresariales con activación/desactivación y reglas de pago (`trabajó en feriado`).
- **RF-RH-16** **Vacaciones**: políticas configurables, generación/acumulación de saldos, solicitud → aprobación del supervisor/RRHH, consulta de saldo/días utilizados/pendientes, calendario e historial. No se solicitan días por encima del saldo salvo política (RN-RH-06). Pago de vacaciones según reglas legales parametrizadas (`SUPUESTO PA-17`).
- **RF-RH-17** **Permisos**: personales, laborales, médicos, salidas de jornada, tardanzas/ausencias justificadas o injustificadas; cada solicitud con tipo, fecha/hora, motivo, documento de respaldo, estado, aprobador y fecha de aprobación.
- **RF-RH-18** **Incapacidades**: fecha inicial/final, días, tipo, documento de respaldo, impacto en planilla y fecha de reincorporación. **Los datos médicos son sensibles** y su acceso está restringido (RD-RH-07).

### 3.3 Compensaciones, prestaciones y deuda del colaborador

- **RF-RH-19** **Conceptos de ingreso**: salario base, horas extras, bonificaciones, comisiones, incentivos, viáticos, bonos, primas y otros; cada concepto con nombre, código, tipo, fórmula, monto/porcentaje, periodicidad, vigencia, **gravable**, genera deducciones, afecta prestaciones y afecta vacaciones.
- **RF-RH-20** **Deducciones**: impuestos, seguridad social, préstamos, anticipos, seguros, descuentos autorizados y embargos (cuando aplique legalmente); con monto/porcentaje, periodicidad, vigencia, saldo pendiente, prioridad y estado.
- **RF-RH-21** **Préstamos a empleados**: monto, tasa (cuando corresponda), número de cuotas, frecuencia, **tabla de amortización**, descuento automático en planilla, pagos/abonos extraordinarios, saldo, cancelación e historial.
- **RF-RH-22** **Anticipos salariales**: solicitud → aprobación → pago → descuento automático en planilla; consulta de saldo e historial.

### 3.4 Nómina

- **RF-RH-23** **Periodos de planilla**: semanal, quincenal, mensual, especial, extraordinaria y liquidación final, con fecha inicial/final, fecha de pago, empresa, empleados incluidos y proyectos/departamentos/centros de costo incluidos.
- **RF-RH-24** **Cálculo automático**: por empleado combina salario/jornada/contrato/beneficios/deducciones con días trabajados, horas normales/extras, vacaciones, permisos, incapacidades, ausencias, feriados y demás conceptos. Fórmula: `Salario base + ingresos adicionales + horas extras + bonificaciones − deducciones − préstamos − anticipos − retenciones = Salario neto`.
- **RF-RH-25** **Motor de reglas de nómina** (ADR-022): conceptos, fórmulas, porcentajes, topes, bases de cálculo, excepciones, periodicidad, vigencia, reglas por empleado/contrato/tipo de empleado y reglas legales — **configurables**, no fijas en código. La versión de reglas activa queda registrada junto al cálculo (versión y vigencia).
- **RF-RH-26** **Configuración legal por jurisdicción**: seguridad social, ISR/retenciones, aportes patronales, vacaciones, horas extras, feriados, incapacidades, bonificaciones legales, indemnizaciones, terminaciones, topes de cotización y bases imponibles; cada regla con vigencia, valor/porcentaje/fórmula, jurisdicción, tipo de empleado y observaciones **`(SUPUESTO PA-17 — pendiente validación CPA/legal)`**.
- **RF-RH-27** **Flujo de estados de la planilla**: `Borrador → Calculada → Revisada → Aprobada → Cerrada → Pagada`. Una planilla **cerrada es inmutable** (snapshot de cálculos, RN-RH-11); **reapertura** con permiso especial, usuario, fecha y motivo (RN-RH-12, RD-RH-05).
- **RF-RH-28** **Recibos de pago**: comprobante por empleado y periodo, **inmutable y versionado** (mismo patrón ADR-014 de comprobantes PDF), visible en el portal del empleado.
- **RF-RH-29** **Costos por proyecto**: el cálculo produce mano de obra directa e indirecta por proyecto/obra/centro de costo para alimentar presupuestos, control financiero y rentabilidad de proyectos.
- **RF-RH-30** **Liquidación laboral**: renuncia, terminación, fin de contrato, jubilación u otra causa; calcula salarios y vacaciones pendientes, bonificaciones/deducciones pendientes, saldos de préstamos/anticipos e **indemnización según reglas legales configuradas**; genera documento de liquidación inmutable.
- **RF-RH-31** **Integración contable**: la planilla **aprobada** genera **asientos borrador** en Contabilidad (gastos de salarios, horas extras, beneficios, mano de obra directa/indirecta en débitos; bancos, retenciones, CSS, impuestos, préstamos y otras CxP en créditos) con distribución empresa → departamento → proyecto → centro de costo → cuenta contable (mismo contrato de FL-CTB-03). Contabilidad sigue siendo quien **aprueba** el asiento.
- **RF-RH-32** **Integración bancaria**: la planilla aprobada genera **archivo de pago / débito ACH** por banco y cuenta (diseño port-adapter `IPayrollFileBuilder`, `(SUPUESTO PA-###)`); estados `Generado → Enviado → Confirmado → Pagada`, con banco, cuenta, beneficiario, monto, fecha, estado y referencia bancaria.

### 3.5 Reclutamiento, desarrollo y salida

- **RF-RH-33** **Reclutamiento**: vacantes → candidatos (CV, etapas, entrevistas, evaluaciones) → aprobación → oferta → contratación.
- **RF-RH-34** **Onboarding** (checklist): expediente, solicitud de documentos, firma de contrato, asignación de puesto/departamento/proyecto/horario, creación de usuario y permisos (Integración con Identity), entrega de equipos, capacitación inicial y de seguridad.
- **RF-RH-35** **Offboarding** (checklist): motivo, fecha de salida, cálculo de liquidación, **bloqueo de acceso al sistema** (Integración con Identity), recuperación de equipos/llaves/tarjetas/herramientas, cierre de préstamos, documentación y archivo del expediente.
- **RF-RH-36** **Evaluación de desempeño**: evaluaciones periódicas, objetivos, KPIs y competencias, autoevaluación, evaluación del supervisor, comentarios, resultados y planes de mejora.
- **RF-RH-37** **Capacitaciones**: cursos/capacitaciones/certificaciones, proveedores, fechas, costos, participantes, resultados, documentos y vencimientos; énfasis en seguridad para personal de obra (trabajo en altura, EPP, maquinaria, procedimientos).

### 3.6 Seguridad ocupacional y activos entregados

- **RF-RH-38** **Seguridad ocupacional**: EPP (equipos de protección personal) con entrega, cantidad, talla y renovación; accidentes e incidentes con investigación y documentación.
- **RF-RH-39** **Equipos y activos entregados**: computadoras, teléfonos, herramientas, uniformes, cascos, chalecos, botas, EPP, llaves, tarjetas, vehículos y otros; registro de entrega (activo, empleado, fecha, condición, responsable), devolución (fecha, condición) y observaciones.

### 3.7 Portales, notificaciones, reportes y auditoría

- **RF-RH-40** **Portal del empleado** (autoservicio): consulta de información personal/laboral, contrato, salario (con permiso), recibos de pago, asistencia, horas extras, vacaciones, permisos, incapacidades, préstamos, anticipos, documentos y notificaciones; solicitudes de vacaciones/permisos/anticipos y actualización de información autorizada. **Solo su propia información** (recurso derivado de su relación, no de roles globales).
- **RF-RH-41** **Portal del supervisor**: empleados bajo su responsabilidad (según estructura organizacional), asistencia, incidencias, horas extras, vacaciones/permisos, proyectos y evaluaciones.
- **RF-RH-42** **Notificaciones**: vencimientos (contratos, documentos, certificaciones), solicitudes (vacaciones, permisos, horas extras), planillas pendientes de aprobación, préstamos por finalizar, incidencias, cumpleaños y reincorporaciones; canales Plataforma + Email (SMS/WhatsApp en Fase 2, `INotificationChannel`).
- **RF-RH-43** **Reportes RH**: empleados (activos, inactivos, altas, bajas, rotación, antigüedad, cumpleaños, por departamento/proyecto/puesto/empresa), asistencia (ausencias, tardanzas, horas extras), vacaciones (saldos, usadas, pendientes), nómina (detallada, resumen, salarios, ingresos, deducciones, neto, aportes patronales) y costos (por proyecto, departamento, centro de costo). Cada reporte exige su permiso fuente (patrón de `docs/modulos/reportes.md`).
- **RF-RH-44** **Dashboard RH**: total y empleados activos, nuevos, retirados, ausentismo, horas extras, costo total de nómina, costo por proyecto, vacaciones pendientes y vencimientos próximos.
- **RF-RH-45** **Mano de obra directa/indirecta por obra** para responder: ¿cuántas horas y cuánto se gastó en cada proyecto? ¿quién trabajó en cada obra? (flujo `EMPLEADO → HORAS → PROYECTO/OBRA → CENTRO DE COSTO → COSTO DE MANO DE OBRA → PLANILLA → CONTABILIDAD → COSTO REAL DEL PROYECTO`).
- **RF-RH-46** **Auditoría** de operaciones sensibles: cambios salariales, contratos, planillas, bonificaciones/deducciones, préstamos, aprobaciones/cancelaciones, reaperturas, eliminaciones y cambios de permisos; con usuario, fecha, hora, acción, registro, valor anterior/nuevo, IP y motivo (patrón de Auditoría del esquema `audit`, correlación con `TraceId`).

## 4. Campos (resumen)

| Submódulo | Entidad | Reglas clave |
|---|---|---|
| Organización | `Empresa`, `Sucursal`, `Departamento`, `Puesto`, `CentroCosto` | estructura por empresa; códigos únicos; puesto con salario min/max |
| Proyectos | `Proyecto`, `Obra`, `EtapaProyecto`, `AsignacionProyecto` (empleado + % / horas) | distribución manual/automática; centro de costo |
| Empleados | `Empleado` (info personal + laboral), `ContactoEmergencia`, `CuentaBancariaEmpleado`, `EstadoEmpleado` (historial), `HistorialLaboral`, `ExpedienteDocumento` | código único por empresa; identificación única; estados con historial; salario (monetario, centavos) |
| Contratos | `ContratoLaboral`, `Adenda` | tipo, fechas, salario, jornada, periodo de prueba; historial |
| Asistencia | `Horario`, `Turno`, `Marcacion`, `IncidenciaAsistencia`, `HoraExtra`, `SolicitudHoraExtra`, `Feriado` | marcación; horas extras requieren aprobación; feriados configurables |
| Tiempo libre | `PoliticaVacaciones`, `SolicitudVacacion`, `SolicitudPermiso`, `Incapacidad` | saldos; flujos de aprobación; incapacidades sensibles |
| Compensaciones | `ConceptoNomina` (ingreso/deducción), `PrestamoEmpleado`, `PrestamoCuota`, `Anticipo` | concepto configurable (fórmula/monto/%; gravable; afecta prestaciones); amortización |
| Nómina | `PeriodoPlanilla`, `Planilla`, `PlanillaEmpleado`, `PlanillaConcepto` (detalle append-only), `ReglaNomina` + `VigenciaRegla`, `Liquidacion`, `LiquidacionConcepto`, `ReciboPago` | estados inmutables; snapshot de reglas y cálculo; montos en centavos |
| Reclutamiento | `Vacante`, `Candidato`, `Entrevista`, `Oferta`, `ChecklistOnboarding`, `ChecklistOffboarding` | flujo vacante → oferta → contratación; checklists |
| Desarrollo | `Evaluacion`, `ObjetivoEvaluacion`, `CompetenciaEvaluacion`, `Capacitacion`, `CapacitacionParticipante` | evaluaciones y certificaciones con vencimiento |
| Seguridad ocupacional | `EppEntrega`, `Accidente`, `AccidenteInvestigacion`, `EquipoEntregado` | entrega/renovación EPP; activos y devoluciones |

> Modelo de datos completo: esquema `hr` (soberanía de ADR-015; sin FK entre esquemas; referencias a Identity, Contabilidad y Notificaciones solo por contrato).

## 5. Permisos

| Acción | Permiso |
|---|---|
| Ver empleados/expedientes (datos no salariales) | `rrhh.empleados.ver` |
| Crear/editar empleados, expedientes, documentos e historial laboral | `rrhh.empleados.gestionar` |
| Ver información salarial y de nómina (protegido) | `rrhh.salarios.ver` |
| Configurar empresas/sucursales, departamentos, puestos, centros de costo | `rrhh.organizacion.gestionar` |
| Asignar empleados a proyectos/obras y distribuir costos | `rrhh.proyectos.asignar` |
| Gestionar contratos laborales y adendas | `rrhh.contratos.gestionar` |
| Consultar asistencia (propia o del equipo autorizado) | `rrhh.asistencia.ver` |
| Registrar/corregir asistencia y marcaciones | `rrhh.asistencia.gestionar` |
| Aprobar/rechazar horas extras | `rrhh.horasextras.aprobar` |
| Aprobar vacaciones y permisos | `rrhh.ausencias.aprobar` |
| Registrar incapacidades (datos médicos protegidos) | `rrhh.incapacidades.gestionar` |
| Gestionar préstamos y anticipos | `rrhh.prestamos.gestionar` |
| Crear/calcular planilla (borrador → calculada) | `rrhh.nomina.crear` |
| Revisar planilla calculada | `rrhh.nomina.revisar` |
| Aprobar/cerrar planilla (usuario **distinto** del que creó) | `rrhh.nomina.aprobar` |
| Generar archivo bancario y registrar pago/confirmación | `rrhh.nomina.pagar` |
| Reabrir planilla cerrada (permiso especial + motivo) | `rrhh.nomina.reabrir` |
| Generar asientos borrador hacia Contabilidad | `rrhh.nomina.contabilizar` |
| Calcular/aprobar liquidaciones laborales | `rrhh.liquidaciones.gestionar` |
| Vacantes, candidatos, ofertas, onboarding/offboarding | `rrhh.reclutamiento.gestionar` |
| Evaluaciones y capacitaciones | `rrhh.desarrollo.gestionar` |
| EPP, accidentes/incidentes y equipos entregados | `rrhh.seguridad-ocupacional.gestionar` |
| Configurar reglas de nómina, conceptos, feriados y políticas | `rrhh.configuracion` |
| Ver reportes/dashboard RH (además del permiso fuente del reporte) | `rrhh.reportes.ver` |

> **Alcance organizacional**: un permiso puede además acotarse por empresa, departamento o proyecto (ej. Supervisor que aprueba solo del proyecto que supervisa). El backend aplica el filtro; nunca se confía en el filtro del frontend (RN-S01, IDOR).

> Nota: estos permisos (marcados **[P]**, salvo `rrhh.empleados.ver` y `rrhh.asistencia.ver` que el prototipo ya muestra como preview `features.empleados`) se incorporan al catálogo oficial de `docs/modulos/README.md` §4.

## 6. Restricciones de datos (RD)

- **RD-RH-01** Todo empleado tiene **código único por empresa** (RN-RH-01).
- **RD-RH-02** Tipo y número de identificación únicos por persona **dentro de la empresa**; la cédula/RUC se guarda **cifrada en reposo** (Ley 81/2019, mismo patrón que `crm`).
- **RD-RH-03** Todo monto es **entero en centavos** (`BIGINT`), `>= 0` donde aplique (ADR-010); salarios y conceptos validados por `CHECK`.
- **RD-RH-04** Un empleado **Activo** requiere al menos un **contrato laboral vigente** (RN-RH-02); se valida al contratar, pagar planilla y liquidar.
- **RD-RH-05** La planilla **cerrada es inmutable**: `PlanillaConcepto` y los totales de empleado son **append-only** (RN-RH-11); toda corrección = reapertura controlada + nueva versión (RN-RH-12).
- **RD-RH-06** `HistorialLaboral` y `EstadoEmpleado` son **append-only** (nunca se edita o elimina un registro histórico).
- **RD-RH-07** **Incapacidades y datos médicos**: acceso restringido; visible solo con `rrhh.incapacidades.gestionar` y no se incluye en reportes generales sin permiso específico.
- **RD-RH-08** Documentos de expediente: binario en Object Storage con **hash** en BD y referencias versionadas (ADR-014); nunca se reescribe un documento con otra versión.
- **RD-RH-09** No se solicita vacaciones ni permisos por encima del **saldo disponible**, salvo que la política de vacaciones lo permita explícitamente (RN-RH-06).
- **RD-RH-10** Las **horas extras no aprobadas** no pueden incluirse en planilla (RN-RH-07); si un flujo alternativo se configura, queda registrado por política.
- **RD-RH-11** **Multiempresa**: todas las tablas de `hr` llevan `EmpresaId`; está **prohibido** cruzar datos entre empresas (no hay consulta sin filtro de empresa); los reportes y asientos contables se acotan a la empresa del contexto.
- **RD-RH-12** Préstamos/anticipos: saldo pendiente `>= 0`; la tabla de amortización se regenera solo por **cambio aprobado** (abono, tasa o plazo), nunca editando cuotas ya aplicadas a planilla.
- **RD-RH-13** Salario y frecuencia de pago: el salario no puede ser inferior al mínimo legal configurado **`(SUPUESTO PA-17)`**; el cambio de salario exige permiso `rrhh.empleados.gestionar` **o** acto de origen (contrato/adenda) y queda auditado.
- **RD-RH-14** Un periodo de planilla es **único por (empresa, tipo, fecha inicial, fecha final)**; no se solapan periodos del mismo tipo por empresa.

## 7. Restricciones de flujo (FL)

- **FL-RH-01** **Estados del empleado**: transiciones válidas validadas por el backend (p.ej. `Preingreso → Activo`; `Activo → Suspendido / En vacaciones / En licencia / En incapacidad / Inactivo`; terminales `Renunciado / Terminado / Jubilado`). Cada transición genera registro en `EstadoEmpleado` con responsable y fecha.
- **FL-RH-02** **Planilla**: `Borrador → Calculada → Revisada → Aprobada → Cerrada → Pagada`; cada transición exige su permiso (crear ≠ revisar ≠ aprobar ≠ pagar, separación de funciones FL-CTB-01). La reapertura exige `rrhh.nomina.reabrir` + motivo + usuario registrado (RN-RH-12).
- **FL-RH-03** **Horas extras**: `Registro/Solicitud → Aprobación (supervisor → jefe de proyecto → RRHH) → Cálculo → Planilla` (RN-RH-07).
- **FL-RH-04** **Vacaciones/permisos**: `Empleado → Supervisor → RRHH → Aprobado/Rechazado`; cada solicitud con historial; el saldo se descuenta al aprobarse.
- **FL-RH-05** **Onboarding/offboarding**: proceso por **checklist**; no se crea usuario (Identity) sin completar pasos obligatorios; al offboarding el acceso se **bloquea antes** del último pago/liquidación.
- **FL-RH-06** **Contabilización**: la planilla **aprobada** genera **asientos borrador** en Contabilidad (FL-CTB-03) con la referencia del periodo; el asiento lo **aprueba** Contabilidad (separación de funciones). La contabilización es idempotente por periodo (no genera dobles asientos).
- **FL-RH-07** **Pago bancario**: `Planilla aprobada → Generar archivo → Enviar → Confirmar → Pagada`; una planilla `Pagada` no puede revertirse sin proceso de reversión/pago negativo y asiento de reversión.
- **FL-RH-08** **Portal del empleado**: solo visualiza su propia información y sus solicitudes (recurso derivado, patrón IDOR); el **portal del supervisor** solo visualiza el equipo que tiene bajo su responsabilidad según la estructura organizacional (nunca un listado global).
- **FL-RH-09** **Reportes/costos**: los costos por proyecto se calculan al cerrar la planilla (snapshot); un reporte de costo usa el snapshot, no datos vivos editables.

## 8. Reglas de negocio (RN-RH)

- **RN-RH-01** Todo empleado tiene **código único dentro de su empresa**.
- **RN-RH-02** Un empleado con estado `Activo` **tiene en todo momento al menos un contrato laboral vigente**.
- **RN-RH-03** Una planilla **cerrada no se modifica directamente** (inmutabilidad).
- **RN-RH-04** Toda modificación de **información sensible** (salarios, contratos, planillas, deducciones, bonificaciones, préstamos, aprobaciones, liquidaciones) queda **registrada en auditoría**.
- **RN-RH-05** Los **cambios salariales conservan historial** (nunca se sobreescribe el valor anterior).
- **RN-RH-06** No se solicitan vacaciones por encima del **saldo disponible**, salvo política configurada.
- **RN-RH-07** Las horas extras entran a planilla **solo aprobadas**, salvo flujo alternativo configurado.
- **RN-RH-08** Las horas trabajadas se asocian a **uno o varios proyectos/obras** (y a su centro de costo).
- **RN-RH-09** Los costos laborales se distribuyen **por proyecto y centro de costo** para alimentar Contabilidad/costos.
- **RN-RH-10** Los empleados solo acceden a la **información autorizada** (propia o del equipo a cargo según permisos/alcance).
- **RN-RH-11** Una planilla aprobada genera un **registro inmutable** de los cálculos realizados (snapshot de reglas y conceptos).
- **RN-RH-12** La **reapertura** de una planilla requiere permiso especial, registra usuario, fecha y motivo (auditoría).
- **RN-RH-13** Los contratistas/subcontratistas (honorarios sin relación laboral) **no se incluyen en planilla** en v1; se registran como terceros y se facturan por fuera (Decisión D8).

## 9. Casos de uso (CU)

- **CU-RH-01** Registrar empleado (datos personales + laborales + contrato inicial + cuenta bancaria).
- **CU-RH-02** Gestionar expediente digital: cargar/consultar/descargar/eliminar documento con permisos, versionado, hash y alertas de vencimiento.
- **CU-RH-03** Gestionar contratos y adendas (tipo, salario, jornada, fechas, período de prueba).
- **CU-RH-04** Asignar empleado a proyectos/obras y distribuir costos manual o automáticamente (porcentaje/horas/directa).
- **CU-RH-05** Registrar marcaciones (manual o port-adapter) y visualizar asistencia/tardanzas/ausencias.
- **CU-RH-06** Solicitar, aprobar y registrar horas extras; incorporarlas a la planilla solo aprobadas.
- **CU-RH-07** Solicitar, aprobar y registrar vacaciones y permisos con saldos y calendario.
- **CU-RH-08** Registrar incapacidades y controlar reincorporación (datos médicos restringidos).
- **CU-RH-09** Gestionar préstamos y anticipos (amortización, descuentos, saldos).
- **CU-RH-10** Crear y calcular planilla (borrador → calculada) con motor de reglas parametrizable y snapshot.
- **CU-RH-11** Revisar, aprobar y cerrar planilla con separación de funciones (rev: quien crea no aprueba; FL-CTB-01/03).
- **CU-RH-12** Generar archivo bancario y registrar pago/confirmación de planilla.
- **CU-RH-13** Generar asientos borrador de planilla hacia Contabilidad (idempotente por periodo; aprobación en Contabilidad).
- **CU-RH-14** Calcular y aprobar liquidaciones laborales (renuncia, terminación, fin de contrato, jubilación) con indemnización parametrizada.

## 10. Resumen en Dashboard (vista preliminar del módulo)

- Total empleados y activos por empresa/departamento/proyecto.
- Altas y bajas del periodo; rotación; ausentismo y tardanzas.
- Horas extras aprobadas y costo asociado.
- Costo total de nómina del periodo y por proyecto/obra/centro de costo.
- Vacaciones pendientes; vencimientos próximos (contratos, documentos, certificaciones).
- Alertas cuando las reglas utilizadas están fuera de vigencia.

## 11. Dependencias con otros módulos

| Módulo | Dependencia de Recursos Humanos | Dependencia hacia Recursos Humanos |
|---|---|---|
| **Identity / Administración** | Usuarios y permisos `rrhh.*` + RBAC; fechas de vigencia de documentos como condición de acceso | Onboarding crea usuario y permisos; offboarding bloquea acceso |
| **Contabilidad** | Asientos de planilla (**asientos borrador**, FL-CTB-03); catálogo de cuentas contables para conceptos; contabilización/cierre idempotente | Genera asientos de gastos (salarios, horas extra, beneficios, mano de obra directa/indirecta) y CxP (retenciones, CSS, bancos) por periodo |
| **Notificaciones** | Plantillas de correo; envíos de vencimientos y aprobaciones (`INotificationChannel`; SMS/WhatsApp Fase 2) | Solicita envíos por eventos de RH (solicitudes, aprobaciones, vencimientos, recibos) |
| **Reportes** | Catálogo de reportes y parámetros; permisos de reporte | Aporta datos de RH (empleados, asistencia, nómina, costos) a reportes globales |
| Finanzas/Cobros | Archivo bancario de pago (`IPayrollFileBuilder`, `(SUPUESTO PA-###)`) | Entrega archivo ACH/transferencias generado |
| Costos de proyecto / Presupuestos | Centro de costo y mano de obra directa/indirecta por proyecto | Proporciona costo real de mano de obra por proyecto/obra |
| Activos fijos | Equipos entregados a empleados y devoluciones (RF-RH-39) | Registra responsables/activos para control |

## 12. Decisiones y preguntas abiertas

- **D3** — Proyecto/Obra viven en `hr` en v1 como datos de referencia para costos laborales; un módulo futuro de Gestión de Proyectos podría absorberlos sin romper `hr`.
- **D8** — Contratistas/subcontratistas (honorarios) no entran a planilla en v1 (se facturan como terceros).
- **`SUPUESTO PA-17`** — Todas las reglas legales/fiscales panameñas (CSS, ISR/retenciones DGI, décimo tercer mes, horas extras, vacaciones, preaviso/indemnización) **pendientes de validación con CPA y asesor legal** antes de implementar.
- **Integración biométrica** — Relojes biométricos/APP móvil/control de acceso vía `IMarcacionProvider` (Fase 2), `(SUPUESTO PA-###)`.
- **Archivo bancario** — Diseño `IPayrollFileBuilder` por banco (Fase 2), `(SUPUESTO PA-###)`.
- Cifrado de datos personales del empleado y cédula (Ley 81): alineado con `crm`; revisar alcance en revisión legal.
- **Flujo de aprobación de vacaciones/permisos**: validar necesidades por empresa (jefe inmediato vs RRHH) antes de implementar ABP complejo.

## 13. Control de versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | 19/09/2026 | Solution Architect (subagente) | Documento oficial inicial del módulo de Recursos Humanos y Planilla, derivado del requerimiento RF-RH-001.