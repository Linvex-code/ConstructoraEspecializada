# Requerimientos por Módulo — Primer Borrador (v0.1)

> Documento de discusión. Cada módulo define: **objetivo**, **requisitos funcionales (RF)**, **campos**, **permisos**, **restricciones de datos (RD)** y **de flujo (FL)**, y **casos de uso (CU)**.
> Los puntos marcados `[DECISIÓN]` están abiertos y son el objetivo de la revisión.
> Los permisos nuevos (no presentes aún en el prototipo) se marcan `[P]` en el texto y en el catálogo con **negrita**.
>
> Convención de códigos:
> - `RF-xx` requisito funcional · `RD-xx` restricción de datos · `FL-xx` restricción de flujo · `CU-xx` caso de uso
> - Permisos: `modulo.accion` (catálogo en sección 0).
> - Estado de un registro: ***derivado*** = calculado por el sistema (no editable) vs ***gestionado*** = editable por usuario con permiso.

---

## 0. Catálogo de permisos (propuesta)

| Módulo | Código | Acción |
|---|---|---|
| Clientes | `clientes.read` | Ver listado/ficha/exportar |
| | `clientes.create` **[P]** | Registrar |
| | `clientes.update` **[P]** | Editar |
| | `clientes.delete` **[P]** | Desactivar/eliminar |
| | `clientes.estado.cambiar` **[P]** | Cambiar estado gestionado (Activar/Desactivar) conforme a transiciones válidas |
| | `clientes.documentos.gestionar` | Gestionar documentos en la ficha del cliente (subir/listar/descargar · asignado en roles semilla a **GERENTE** y **COBROS**) |
| Inmuebles | `inmuebles.read` | Ver catálogo/ficha |
| | `inmuebles.create` **[P]** | Registrar |
| | `inmuebles.update` **[P]** | Editar |
| | `inmuebles.delete` **[P]** | Eliminar/desactivar |
| Contratos | `contratos.read` | Ver |
| | `contratos.create` **[P]** | Crear |
| | `contratos.update` **[P]** | Editar (antes de firma) |
| | `contratos.terminar` **[P]** | Terminar anticipadamente |
| | `contratos.anular` **[P]** | Anular |
| Cobros | `cobros.recibos.generar` | Generar recibos (masivo/individual) |
| | `cobros.recibos.anular` **[P]** | Anular recibo |
| | `cobros.pagos.registrar` | Registrar pagos/cobros |
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
| Administración | `admin.usuarios` | Usuarios |
| | `admin.roles` | Roles |
| | `admin.permisos` | Catálogo/asignación |
| | `admin.configuracion` | Parámetros globales |
| | `admin.feature-flags` | Feature flags |
| Portal | `portal.ver` **[P]** | Ingreso del inquilino al portal |

Regla global (RN-S01): **el backend valida siempre** `permiso` **+ feature flag + regla de negocio**; el frontend solo controla UX.

---

## 1. Clientes

**Objetivo:** gestionar personas/empresas vinculadas a la administración (inquilinos, propietarios, ambos) y su relación con inmuebles, contratos, cobros e incidencias.

### Requisitos funcionales
- RF-CLI-01 Listar clientes con búsqueda y filtros (tipo, estado, nacionalidad, inmueble) y paginación.
- RF-CLI-02 Crear, editar, **cambiar estado gestionado**, desactivar y (restringidamente) eliminar clientes.
- RF-CLI-03 Tipos: `Inquilino`, `Propietario`, `Ambos`. Estados gestionados: `Activo`, `Inactivo`; estado **derivado**: `Mora` (ver FL).
- RF-CLI-04 Ficha con historial consolidado: contratos, recibos/pagos, incidencias reportadas, estado de mora.
- RF-CLI-05 Exportar CSV del listado (hereda `clientes.read`).
- RF-CLI-06 **Gestionar documentos en la ficha del cliente**: subir, listar y descargar adjuntos (cédula, contrato laboral, contrato firmado asociado al contrato del cliente, etc.). Permiso: `clientes.documentos.gestionar`. Los documentos de los contratos del cliente **quedan visibles también aquí** (vista agregada por cliente). Formatos PDF/JPG/PNG ≤10 MB; descarga vía URL firmada; auditoría quién/cuándo.

### Campos
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
| estado | enum | Activo / Inactivo (**gestionado**) / **Mora (derivado)** |
| inm | fk inmueble | opcional · inmueble principal |
| ciudad | texto | opcional |
| **fechaRegistro** **[P]** | fecha | alta |
| **notas** **[P]** | texto | opcional |

### Permisos
| Acción | Permiso |
|---|---|
| Ver / exportar | `clientes.read` |
| Crear | `clientes.create` |
| Editar | `clientes.update` |
| Cambiar estado (Activar/Desactivar) | `clientes.estado.cambiar` **[P]** |
| Desactivar/eliminar | `clientes.delete` |
| Gestionar documentos (subir/listar/descargar) | `clientes.documentos.gestionar` |

### Restricciones de datos
- RD-CLI-01 `ci` y `mail` únicos cuando existen.
- RD-CLI-02 `tipo` y `estado` obligatorios; estado `Mora` **no editable manualmente** — se deriva de los cobros (contrato/recibo en mora). `[DECISIÓN: ¿el cliente marca Mora si CUALQUIER recibo de un contrato asociado está en mora?]`
- RD-CLI-03 Si `inm` se asigna: el inmueble debe existir y **no tener un contrato vigente con otro cliente** (exclusividad residencial).
- RD-CLI-04 Un cliente con estado `Inactivo` no puede ser parte de contratos nuevos ni reportar incidencias.
- RD-CLI-05 No se permite eliminar (borrado físico) si existen contratos, recibos o incidencias históricos → **soft delete**: el sistema usa `Inactivo`. `[DECISIÓN: filtro para borrado definitivo solo para Administración central, con auditoría.]`
- RD-CLI-06 Transiciones de estado gestionado válidas: `Activo → Inactivo` (desactivar) y `Inactivo → Activo` (reactivar). `Mora` es **derivado**: no se edita manualmente y no se navega directamente desde/hacia él. `[P: `clientes.estado.cambiar`]`
- RD-CLI-07 **Desactivación condicionada**: no se permite `Activo → Inactivo` si el cliente tiene un contrato `Vigente`/`Mora` con recibos cobrados pendientes o si existen recibos **sin cobrar** (`Emitido`/`En mora`) asociados a sus contratos. El sistema evalúa: contratos activos y mora/recepciones pendientes. `[DECISIÓN: política estricta (bloquear) vs. política con confirmación reforzada]`
- RD-CLI-08 **Documentos del cliente**: adjuntos PDF/JPG/PNG ≤10 MB; se almacenan fuera del webroot y se sirven con **URL firmada** (RN-S01); el cliente/jurídico que sube se audita. Los documentos de los contratos del cliente se listan en la ficha de forma agregada (solo lectura de referencia para el módulo Clientes; la propiedad del documento vive en Contratos).

### Restricciones de flujo
- FL-CLI-01 Alta de cliente **no crea contrato** ni asigna inmueble automáticamente (flujos separados).
- FL-CLI-02 `Mora` se recalcula al registrar pago (se limpia) o al emitir recibo vencido (se marca). Es derivado, nunca editado.
- FL-CLI-03 Desactivar un cliente: **bloquea nuevo contrato y nuevas incidencias**; los contratos vigentes continúan gestionándose hasta su término (o se evalúa caso a caso). `[DECISIÓN]`
- FL-CLI-04 Al crear un cliente con `tipo in (Inquilino, Ambos)`, el sistema ofrece (opcional) enviar credenciales del portal inquilino si `portal.ver` está habilitado. `[DECISIÓN]`
- FL-CLI-05 Cambio de estado gestionado (permiso `clientes.estado.cambiar`): acción de fila ⋮ → confirma con diálogo que explica consecuencia → valida RD-CLI-07 en **backend** (RN-S01: el frontend solo controla UX) → `Activo/Inactivo`. La reactivación (`Inactivo → Activo`) valida que no existan candados pendientes (RD-CLI-07 solo aplica en desactivación; la reactivación es libre salvo bloqueo derivado).
- FL-CLI-06 Subir documento en la ficha del cliente requiere `clientes.documentos.gestionar`: zona de carga (patrón upload del design system §6.29) → valida formato/tamaño → confirma → muestra chip "Cargado" en la pestaña Documentos. La descarga pide URL firmada al BFF; los documentos de contrato se muestran con origen "Contrato ARR-…". `[DECISIÓN: ¿los documentos del contrato se pueden eliminar desde la ficha del cliente o solo ver/descargar?]`

### Casos de uso
- **CU-CLI-01 Registrar cliente.** Precond: permiso `clientes.create`. Pasos: datos → valida unicidad → guarda con estado `Activo`. Resultado: cliente creado, listo para contrato.
- **CU-CLI-02 Consultar ficha con historial.** Precond: `clientes.read`. Resultado: datos + contratos + recibos + incidencias + estado de mora.
- **CU-CLI-03 Editar datos.** Precond: `clientes.update`. No permite editar `estado=Mora` (derivado). Resultado: cambios registrados con auditoría.
- **CU-CLI-04 Desactivar/eliminar.** Precond: `clientes.estado.cambiar` (desactivación) y `clientes.delete` (borrado físico). Desactivar valida RD-CLI-07 (sin contratos/recibos pendientes) y confirma con diálogo. Si hay historial → desactiva; si no → borra. Resultado y auditoría según FL-CLI-05.
- **CU-CLI-05 Exportar listado.** Precond: `clientes.read`. Genera CSV con los mismos datos que el listado visible.
- **CU-CLI-06 Abrir menú de acciones de fila.** Precond: `clientes.read`. La acción de fila (⋮) abre un menú contextual con acciones según permisos (Ver ficha, Editar, Cambiar estado, Desactivar), conforme al patrón de tabla/menú del design system (§5.1, §6.5, §6.22).
- **CU-CLI-07 Gestionar documentos del cliente.** Precond: `clientes.documentos.gestionar` para subir/eliminar adjuntos de la ficha; `clientes.read` para ver/descargar. Pasos: pestaña Documentos → [+ Subir documento] → zona de carga (§6.29) → validación formato/tamaño → guarda con auditoría. Resultado: documento listado con chip "Cargado", descargable con URL firmada; los documentos de contrato aparecen agregados con referencia al contrato.

### Resumen en dashboard
Widget **Clientes**: Total 8 · Activos 6 · Mora 1 · Propietarios 2 · Inquilinos 4 (permiso: `clientes.read`).

---

## 2. Inmuebles

**Objetivo:** catálogo de unidades bajo administración (apartamentos, locales, casas, oficinas) con características, estado operativo y titularidad.

### Requisitos funcionales
- RF-INM-01 CRUD de inmuebles con filtros (tipo, estado, torre/ubicación) y paginación.
- RF-INM-02 Tipos: `Apartamento`, `Local comercial`, `Casa`, `Oficina`. Estados: `Disponible`, `Alquilado`, `En mantenimiento`, `Reservado` **[P]**.
- RF-INM-03 Ficha con datos, titularidad, contrato vigente, incidencias activas, equipos de línea blanca asociados.
- RF-INM-04 Vista de ocupación: total, alquilados, disponibles por tipo (dato del widget y de Reportes).
- RF-INM-05 Historial de estados con fechas **[P]** (para trazabilidad).

### Campos
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

### Permisos
| Acción | Permiso |
|---|---|
| Ver | `inmuebles.read` |
| Crear / editar | `inmuebles.create` / `inmuebles.update` |
| Eliminar/desactivar | `inmuebles.delete` |

### Restricciones de datos
- RD-INM-01 `ref` única; `tipo` y `estado` obligatorios; `m2 > 0`.
- RD-INM-02 `Alquilado` y `Reservado` **requieren** contrato de arrendamiento vigente o previsto (reserva sin firmar) `[DECISIÓN: ¿Reservado admite 0 contratos?]`.
- RD-INM-03 `En mantenimiento` admite incidencias de obra pero **bloquea nuevos contratos**.
- RD-INM-04 No se borra físicamente si tiene historial → `Desactivado` **[P]** (estado adicional o `delete` con restricción). `[DECISIÓN]`
- RD-INM-05 **Exclusividad de ocupación**: un inmueble `Alquilado` (o con contrato `Vigente`/`Mora`) **no se ofrece como candidato** para un nuevo contrato ni como `inm` principal de otro cliente. Solo `Disponible`/`Reservado` son candidatos (validado en el selector del frontend **y re-validado en backend** — RN-S01).

### Restricciones de flujo
- FL-INM-01 Transiciones válidas: `Disponible → Reservado → Alquilado` (reserva opcional), `Alquilado → Disponible` solo tras **fin/terminación de contrato** (lo hace Contratos, no Inmuebles), `Disponible/Alquilado → En mantenimiento` (requiere aviso si hay ocupante), `En mantenimiento → Disponible`.
- FL-INM-02 Un inmueble `En mantenimiento` con inquilino activo: los cobros siguen, pero las incidencias internas se marcan como obra. `[DECISIÓN: ¿se inhabilita reporte de incidencia del ocupante? NO, preferido mantener reporte.]`
- FL-INM-03 No puede haber dos contratos vigentes sobre el mismo inmueble (validado en Contratos, visible aquí).

### Casos de uso
- **CU-INM-01 Registrar inmueble.** Precond: `inmuebles.create`.
- **CU-INM-02 Consultar ficha** (contrato, incidencias, equipos, estados). Precond: `inmuebles.read`.
- **CU-INM-03 Cambiar estado** con validación de FL-INM-01. Precond: `inmuebles.update`.
- **CU-INM-04 Ver ocupación por tipo.** Precond: `inmuebles.read`.

### Resumen en dashboard
Widget **Inmuebles**: Total 7 · Alquilados 5 · Disponibles 1 · En mantenimiento 1 (permiso: `inmuebles.read`; detalle por tipo en la ficha/Reportes).

---

## 3. Contratos

**Objetivo:** gestionar contratos de arrendamiento y de administración (canon, vigencia, garantía, comisión, ITBMS) y disparar los flujos de cobros y liquidación.

### Requisitos funcionales
- RF-CON-01 Crear contrato a partir de **cliente + inmueble** con validaciones cruzadas (disponibilidad del inmueble y estado del cliente).
- RF-CON-02 Tipos: `Arrendamiento` (canon) y `Administración` (comisión % sobre ingreso, canon null).
- RF-CON-03 Vigencia por fechas (ini/fin), día de facturación (`dia`), garantía (meses/monto), ITBMS configurable (p.ej. 7%).
- RF-CON-04 Renovación (extensión de fin) y **terminación anticipada** con cálculo de prorrateo y liquidación de depósito `[DECISIÓN: fórmula exacta a definir]`.
- RF-CON-05 Estados: `Vigente`, `Mora (derivado)`, `Terminado`, `Anulado`.
- RF-CON-06 Historial de versiones/renovaciones y motivo de terminación.
- RF-CON-07 **Cargar contrato firmado (adjunto obligatorio en Arrendamiento)**: al crear un contrato de tipo `Arrendamiento` el archivo firmado es **obligatorio** — sin el adjunto el sistema **bloquea guardar**. Formatos aceptados: `application/pdf`, `image/jpeg`, `image/png`; tamaño máximo **10 MB**. Criterios de aceptación: (a) sin archivo → error y no se persiste; (b) formato/tamaño inválido → error claro; (c) el estado del adjunto se muestra en el asistente y en la ficha; (d) descarga vía **URL firmada** (BFF; defensa en profundidad RN-S01); (e) **auditoría**: quién subió/cuándo/versión. Para `Administración` la carga es **opcional** (puede adjuntarse después desde la ficha).

### Campos
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
| **documento** **[P]** | adjunto | contrato firmado · **obligatorio para Arrendamiento** · PDF/JPG/PNG ≤ 10 MB · almacenado fuera del webroot (BFF / URL firmada) · en prototipo data URL en memoria |

### Permisos
| Acción | Permiso |
|---|---|
| Ver | `contratos.read` |
| Crear / editar | `contratos.create` / `contratos.update` |
| Terminar / anular | `contratos.terminar` / `contratos.anular` |

Regla de negocio: **el que crea un contrato no puede anularlo en el mismo día si tiene `contratos.anular`** (auditoría básica de separación). `[DECISIÓN]`

### Restricciones de datos
- RD-CON-01 `fin > ini`; `canon > 0` salvo Administración (null).
- RD-CON-02 **Un solo contrato `Vigente` por inmueble** (unicidad activa). Un inmueble `Alquilado`/`Ocupado` **no es candidato** para un nuevo contrato (exclusividad de ocupación).
- RD-CON-03 El cliente debe estar `Activo` y su `tipo` compatible con el tipo de contrato. Un cliente `Inactivo` no genera contratos nuevos; `Mora` no bloquea un nuevo contrato si está activo. `[DECISIÓN: ¿cliente en Mora firma nuevo contrato? Recomendado: permitir con motivo, evaluado en revisión.]`
- RD-CON-04 `Mora` es derivado de los cobros (recibo vencido sin pago), no editable.
- RD-CON-05 ITBMS se propaga al cálculo del recibo de canon.
- RD-CON-06 **Contrato firmado obligatorio** (Arrendamiento): el adjunto se exige al crear (`contratos.create`); la persistencia valida formato `application/pdf`/`image/jpeg`/`image/png` y tamaño ≤ 10 MB. El archivo **nunca se almacena en el webroot ni se sirve sin URL firmada** (RN-S01); el cliente nunca recibe la ruta interna. Los documentos se asocian al contrato y quedan visibles en su ficha (pestaña "Documentos") y en la ficha del cliente.

### Restricciones de flujo
- FL-CON-01 Transiciones: `Vigente → Terminado` (por fin de vigencia o `terminar`); `Vigente → Anulado` (solo si **no tiene recibos cobrados/incidencias**) `[DECISIÓN]`; `Vigente → Mora` (derivado) `→` se limpia al pagar.
- FL-CON-02 Al terminar un Arrendamiento: el sistema **libera el inmueble** (→ Disponible) y actualiza el cliente (queda sin inm principal, conserva historial). Invoca a Cobros para prorrateo y a Liquidaciones/Depósito si procede.
- FL-CON-03 Al terminar una Administración: se genera la **liquidación final** pendiente de pagar.
- FL-CON-04 Renovación = nuevo fin + nueva versión visible en el historial (no duplica el contrato).
- FL-CON-05 En el asistente "Nuevo contrato", el paso de **documento firmado** es obligatorio para `Arrendamiento`: sin archivo no se habilita el botón de guardado (UX) **y** el backend rechaza si falta (RN-S01). Al subir: validación de tipo/tamaño → `carga en línea → confirmación "Contrato firmado cargado"`. El documento se puede sustituir desde la ficha (petición `contratos.create`), registrando auditoría y conservando la versión anterior.

### Casos de uso
- **CU-CON-01 Crear contrato (Arrendamiento).** Precond: `contratos.create`, inmueble **candidato** (`Disponible`/`Reservado`, no `Alquilado` — RD-CON-02/INM-05), cliente `Activo` compatible. Pasos: seleccionar inmueble → seleccionar cliente → canon/día/garantía/ITBMS → **subir contrato firmado** (RF-CON-07, obligatorio) → estado `Vigente`. Resultado: inmueble → `Alquilado`; re-validación de exclusividad en backend (RN-S01).
- **CU-CON-02 Crear contrato (Administración).** Precond: `contratos.create`, propietario. Resultado: comisión fijada, base para Liquidaciones.
- **CU-CON-03 Renovar.** Precond: `contratos.update`. Resultado: nuevo fin + versión histórica.
- **CU-CON-04 Terminar anticipadamente.** Precond: `contratos.terminar` + motivo. Resultado: prorrateo→recibo, inmueble liberado, liquidación de depósito si aplica.
- **CU-CON-05 Anular.** Precond: `contratos.anular`, sin movimientos cobrados. Resultado: `Anulado`, inmueble liberado.
- **CU-CON-06 Consultar vigencia por inmueble/cliente.** Precond: `contratos.read`.
- **CU-CON-07 Cargar contrato firmado.** Precond: `contratos.create`. Pasos: en asistente Nuevo contrato o ficha → seleccionar archivo PDF/JPG/PNG ≤10 MB → el sistema valida formato/tamaño → guarda adjunto asociado al contrato. Resultado: adjunto visible con estado "Cargado", descargable solo con URL firmada; auditoría `{usuario, fecha, versión}`. Sin archivo en Arrendamiento → el backend rechaza (`422`) y el asistente no guarda.
- **CU-CON-08 Consultar/descargar documentos del contrato.** Precond: `contratos.read`. Resultado: listado en pestaña "Documentos" de la ficha; la descarga solicita URL firmada al BFF (no se expone la ruta interna).

### Resumen en dashboard
Widget **Contratos**: Vigentes · Por vencer en 60 días · En mora (permiso: `contratos.read`; los datos de mora requieren además `cobros.mora.consultar` si el widget cruza módulos). `[DECISIÓN: ¿separar o permiso AND?]`

---

## 4. Cobros

**Objetivo:** emitir y gestionar recibos de canon, registrar pagos y controlar la mora.

### Requisitos funcionales
- RF-COB-01 **Generación masiva** de recibos por período a partir de contratos vigentes (canon + ITBMS + servicios), con unicidad `contrato × período`.
- RF-COB-02 Generación individual de recibo.
- RF-COB-03 Registrar pago (total; parcial `[DECISIÓN]`), con fecha, método y comprobante opcional `CRE-…`.
- RF-COB-04 Estados: `Emitido`, `Pagado`, `En mora` (derivado), `Anulado`.
- RF-COB-05 **Mora automática** por vencimiento (día de mora calculado); consulta de mora por período.
- RF-COB-06 Anulación de recibo (solo si no está pagado) con motivo.
- RF-COB-07 Conciliación bancaria de pagos `[P]`. Nota: la caja diaria y la conciliación formal viven en Contabilidad (asientos), aquí se registra el cobro.

### Campos
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

### Permisos
| Acción | Permiso |
|---|---|
| Generar recibos | `cobros.recibos.generar` |
| Anular recibo | `cobros.recibos.anular` |
| Registrar pago | `cobros.pagos.registrar` |
| Consultar mora | `cobros.mora.consultar` |
| Ver listado | `cobros.recibos.generar` o `cobros.mora.consultar` (OR) |

### Restricciones de datos
- RD-COB-01 Un recibo por `(contrato, período)` (unique compuesto).
- RD-COB-02 `monto > 0`; `vence` derivado del contrato; `mor` derivado (`hoy − vence` si Emitido/En mora sin pago).
- RD-COB-03 `En mora` es **derivado**: recibo Emitido con `vence < hoy` → pasa a `En mora`. Nunca editable.
- RD-COB-04 ITBMS: solo si el contrato lo define; se propaga de Contratos.
- RD-COB-05 Al anular: el recibo deja de impactar ingresos; no se reutiliza el folio.

### Restricciones de flujo
- FL-COB-01 Transiciones: `Emitido → Pagado` (fecha pago requerida) · `Emitido → En mora` (automático) · `En mora → Pagado` (normal) · `Emitido → Anulado` (solo no pagado) · `En mora → Anulado` (gestión de cartera `[DECISIÓN: ¿requiere motivo + supervisor?]`).
- FL-COB-02 Al pagar: actualiza **contrato** (limpia Mora) y **cliente** (limpia Mora). Los recibos generados por el periodo actualizan el estado.
- FL-COB-03 Al generar recibos del período: el contrato pasa a reflejar el canon facturado; si el período está prorrateado (contrato terminado a mitad), se genera recibo proporcional con notas. `[DECISIÓN: fórmula de prorrateo = (canon/díasMes)×díasVigentes]`
- FL-COB-04 El registro de pago genera un **asiento de caja pendiente de aprobación** en Contabilidad (integración), no un asiento directo. `[DECISIÓN: ¿automático o manual? Recomendado: automático como borrador.]`

### Casos de uso
- **CU-COB-01 Generar recibos del período.** Precond: `cobros.recibos.generar`. Resultado: N recibos `Emitido` por contratos vigentes; error si `(contrato, periodo)` ya existe.
- **CU-COB-02 Registrar pago.** Precond: `cobros.pagos.registrar`. Pasos: recibo → método → guardar. Resultado: `Pagado`, comprobante opcional, contrato/cliente limpian Mora.
- **CU-COB-03 Anular recibo.** Precond: `cobros.recibos.anular` + motivo. Resultado: `Anulado` (si no pagado).
- **CU-COB-04 Consultar mora.** Precond: `cobros.mora.consultar`. Resultado: listado por días de mora/importe, exportable con `reportes.ver`.
- **CU-COB-05 Cobrar en ventanilla.** Precond: `cobros.pagos.registrar`. Resultado: pago inmediato + comprobante.

### Resumen en dashboard
Widget **Cobros**: Recibos 7 · Pagados 3 · Emitidos 2 · Por cobrar B/.3,392 (permiso: `cobros.recibos.generar` o `cobros.mora.consultar`).

---

## 5. Liquidaciones

**Objetivo:** liquidar a propietarios el ingreso neto (ingreso cobrado − comisión) en contratos de administración.

### Requisitos funcionales
- RF-LIQ-01 Generar liquidación por **contrato de Administración + período**: base = ingresos **cobrados** del período (no los emitidos).
- RF-LIQ-02 Cálculo: `neto = ingreso − comisión` (comisión del contrato).
- RF-LIQ-03 Estados: `Pendiente`, `Pagado`, `Anulado`.
- RF-LIQ-04 Confirmar pago (método, fecha) y consultar historial.
- RF-LIQ-05 Anulación de una liquidación Pendiente que libera el período para regenerar.

### Campos
| Campo | Tipo | Regla |
|---|---|---|
| id / ret | pk / texto | ret única `LIQ-YYYY-NNN` |
| prop / inm | fk | del contrato de administración |
| periodo | texto | único por contrato |
| ingreso | número | derivado de recibos cobrados del período |
| comision | % / número | del contrato |
| neto | número | `ingreso − comision` (validado) |
| estado | enum | Pendiente / Pagado / Anulado |
| pago | fecha | requerida para Pagado |
| **refRecibos / metodo** **[P]** | array/texto | fuentes del ingreso |

### Permisos
| Acción | Permiso |
|---|---|
| Generar | `liquidaciones.generar` |
| Confirmar pago | `liquidaciones.confirmar` |
| Consultar / exportar | `liquidaciones.consultar` (exportar con `reportes.ver`) |
| Anular | `liquidaciones.anular` |

### Restricciones de datos
- RD-LIQ-01 `neto = ingreso − comision`; `ingreso` es **derivado** de recibos `Pagado` del período (no incluye Emitido/En mora).
- RD-LIQ-02 Unicidad `(contrato, periodo)`.
- RD-LIQ-03 No se confirma una `Anulada`; no se anula una `Pagada`.
- RD-LIQ-04 Comisión debe estar dentro del rango configurado del contrato.

### Restricciones de flujo
- FL-LIQ-01 `Pendiente → Pagado` (confirmar con fecha/método) · `Pendiente → Anulado` (liberar → regenerable) · nunca `Pagado → Anulado`.
- FL-LIQ-02 La generación requiere que al menos un recibo fuente esté `Pagado`; si no, la liquidación del período no existe (o aparece con `ingreso = 0` y se oculta por defecto). `[DECISIÓN: ¿ocultar vs mostrar 0?]`
- FL-LIQ-03 El pago de liquidación genera un asiento de egreso (caja) en Contabilidad (borrador pendiente de aprobar).

### Casos de uso
- **CU-LIQ-01 Generar liquidación.** Precond: `liquidaciones.generar`, hay recibos cobrados. Resultado: `Pendiente` con neto calculado.
- **CU-LIQ-02 Confirmar pago a propietario.** Precond: `liquidaciones.confirmar`. Resultado: `Pagado` + historial.
- **CU-LIQ-03 Anular y regenerar.** Precond: `liquidaciones.anular` (solo Pendiente). Resultado: período liberado.
- **CU-LIQ-04 Consultar estados por período/propietario.** Precond: `liquidaciones.consultar`.

### Resumen en dashboard
Widget **Liquidaciones**: Emitidas 3 · Pagadas 2 · Pendiente B/.1,520 (permiso: `liquidaciones.confirmar` o `liquidaciones.consultar`).

---

## 6. Incidencias

**Objetivo:** gestionar reportes de problemas en inmuebles (inquilino → administración → proveedor → cierre) con timeline auditable y visitas programadas.

### Requisitos funcionales
- RF-INC-01 Reportar incidencia desde cliente o inmueble con categoría y urgencia.
- RF-INC-02 Categorías: Aire acondicionado, Plomería, Electricidad, Estructura, Electrodoméstico, Otros. Urgencias: Alta/Media/Baja.
- RF-INC-03 Flujo de estados: `Reportada → Presupuesto → Asignada → En ejecución → Cerrada`.
- RF-INC-04 Asignar proveedor/técnico; registrar costo (presupuesto y/o ejecución).
- RF-INC-05 Timeline **append-only** (cada transición agrega evento con fecha y actor).
- RF-INC-06 Visitas programadas (preventivos, inspecciones) con notificación (plataforma + SMS/email).
- RF-INC-07 SLA por urgencia `[P]`: Alta < 24 h, Media < 72 h, Baja < 7 días (propuesta a validar).
- RF-INC-08 Adjuntar fotos `[P]`.

### Campos
| Campo | Tipo | Regla |
|---|---|---|
| id | pk | auto |
| cat | enum | catálogo |
| urg | enum | Alta/Media/Baja |
| titulo | texto | obligatorio |
| por | fk cliente | opcional (puede reportar admin) |
| inm | fk inmueble | obligatorio |
| estado | enum | Reportada / Presupuesto / Asignada / En ejecución / Cerrada |
| fecha | fecha | reporte |
| tecnico / proveedor | texto/fk | requerido en `Asignada+` |
| costo | número | opcional · **requerido si hubo ejecución** |
| timeline | array | append-only `{f,t,c}` |
| **fechaCierre / fotos / slaDue** **[P]** | fecha/array/fecha | para trazabilidad y SLA |

### Permisos
| Acción | Permiso |
|---|---|
| Ver (lista, ficha, costos, timeline) | `incidencias.leer` |
| Reportar | `incidencias.crear` (y `clientes.read` / `inmuebles.read` para seleccionar) |
| Asignar | `incidencias.asignar` |
| Registrar presupuesto/costo | `incidencias.registrar_costo` |
| Cerrar | `incidencias.cerrar` |
| Programar visitas | `incidencias.visitas.programar` |

### Restricciones de datos
- RD-INC-01 `titulo`, `cat`, `urg`, `inm` obligatorios; estado inicial siempre `Reportada`.
- RD-INC-02 `tecnico` requerido para moverse a `Asignada` o `En ejecución`.
- RD-INC-03 Si la incidencia llegó a `En ejecución` o `Presupuesto` con costo, **cerrar requiere registrar el costo** (o motivo de costo nulo). `[DECISIÓN: costo 0 permitido si el proveedor no cobró]`
- RD-INC-04 Timeline **inmutable**: solo agrega eventos; las correcciones se registran como nuevo evento (nunca se edita el pasado).
- RD-INC-05 Una `Cerrada` **no se reabre**; se crea una nueva incidencia referenciando la anterior. `[DECISIÓN: ¿reapertura con motivo para casos de recaída?]`

### Restricciones de flujo
- FL-INC-01 Transiciones: `Reportada → Presupuesto` (costo estimado) · `Reportada → Asignada` (sin presupuesto si urgencia Alta o costo umbral < configurado `[DECISIÓN: umbral B/. 100 como default]`) · `Presupuesto → Asignada` (aprobado) · `Asignada → En ejecución` · `En ejecución → Cerrada` (requiere permiso cerrar + costo).
- FL-INC-02 Cualquier transición registra automáticamente el timeline con actor, fecha y estado resultante.
- FL-INC-03 Al cerrar: si hay un proveedor con costo, se **sugiere crear la entrada en Línea blanca** (mantenimiento correctivo) cuando la incidencia es de un equipo `[DECISIÓN: asociación opcional]`.
- FL-INC-04 Si el ocupante reporta y el inmueble está `En mantenimiento`, la incidencia se marca como obra/administración de inmueble (no inquilino).

### Casos de uso
- **CU-INC-01 Reportar incidencia.** Precond: `incidencias.crear`. Resultado: `Reportada` con timeline inicial.
- **CU-INC-02 Presupuestar / aprobar costo.** Precond: `incidencias.registrar_costo`. Resultado: estado `Presupuesto` con costo.
- **CU-INC-03 Asignar proveedor.** Precond: `incidencias.asignar`. Resultado: `Asignada`, técnico fijado, notificación.
- **CU-INC-04 Ejecutar y cerrar.** Precond: `incidencias.cerrar` (+ costo si hubo). Resultado: `Cerrada`, timeline completo, sugerencia a Línea blanca.
- **CU-INC-05 Programar visita.** Precond: `incidencias.visitas.programar`. Resultado: visita con fecha/hora y notificación.
- **CU-INC-06 Consultar timeline y costos.** Precond: `incidencias.leer`.

### Resumen en dashboard
Widget **Incidencias**: Abiertas 4 (no cerradas) · Cerradas 1 · En ejecución 1 · Sin asignar 1 · Visitas 2 (permiso: `incidencias.leer`). Es el caso del coordinador con proveedores.

---

## 7. Línea blanca

**Objetivo:** inventario de equipos por inmueble (A/C, neveras, lavadoras, calentadores) con mantenimiento preventivo/correctivo, garantía y ciclo de vida.

### Requisitos funcionales
- RF-LB-01 CRUD de equipos con ficha (marca, modelo, serie, ubicación, compra, costo).
- RF-LB-02 Estados: `Instalado`, `En reparación`, `De baja` (con motivo/fecha).
- RF-LB-03 Registro de mantenimientos `preventivo`/`correctivo` (fecha, tipo, costo, proveedor, resultado, próxima fecha).
- RF-LB-04 Historial completo por equipo (mantenimientos acumulados).
- RF-LB-05 Aviso de próximos preventivos vencidos (visitas) `[P]`.
- RF-LB-06 Garantía (fecha fin) y costo acumulado por equipo `[P]`.

### Campos
| Campo | Tipo | Regla |
|---|---|---|
| id | pk | auto |
| cat | enum | Aire acondicionado, Nevera/Refrigerador, Lavadora, Calentador, Otro |
| marca / modelo | texto | obligatorio |
| serie | texto | único por marca/modelo |
| inm / ubic | fk/texto | inmueble obligatorio |
| compra / costo | fecha/número | costo > 0 |
| estado | enum | Instalado / En reparación / De baja |
| mant | array | `{f, t, costo, prov, res, sig}` |
| **garantiaHasta / motivoBaja** **[P]** | fecha/texto | opcional / requerido si De baja |

### Permisos
| Acción | Permiso |
|---|---|
| Ver inventario/ficha | `lineablanca.read` |
| Registrar / editar equipo | `lineablanca.create` / `lineablanca.update` |
| Dar de baja | `lineablanca.baja` |
| Registrar mantenimiento | `lineablanca.mantenimientos.registrar` |

### Restricciones de datos
- RD-LB-01 `serie` única (por marca/modelo); `inm` obligatorio; `costo > 0`.
- RD-LB-02 En `De baja` se exige `motivoBaja` y fecha; **no** se registran mantenimientos nuevos.
- RD-LB-03 Si el registro es preventivo: `sig` (próxima fecha) debe ser posterior a `f`.
- RD-LB-04 El estado no puede ser `De baja` sin motivo (validación cruzada).

### Restricciones de flujo
- FL-LB-01 `Instalado → En reparación` (se registra mantenimiento correctivo) · `En reparación → Instalado` (correctivo terminado) · `Instalado → De baja` (**irreversible**; se excluye de métricas activas) `[DECISIÓN: ¿posibilidad de reacondicionar/reincorporar?]`.
- FL-LB-02 Preventivo solo si equipo `Instalado`.
- FL-LB-03 Al cerrar una Incidencia de equipo con proveedor, se **sugiere** el mantenimiento correctivo (integración opcional con Incidencias).

### Casos de uso
- **CU-LB-01 Registrar equipo.** Precond: `lineablanca.create`.
- **CU-LB-02 Registrar preventivo.** Precond: `lineablanca.mantenimientos.registrar`, equipo Instalado. Resultado: actualiza historial y próxima fecha.
- **CU-LB-03 Reparar (correctivo).** Precond: `lineablanca.mantenimientos.registrar`. Resultado: equipo → `En reparación` → `Instalado`.
- **CU-LB-04 Dar de baja.** Precond: `lineablanca.baja` + motivo. Resultado: `De baja`.
- **CU-LB-05 Consultar ficha con historial.** Precond: `lineablanca.read`.

### Resumen en dashboard
Widget **Línea blanca**: Equipos 5 · Instalados 3 · En reparación 1 · Mant. registrados 4 (permiso: `lineablanca.read`).

---

## 8. Contabilidad

**Objetivo:** contabilidad integral de la administración: plan de cuentas, partida doble, cierres, conciliación, impuestos, activos fijos y estados financieros.

### Requisitos funcionales
- RF-CTB-01 **Plan de cuentas** jerárquico (grupos y cuentas) con naturaleza (deudora/acreedora) y balance.
- RF-CTB-02 **Asientos** de partida doble: crear borrador, editar borrador, aprobar. Separación: **el que crea no aprueba**.
- RF-CTB-03 **Cierres mensuales**: único por período; abrir/cerrar período.
- RF-CTB-04 **Conciliación bancaria** por cuenta y período.
- RF-CTB-05 **Impuestos**: ITBMS recaudado por declarar / declarado / pagado.
- RF-CTB-06 **Activos fijos** `[P]`.
- RF-CTB-07 **Estados financieros** por período: EF, Resultados, Balanza; para períodos cerrados (o provisional con marca).
- RF-CTB-08 Integración: cobros y liquidaciones generan **asientos borrador** (caja) pendientes de aprobar.

### Campos (resumen)
| Submódulo | Entidad | Reglas clave |
|---|---|---|
| Plan | cuenta `{code, name, type:(g/a), nature:(D/C), bal, children}` | jerárquica · códigos únicos |
| Asientos | `{num, fecha, ref, items:[{cuenta, debe, haber}], estado}` | **debe = haber** |
| Cierres | `{periodo, estado, fecha}` | único por periodo |
| Conciliación | `{banco, periodo, dif, estado}` | única por banco+periodo |
| Impuestos | `{tipo, periodo, monto, estado}` | ITBMS según recibos con itbms |
| Activos fijos | `{codigo, nombre, fecha, costo, depreciacion}` | catálogo simple |

### Permisos
| Acción | Permiso |
|---|---|
| Editar plan | `contabilidad.plan-cuentas.editar` |
| Crear asiento (borrador) | `contabilidad.asientos.crear` |
| Aprobar asiento | `contabilidad.asientos.aprobar` |
| Cierre mensual | `contabilidad.cierres.ejecutar` |
| Conciliación | `conciliacion` |
| Impuestos / activos | `contabilidad.impuestos.*` / `contabilidad.activos.*` |
| Ver EF | `estados-financieros.ver` |

### Restricciones de datos
- RD-CTB-01 Todo asiento **balanceado**: suma débitos = suma créditos. No se guarda borrador desbalanceado (valida al guardar).
- RD-CTB-02 Un cierre por período; un período cerrado **no admite asientos nuevos** (excepto reversión aprobada con motivo, periodo abierto de nuevo).
- RD-CTB-03 Conciliación única por banco+período; con diferencia solo si está marcada como en proceso.
- RD-CTB-04 EF solo de períodos cerrados, salvo marca `provisional` visible solo con permiso de EF.
- RD-CTB-05 Asiento aprobado es **inmutable** (toda corrección = asiento de reversión aprobado).

### Restricciones de flujo
- FL-CTB-01 Asiento: `Borrador → (editable) → Aprobado → registrado`; aprobación por usuario con `contabilidad.asientos.aprobar` distinto del creador (salvo Admin con TODOS).
- FL-CTB-02 Cierre mensual requiere: todos los asientos del período aprobados **y** conciliación del período terminada `[DECISIÓN: ¿bloquear cierre si no conciliado? Sí, recomendado]`.
- FL-CTB-03 Los cobros generan asiento borrador de ingreso; la liquidación pagada genera asiento borrador de egreso. Ambos esperan aprobación.
- FL-CTB-04 Impuesto ITBMS: se calcula de los recibos con `itbms` cobrados del período; `Pendiente` → `Declarado` → `Pagado` (con fecha).

### Casos de uso
- **CU-CTB-01 Crear y aprobar asiento.** Precond: `contabilidad.asientos.crear` (crear), `contabilidad.asientos.aprobar` (aprobar, diferente usuario). Resultado: asiento registrado.
- **CU-CTB-02 Ejecutar cierre mensual.** Precond: `contabilidad.cierres.ejecutar`, todas las condiciones de FL-CTB-02. Resultado: período cerrado, EF disponibles.
- **CU-CTB-03 Conciliar banco.** Precond: `conciliacion`.
- **CU-CTB-04 Ver EF por período.** Precond: `estados-financieros.ver`.
- **CU-CTB-05 Declarar/pagar ITBMS.** Precond: `contabilidad.impuestos.*`.
- **CU-CTB-06 Ajustar plan de cuentas.** Precond: `contabilidad.plan-cuentas.editar`.

### Resumen en dashboard
Widget **Contabilidad**: Utilidad del mes (EF Resultados, **B/.88,590** en mock) · ITBMS por declarar · Cierre pendiente (permiso: `estados-financieros.ver` o `contabilidad.*`).

---

## 9. Reportes

**Objetivo:** generar, consultar y exportar reportes operativos y financieros según permisos.

### Requisitos funcionales
- RF-REP-01 Catálogo de reportes: estado de cuenta, mora, ocupación, incidencias, liquidaciones, ingresos y EF.
- RF-REP-02 Generación bajo demanda con filtros (período, cliente, inmueble) y formato (PDF/CSV/Excel).
- RF-REP-03 Programación de reportes periódicos `[P]`.
- RF-REP-04 Historial de generación (quién, cuándo, qué filtros, resultado).
- RF-REP-05 **Permisos por tipo**: los reportes financieros exigen su permiso fuente, no solo `reportes.ver`.

### Campos
| Campo | Tipo | Regla |
|---|---|---|
| id / tipo | pk / enum | catálogo |
| filtros | json | período, cliente, inmueble |
| formato | enum | PDF/CSV/Excel |
| usuario / fecha | fk/fecha | autogenerado |
| estado | enum | Pendiente / Listo / Error |
| url | texto | archivo generado |

### Permisos
| Acción | Permiso |
|---|---|
| Ver/consultar | `reportes.ver` **+ permiso fuente del tipo** (p.ej. financieros requieren `estados-financieros.ver`) |
| Generar bajo demanda / programar | `reportes.generar` **+ permiso fuente** |

### Restricciones de datos
- RD-REP-01 Un usuario solo ve los tipos de reporte permitidos por sus permisos: **los financieros nunca llegan a Operaciones/Mant. ni Solo lectura**.
- RD-REP-02 La exportación hereda el permiso del consultor (no permite "bajar el Excel" sin ver).
- RD-REP-03 Historial inmodificable (append-only).

### Restricciones de flujo
- FL-REP-01 `Pendiente (bajo demanda) → Listo` con archivo; error visible con trazabilidad.
- FL-REP-02 Programado: `Programado → Pendiente → Listo` según cron.
- FL-REP-03 Ningún resultado se cachea sin incluir el contexto de permisos del que lo generó (caché por rol).

### Casos de uso
- **CU-REP-01 Generar reporte de mora.** Precond: `reportes.ver` + `cobros.mora.consultar`. Resultado: PDF/CSV con el listado visible.
- **CU-REP-02 Generar EF.** Precond: `reportes.ver` + `estados-financieros.ver`.
- **CU-REP-03 Programar reporte de ocupación.** Precond: `reportes.generar` + `inmuebles.read`.
- **CU-REP-04 Consultar historial.** Precond: `reportes.ver`.

### Resumen en dashboard
Widget **Reportes**: Reportes del mes · Programados (permiso: `reportes.ver`).

---

## 10. Administración y Seguridad

**Objetivo:** gestión de usuarios, roles, permisos, feature flags y configuración global. **Transversal a todos los módulos.**

### Requisitos funcionales
- RF-ADM-01 Usuarios: CRUD, alta con rol inicial, activar/desactivar, reset de acceso.
- RF-ADM-02 Roles: CRUD y asignación de permisos del catálogo (sección 0).
- RF-ADM-03 Permisos: catálogo oficial, no se crean ad hoc.
- RF-ADM-04 Feature flags por módulo y entorno (habilitado por rol cuando aplique).
- RF-ADM-05 Configuración global: % ITBMS, días de mora, umbral de presupuesto de incidencias, canales de notificación.
- RF-ADM-06 **Auditoría** de cambios de seguridad: quién, qué, cuándo (tabla propia; independiente de la auditoría funcional de cada módulo).

### Permisos
| Acción | Permiso |
|---|---|
| Usuarios | `admin.usuarios` |
| Roles | `admin.roles` |
| Permisos | `admin.permisos` |
| Configuración | `admin.configuracion` |
| Feature flags | `admin.feature-flags` |
| **Todo** | `TODOS LOS PERMISOS` (rol Administrador semilla) |

### Restricciones de datos
- RD-ADM-01 El rol **Administrador** (TODOS) existe como semilla y **no es eliminable**; sus permisos no se pueden reducir por debajo de TODO sin una verificación explícita `[DECISIÓN: doble confirmación + auditoría]`.
- RD-ADM-02 Ningún usuario puede **revocarse a sí mismo** su último permiso de administración (protege contra auto-lockout). `[DECISIÓN]`
- RD-ADM-03 Un rol no puede asignar permisos que el rol autónomo no posee (delegación contenida).
- RD-ADM-04 La desactivación de un módulo por feature flag **no elimina** permisos: **flag + permiso** son ambos necesarios (RN-S01); el permiso revocado sí es definitivo hasta que se reasigne.

### Restricciones de flujo
- FL-ADM-01 Los cambios de rol/permiso del usuario logueado se reflejan **al siguiente request/token** (no en la sesión actual sin re-autenticar) — límite de seguridad conocido y documentado; el frontend puede forzar refresco de claims.
- FL-ADM-02 Alta de usuario: sin rol asignado → sin acceso (blank state de nuevo usuario).
- FL-ADM-03 Separación de funciones aplicada (p.ej. aprobar asientos ≠ crear asientos) se expresa con permisos, no con lógica escondida.
- FL-ADM-04 **Demo dinámico (prototipo):** conceder `incidencias.leer` (o `cobros.recibos.generar`) a un rol del demo debe hacer aparecer al instante el widget correspondiente en el dashboard y el ítem en el menú — este es el caso de uso que valida la composición dinámica.

### Casos de uso
- **CU-ADM-01 Crear usuario.** Precond: `admin.usuarios`. Resultado: sin acceso hasta asignar rol.
- **CU-ADM-02 Asignar rol/permisos.** Precond: `admin.roles`/`admin.permisos`. Resultado: efectivo al siguiente request; auditoría.
- **CU-ADM-03 Configurar ITBMS/días de mora.** Precond: `admin.configuracion`.
- **CU-ADM-04 Cambiar feature flag y ver efecto en dashboard.** Precond: `admin.feature-flags` (demo con toggles en vivo).
- **CU-ADM-05 Revisar auditoría de seguridad.** Precond: `admin.usuarios` (lectura de auditoría).

### Resumen en dashboard
Sin widget propio por defecto. `[DECISIÓN: ¿widget "Usuarios activos / roles" solo para Admin? Recomendado NO incluir — la seguridad no va al resumen.]`

---

## 11. Portal inquilino (alcance propio)

**Objetivo:** ingreso del inquilino (cliente) para consultar su estado de cuenta, recibos, incidencias y mantenimientos.
- Permiso: `portal.ver` **[P]**; cada dato mostrado hereda permisos del módulo fuente (nunca expone datos de otros).
- Fuera del alcance del dashboard de administración; se documenta en el diseño del portal (v1.4) — no se expande aquí.

---

## 12. Dependencias entre módulos

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
```

Regla: **las dependencias se expresan por identidad (IDs) o por eventos, nunca por acceso directo a tablas de otro módulo** (modular monolith con contratos).

---

## 13. Preguntas abiertas (resumen para la discusión)

| # | Decisión |
|---|---|
| 1 | ¿El estado `Mora` de Cliente se deriva de CUALQUIER recibo en mora de un contrato asociado? |
| 2 | ¿Se permite borrado definitivo con restricción (solo Admin central + auditoría) o solo soft-delete? |
| 3 | ¿Qué fórmula exacta para prorrateo/terminación anticipada de contrato? |
| 4 | ¿Anular contrato requiere cero movimientos cobrados? ¿Y anular recibo en mora requiere motivo + supervisor? |
| 5 | ¿Pagos parciales de recibo permitidos? (recomendado: NO en v1, las cuotas como recibos separados) |
| 6 | ¿La liquidación con ingreso 0 se oculta o se muestra? |
| 7 | ¿Reabrir incidencias cerradas (recaída) o crear nueva referenciada? |
| 8 | ¿Umbral de presupuesto para asignar incidencia sin pasar por Presupuesto? (default B/. 100) |
| 9 | ¿El cierre contable se bloquea si el banco no está conciliado? (recomendado: Sí) |
| 10 | ¿Widget de Administración en el dashboard? (recomendado: NO) |
| 11 | ¿Permisos nuevos `[P]` aceptados en el catálogo (clientes.create, contratos.anular, etc.)? |
| 12 | ¿La separación de funciones (crear ≠ aprobar asiento) aplica también a contratos/recibos? |
| 13 | ¿El nuevo permiso `clientes.estado.cambiar` **[P]** se aprueba como permiso propio (recomendado) o se mantiene bajo `clientes.delete`? |
| 14 | Desactivar cliente con deuda/contrato activo: ¿política estricta (bloquear, recomendada) o permitir con confirmación reforzada + motivo? (RD-CLI-07) |
| 15 | ¿Un cliente en `Mora` puede firmar un nuevo contrato? (RD-CON-03) |

---
*Fin del primer borrador (v0.1). Listo para revisión módulo por módulo.*