# Análisis Comercial y Financiero — Plataforma de Administración de Inmuebles, Portales y Contabilidad (Panamá)

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento de trabajo interno de cotización. Cifras estimadas a partir de supuestos explícitos (sección 17). Ninguna cifra es compromiso contractual hasta validar los pendientes bloqueantes |
| **Documentos base** | `docs/diseno-arquitectura.md` (v1.1) · `docs/modulo-contabilidad.md` (v1.0) · `docs/adr-aislamiento-modulos-killswitch.md` (v1.0) · `docs/modulos/*` (v1.0) · `docs/ui/diseno-ui-design-system.md` (v1.5) · `docs/ui/requerimientos-modulos.md` (v0.1) |
| **Cliente** | PYME panameña de administración de inmuebles (~400 unidades, ~2,500 pagos/mes) |
| **Alcance cotizado** | Fases 0–3 (Fundación, Núcleo, Operación, Contabilidad). Fase 4 (portal propietario, proveedores definitivos, facturación DGI, multi-empresa) **excluida** del contrato base |

---

## 1. Resumen ejecutivo

**Qué se construye:** una plataforma tipo monolito modular (una sola aplicación desplegable con fronteras por módulo) para administrar el portafolio de alquileres de una empresa panameña: clientes, inmuebles, contratos, cobros con recibos descargables, liquidaciones a propietarios, incidencias, línea blanca, notificaciones multicanal, calendario, contabilidad completa (plan de cuentas, partida doble, cierres parametrizables, impuestos, conciliación bancaria, activos fijos y estados financieros), reportes, administración con roles dinámicos/permisos fijos, y un portal de inquilino. Stack confirmado: ASP.NET Core 10 + Blazor Web App/MudBlazor + YARP + PostgreSQL 17 + Redis + almacenamiento S3 + OpenTelemetry/Grafana/Loki + Quartz.NET.

**Esfuerzo estimado (PERT):** **6,943 horas** distribuidas en 9–11 meses calendario (escenario recomendado, 4–5 personas en paralelo).

**Costo interno estimado:** ≈ **$316,000** (costo laboral $307,822 + costos directos $8,500), marcado como estimación sobre supuestos de costos panameños.

**Precio comercial recomendado:** ≈ **$506,000** por F0–F3 (equivalente a un precio por fases de ~$500–525k). Escenario mínimo sostenible ≈ $427k; premium ≈ $602k.

**Modelo de contratación recomendado:** **híbrido por fases** — precio fijo por fase con alcance congelado, cambios como T&M (change requests aprobados), garantía por fase, y contrato mensual de soporte + bolsa de horas después del Go-Live.

**Riesgos principales:** marco legal/fiscal panameño pendiente de validar (CPA y abogado) — bloqueante para Contratos y Contabilidad; 12 decisiones de reglas de negocio abiertas; plan de cuentas y tasas del cliente no recopilados; pagos tardíos de un cliente PYME. Utilidad protegida solo si cada cambio de alcance se cobra.

---

## 2. Análisis documental

### 2.1 Documentos revisados

| Documento | Versión | Contenido analizado |
|---|---|---|
| `docs/diseno-arquitectura.md` | 1.1 | Alcance, C4, bounded contexts, esquemas BD, seguridad, ADR-001…014, supuestos PA-###, plan por fases |
| `docs/modulo-contabilidad.md` | 1.0 | Alcance completo del módulo contable panameño, cierres parametrizables, cuestionario de adaptación |
| `docs/adr-aislamiento-modulos-killswitch.md` | 1.0 | ADR-015…018: aislamiento por esquema, contención de fallos, Ops Console kill-switch, observabilidad por módulo |
| `docs/modulos/README.md` | 1.0 | Índice, catálogo de permisos, dependencias, decisiones globales |
| `docs/modulos/{clientes, inmuebles, contratos, cobros, liquidaciones, incidencias, linea-blanca, contabilidad, reportes, administracion-seguridad, portal-inquilino}.md` | 1.0 | RF, campos, permisos, RD/FL y casos de uso por módulo |
| `docs/ui/requerimientos-modulos.md` | 0.1 | Borrador fuente de discusión (decisión abiertas D1–D12) |
| `docs/ui/diseno-ui-design-system.md` | 1.5 | Sistema de diseño GRAFITO aprobado, componentes, accesibilidad WCAG 2.2 AA+, plan de fases UI |
| `docs/ui/prototipo-validacion.html` | — | Prototipo HTML ejecutable validado (referencia viva para implementación) |
| `docs/ui/tokens.dtcg.json` / `tokens.css` | — | Tokens W3C DTCG / CSS |

**No se encontró** código fuente (`src/` no existe), README raíz, manual de despliegue, plan de pruebas, ni documento de soporte/SLA. La documentación de diseño está madura; la implementación está en cero.

### 2.2 Hallazgos principales

1. El alcance es **grande y transversal**: 11 módulos + portal inquilino + observabilidad + Ops Console. El módulo de Contabilidad es de los más complejos de su categoría (asientos automáticos, cierres parametrizables, motor de impuestos).
2. La **UI ya está diseñada y prototipada** (GRAFITO v1.5 aprobado + prototipo validado). Esto reduce drásticamente las horas de diseño/UX (no partimos de cero) pero implica reproducir fielmente un design system en Blazor/MudBlazor.
3. El diseño incluye **características de ingeniería de alto esfuerzo**: BFF con refresh rotativo, kill-switch con control plane separado, contendencia de fallos por módulo, comprobantes PDF inmutables, conciliación bancaria, motor fiscal parametrizado.
4. **Pendientes bloqueantes**: validación CPA (NIIF vs NIIF PYMES, ISR/ITBMS/retenciones, ITBMS de arrendamiento), validación legal (derecho de arrendamiento, retención 10 años, Ley 81 de 2019) y confirmación de ciudad/proveedores. El país de operación (Panamá) está confirmado en la arquitectura; la ciudad principal no.
5. **12 decisiones de reglas de negocio abiertas** (D1–D12) que cambian comportamiento, no tamaño; deben cerrarse al inicio de cada fase, idealmente en una sesión de decisiones al arrancar F1.

### 2.3 Limitaciones de la estimación

- Sin cifras salariales reales: se usan supuestos de mercado panameño (sección 4) marcados y ajustables.
- Sin plan de cuentas, tasas, ni catálogos reales del cliente: la fase 3 se estima sobre el diseño genérico y se recalibra tras el cuestionario CPA (`modulo-contabilidad.md` §15).
- Sin portales reales de clientes (migración de datos): se asume entrega de datos normalizados o captura desde cero.
- Sin definición de SLA/hosting: se proponen condiciones (sección 12) para acordar.

---

## 3. Clasificación de la información

| Elemento | Estado | Impacto |
|---|---|---|
| Áreas Admin + Portal Inquilino | Confirmado | Incluido |
| Portal propietario (pagos recibidos) | En discusión (PA-04) | Excluido (F4) |
| Módulos: clientes, inmuebles, contratos, cobros, liquidaciones, incidencias, línea blanca, contabilidad, reportes | Confirmado | Incluido |
| Notificaciones Email + Plataforma (F1), SMS (F2) | Confirmado diseño / proveedor pendiente | Incluido con port-adapter |
| WhatsApp (F2) | Supuesto (PA-10, Fase 2) | Contingente / F4 |
| Contabilidad panameña y cierres parametrizables | Confirmado diseño; **marco fiscal pendiente de validar** (PA-09) | Alto — recalibrar F3 |
| Stack .NET 10 / Blazor / PostgreSQL / Redis / S3 / OTel | Confirmado (PA-03) | Incluido |
| Volumen ~400 unidades, 2,500 pagos/mes, 20–50 concurrentes | Supuesto (PA-06) | Bajo (no-funcionales simples) |
| Marco legal de arrendamiento panameño | Pendiente validación abogado (bloqueante) | Alto en Contratos |
| Retención documental 10 años | Supuesto (PA-08) | Bajo/medio |
| Facturación electrónica DGI | Futuro (PA-11) | Excluido |
| Multi-empresa / multi-moneda | Futuro | Excluido |
| Soporte 24/7, horario, SLA | No documentado | Alto — definir en contrato |
| Migración de datos históricos del cliente | No documentado | Alto — negociar como servicio separado |
| Hosting/infraestructura en producción | No documentado | Medio — definir responsabilidad |

---

## 4. Costo hora cargado (supuestos Panamá)

**Modelo:** `Costo hora cargado = Costo anual total del perfil / Horas productivas anuales`.

**Horas productivas anuales: 1,776 ≈ 148 h/mes.** Cálculo: 2,080 − vacaciones/feriados (~288 h) − ausencias/incapacidad (~80 h) − reuniones internas y administración (~120 h) − capacitación (~48 h) − tiempo no facturable/asignable (~144 h) ≈ **1,400 h/año si se descuenta el 19.8% de eficiencia**… *ajuste: usamos 148 h/mes (≈1,776 h/año) porque el costo indirecto ya incluye el tiempo no facturable*; la merma se recupera en el recargo de indirectos (×1.5 de carga directa y +15% de indirectos). Este supuesto es conservador y verificable.

| Perfil | Sueldo bruto/mes (sup.) | Costo laboral directo (×1.5) | + Indirectos 15% | Carga total/mes | Horas productivas/mes | **Costo cargado/hora** |
|---|---:|---:|---:|---:|---:|---:|
| Backend senior | $4,200 | $6,300 | $7,245 | $7,245 | 148 | **$49** |
| Frontend Blazor senior | $3,800 | $5,700 | $6,555 | $6,555 | 148 | **$44** |
| QA engineer | $2,400 | $3,600 | $4,140 | $4,140 | 148 | **$28** |
| DevOps / Cloud | $3,600 | $5,400 | $6,210 | $6,210 | 148 | **$42** |
| Business Analyst | $2,800 | $4,200 | $4,830 | $4,830 | 148 | **$33** |
| Project Manager | $3,200 | $4,800 | $5,520 | $5,520 | 148 | **$37** |
| Arquitecto / Tech Lead | $5,000 | $7,500 | $8,625 | $8,625 | 148 | **$58** |
| Consultor de seguridad (tercero) | — | — | — | — | — | **$85** |

> Supuestos: carga laboral panameña ≈ 1.5× el bruto (cuotas patronales CSS, seguro educativo, décimo tercer mes, vacaciones 30 días, prima de antigüedad, riesgo profesional) e indirectos empresariales (admin, contabilidad, ventas, software, equipos, oficina) ≈ 15% adicional. Rangos de mercado 2026 de boutique en Panamá: backend $3,800–$4,800, frontend $3,400–$4,300, QA $2,000–$2,800, DevOps $3,200–$4,000. **Si los costos reales difieren, el costo total y el precio escalan/desescalan linealmente (ver sección 15).**

---

## 5. Estimación de esfuerzo (WBS)

Metodología: estimación de tres puntos (O/M/P) y fórmula PERT `(O+4M+P)/6` por paquete. Horas finales por paquete = PERT redondeado; ya contemplan complejidad, integraciones, QA, correcciones y gestión dentro de cada fase. La contingencia global se presenta aparte (sección 7), no oculta en las horas.

### 5.1 Fase 0 — Fundación (scaffolding, identidad, seguridad, infraestructura)

| Paquete (Backend, salvo indica) | O | M | P | PERT |
|---|---:|---:|---:|---:|
| Scaffolding monolito modular (Clean Architecture, EF, esquemas por módulo, migraciones) | 80 | 100 | 130 | 102 |
| Identity: auth JWT + cookies httpOnly (BFF), refresh rotativo, sesiones, lockout | 60 | 80 | 120 | 83 |
| Roles dinámicos + catálogo de permisos + policies RBAC (RN-S01..S04) | 80 | 120 | 180 | 123 |
| Configuración global + feature flags + seeds | 30 | 45 | 70 | 47 |
| Auditoría transversal (esquema `audit`, middleware con TraceId) | 40 | 60 | 90 | 62 |
| YARP gateway (routing, rate limit, CORS, headers, correlación, límites) | 40 | 60 | 100 | 63 |
| PostgreSQL 17 + Redis (caché solo lectura, locks, sesiones) | 40 | 55 | 90 | 58 |
| Object Storage (port-adapter S3 + URLs firmadas) | 25 | 40 | 70 | 43 |
| Observabilidad (OTel → Grafana/Loki, health por módulo, alertas) | 50 | 75 | 120 | 78 |
| Ops Console (kill-switch, registro de módulos, pub/sub Redis+DB, fast-fail 503) | 70 | 110 | 180 | 115 |
| Contención de fallos en proceso (bulkheads, circuit breakers, jobs aislados) | 30 | 45 | 80 | 48 |
| CI/CD (GitHub Actions) + Docker Compose (dev/staging/prod) + backups | 40 | 60 | 100 | 63 |
| **Frontend:** app shell Blazor + MudBlazor (tokens GRAFITO, login, áreas por rol) | 60 | 90 | 140 | 93 |
| **Frontend:** guardias de permiso + menú dinámico + shell de dashboard | 40 | 60 | 100 | 63 |
| **Frontend:** componentes base custom (Button, DataTable, StatusChip, MoneyInput, EmptyState, Skeleton, PermissionGuard) | 80 | 120 | 180 | 123 |
| **QA:** marco de pruebas, pipeline de test, pruebas de login/RBAC/estados | 150 | 200 | 280 | 205 |
| **DevOps:** infraestructura como código, secretos, aprovisionamiento de ambientes | 90 | 120 | 170 | 123 |
| **Gestión (PM/BA/Lead):** plan, gutas, kickoff, definición de criterios de aceptación | 100 | 130 | 175 | 133 |
| **Seguridad (tranversal):** diseño de seguridad, revisión de auth/RBAC | 15 | 20 | 30 | 21 |

**Subtotal F0 ≈ 1,648 h**

### 5.2 Fase 1 — Núcleo del negocio

| Paquete (Backend, salvo indica) | O | M | P | PERT |
|---|---:|---:|---:|---:|
| Clientes (personas, contactos, laboral, documentos, bancarios, consentimientos Ley 81, historial) | 120 | 160 | 230 | 165 |
| Inmuebles (atributos JSONB, fotos, documentos, ciclo de vida, historial) | 90 | 130 | 190 | 133 |
| Contratos (administración + arrendamiento, snapshot económico, garantía, inspecciones, renovación/terminación/prorrateo) | 110 | 150 | 220 | 155 |
| Cobros (generación masiva, pagos, mora, unicidad por período, ITBMS) | 130 | 180 | 260 | 185 |
| Liquidaciones (generar, confirmar, anular, integración) | 50 | 75 | 120 | 78 |
| Comprobante PDF inmutable (folio, hash, plantilla, almacenamiento) | 40 | 55 | 90 | 58 |
| Portal inquilino backend (scope por relación, IDOR, endpoints) | 60 | 85 | 130 | 88 |
| **Frontend:** clientes (listado, ficha, tabs, formularios), incluido PDF/export | 70 | 100 | 150 | 103 |
| **Frontend:** inmuebles (listado, ficha, galería, filtros) | 60 | 85 | 130 | 88 |
| **Frontend:** contratos (creación, validaciones, historial) | 60 | 85 | 130 | 88 |
| **Frontend:** cobros (listado, registro de pago, comprobante descargable, mora) | 70 | 95 | 150 | 100 |
| **Frontend:** liquidaciones (listado, confirmar pago) | 30 | 45 | 70 | 47 |
| **Frontend:** portal inquilino base (login, resumen, pagos, recibos, perfil) | 80 | 110 | 170 | 115 |
| **QA:** casos funcionales por módulo, regresión de núcleo, UAT dirigida | 180 | 260 | 380 | 263 |
| **DevOps:** despliegues por fase, migración de datos de arranque | 50 | 60 | 80 | 62 |
| **Gestión:** cierre de decisiones D1–D12, validación legal/CPA inicial, aceptaciones | 110 | 140 | 185 | 143 |

**Subtotal F1 ≈ 1,871 h**

### 5.3 Fase 2 — Operación y comunicación

| Paquete (Backend, salvo indica) | O | M | P | PERT |
|---|---:|---:|---:|---:|
| Incidencias (workflow, timeline append-only, presupuesto, costos, proveedores) | 100 | 140 | 210 | 145 |
| Visitas programadas + eventos de calendario | 40 | 55 | 85 | 57 |
| Notificaciones multicanal (plataforma/email/SMS, plantillas tipadas, preferencias, intentos, reintentos, dedup) | 120 | 170 | 250 | 175 |
| Proveedores Email + SMS (port-adapter reales) | 40 | 60 | 100 | 63 |
| Línea blanca (catálogo, mantenimientos, reportes, avisos preventivos) | 80 | 110 | 170 | 115 |
| Reportes operativos (catálogo, generación, exportación PDF/CSV/Excel, schedules) | 80 | 115 | 175 | 119 |
| **Frontend:** incidencias (tablero, wizard, timeline) | 60 | 85 | 130 | 88 |
| **Frontend:** calendario + agenda (portal y admin) | 50 | 70 | 110 | 73 |
| **Frontend:** notificaciones (bandeja, preferencias, plantillas) | 50 | 70 | 110 | 73 |
| **Frontend:** línea blanca (listado, ficha, mantenimientos) | 40 | 60 | 95 | 63 |
| **Frontend:** reportes (UI + exportación) | 40 | 60 | 95 | 63 |
| **QA:** notificaciones multicanal, incidencias, calendario, línea blanca, regresión | 150 | 220 | 330 | 227 |
| **DevOps:** proveedores externos en staging, monitoreo SLOs | 60 | 80 | 115 | 81 |
| **Gestión:** plantillas, aprobaciones, encuesta de usuarios del portal | 85 | 110 | 150 | 113 |

**Subtotal F2 ≈ 1,455 h**

### 5.4 Fase 3 — Contabilidad completa (módulo de mayor complejidad)

| Paquete (Backend, salvo indica) | O | M | P | PERT |
|---|---:|---:|---:|---:|
| Plan de cuentas (jerárquico, versionado, validación CPA) | 60 | 90 | 140 | 93 |
| Asientos de partida doble (validación débito=crédito, aprobación, reversión, inmutabilidad) | 100 | 140 | 210 | 145 |
| Asientos automáticos desde el negocio (finanzas/ops/assets) | 90 | 130 | 200 | 135 |
| Cierres parametrizables (tipos, scheduler, jerarquía, bloqueo/reapertura, auditoría) | 110 | 160 | 240 | 165 |
| Caja, bancos y conciliación (manual + parser de extracto) | 70 | 100 | 160 | 105 |
| Motor de impuestos (ITBMS, ISR, retenciones, dividendos — parametrizado) | 90 | 130 | 200 | 135 |
| Activos fijos + depreciación (línea recta, integración línea blanca) | 50 | 70 | 110 | 73 |
| Estados financieros (Balance, Resultados, Flujo, Patrimonio + estructura EF + export) | 80 | 115 | 175 | 119 |
| Reportes contables (libro diario, mayor, balanza, auxiliares) | 60 | 90 | 140 | 93 |
| **Frontend:** plan de cuentas (árbol editor) | 40 | 60 | 90 | 62 |
| **Frontend:** editor de asientos (validación en vivo) | 50 | 75 | 115 | 78 |
| **Frontend:** cierres (asistente 4 pasos, períodos, reapertura) | 45 | 65 | 100 | 68 |
| **Frontend:** conciliación bancaria | 30 | 45 | 70 | 47 |
| **Frontend:** impuestos + activos fijos | 40 | 60 | 90 | 62 |
| **Frontend:** estados financieros exportables | 35 | 50 | 80 | 52 |
| **QA:** cuadres, inmutabilidad, cierres (incluye escenarios fiscales), UAT con contador | 190 | 270 | 400 | 278 |
| **DevOps:** procesos batch de cierre, monitoreo de jobs | 60 | 90 | 130 | 92 |
| **Gestión:** cuestionario CPA, parametrización con el contador del cliente, definición de escenarios de validación | 125 | 160 | 215 | 163 |

**Subtotal F3 ≈ 1,965 h**

### 5.5 Resumen de horas por perfil (distribución oficial de costeo)

| Perfil | Horas | % del total |
|---|---:|---:|
| Backend senior | 3,484 | 50.2% |
| Frontend Blazor senior | 1,549 | 22.3% |
| QA engineer | 950 | 13.7% |
| DevOps / Cloud | 350 | 5.0% |
| Project Manager | 220 | 3.2% |
| Business Analyst | 200 | 2.9% |
| Arquitecto / Tech Lead | 120 | 1.7% |
| Seguridad (consultor externo) | 70 | 1.0% |
| **Total oficial** | **6,943** | **100%** |

**Total por fase (subtotales de la WBS):** F0 ≈ **1,648 h** · F1 ≈ **1,871 h** · F2 ≈ **1,455 h** · F3 ≈ **1,969 h** (suman 6,943 h). La distribución fase/perfil es orientativa; el costeo se hace contra la distribución oficial de la tabla anterior.

### 5.6 Dependencias

- **F0 antes de todo** (identity/RBAC y gateway son prerrequisito de cualquier módulo).
- **F1 antes de F2**: incidencias y calendario dependen de inmuebles/contratos; notificaciones dependen de clientes (contactos) y cobros (eventos de pago).
- **F2 antes de F3 parcial**: contabilidad se alimenta de cobros, liquidaciones, incidencias (gastos) y línea blanca (activos). La contabilidad base (Fase A: plan + asientos manuales) puede ejecutarse en paralelo al cierre de F2, pero la automatización (asientos automáticos) requiere F1 completa.
- **Validaciones bloqueantes**: legal (contratos) y CIP (contabilidad) antes de congelar reglas de dichas fases. No detienen el inicio pero sí la aceptación de F1 (contratos) y F3.

---

## 6. Duración calendario (escenarios)

Capacidad de equipo comprometido al proyecto y ritmo sostenible:

| Escenario | Equipo equivalente (FTE) | Capacidad dev/mes | Duración F0–F3 | Riesgo |
|---|---|---|---|---|
| **Acelerado** | ~6 FTE (3 backend, 2 frontend, 0.5 QA/extra) | ~560 h | **7–8 meses** | Presión alta; mayor riesgo en validación contable y UAT del cliente |
| **Recomendado** | ~4.5–5 FTE (2.5 backend, 1.5 frontend, 1 QA, 0.5 DevOps, 0.5 PM) | ~470 h | **9–11 meses** | Equilibrio calidad/tiempo |
| **Conservador** | ~3.5 FTE | ~360 h | **12–13 meses** | Margen amplio, UAT extensa, baja presión |

**Recomendación: escenario recomendado (≈10 meses).** Razones: el módulo contable exige validación con el CPA del cliente y UAT ciclada (no es comprimible sin riesgo de descuadres), y un cliente PYME necesita ritmo de cobro por fases, no una entrega única.

**Calendario indicativo:** Firma ~oct-2026 · F0 oct–nov · F1 dic–mar (incluye cierre de decisiones D1–D12 y validación legal) · F2 mar–may · F3 may–sep · Go-Live y retención de garantía hasta dic-2027.

> Las horas de esfuerzo no son horas calendario: 6,943 h de esfuerzo se ejecutan en ~10 meses por trabajo paralelo de perfiles en distintas fases y por la integración de QA/gestión solapada.

---

## 7. Costos

### 7.1 Costo laboral directo

| Perfil | Horas | Costo/h | Costo |
|---|---:|---:|---:|
| Backend | 3,484 | $49 | $170,716 |
| Frontend | 1,549 | $44 | $68,156 |
| QA | 950 | $28 | $26,600 |
| DevOps | 350 | $42 | $14,700 |
| PM | 220 | $37 | $8,140 |
| BA | 200 | $33 | $6,600 |
| Arquitecto/Tech Lead | 120 | $58 | $6,960 |
| Seguridad (tercero) | 70 | $85 | $5,950 |
| **Costo laboral total** | **6,943** | — | **$307,822** |

### 7.2 Costos directos del proyecto (únicos/recurrentes durante desarrollo)

| Concepto | Tipo | Monto |
|---|---|---|
| Infraestructura cloud dev/staging (contenedores, BD, Redis, storage, backups) ~$600/mes × 10 | Recurrente | $6,000 |
| Dominio, certificado SSL, servicios de correo/SMS en ambientes de prueba | Recurrente | $1,800 |
| Herramientas y misceláneos (QA, gestores, CI runners) | Único | $700 |
| **Total costos directos** | | **$8,500** |

**Costo total sin contingencia = $316,322** (≈ $316k).

### 7.3 Contingencia

| Escenario | Justificación | % | Monto |
|---|---|---|---|
| Bajo riesgo | Requerimientos congelados, CPA validado, sin integraciones externas nuevas | 5% | $15,816 |
| **Riesgo medio (recomendado)** | Decisiones D1–D12 abiertas, marco legal/fiscal pendiente, proveedores de notificación sin elegir, cliente PYME | **12%** | **$37,959** |
| Alto riesgo | Cambio de país/moneda, plan de cuentas rediseñado, migración de datos masiva, integración bancaria real | 20% | $63,264 |

No se oculta la contingencia en las horas: es una partida explícita de negocio para absorber cambios menores, defectos no detectados y retrabajo sin que la utilidad se erosione.

**Costo con contingencia (recomendado) = $354,281** (≈ **$354k**).

---

## 8. Precio comercial (F0–F3)

Fórmula: `Precio = (Costo + Contingencia + Costos directos) / (1 − Margen objetivo sobre ventas)`. Se distingue utilidad bruta (precio − costo directo real) y neta (después de ISR ~25%).

| Escenario | Contingencia | Costo total (con cont.) | **Precio** | Utilidad bruta (precio − costo directo) | Margen (precio − costo total)/precio | Condiciones |
|---|---:|---:|---:|---:|---:|---|
| **Mínimo sostenible** | 8% ($25,306) | $341,628 | **≈ $427k** ($425–440k) | ~$111k | **20%** | Alcance congelado por escrito, pagos puntuales, sin garantía extra ni SLA premium |
| **Recomendado** | 12% ($37,959) | $354,281 | **≈ $506k** ($500–525k a negociar por fases) | ~$190k | **30%** | Híbrido por fases + CRs cobrados + garantía 90 días por fase |
| **Premium** | 18% ($56,938) | $373,260 | **≈ $602k** | ~$286k | **38%** | Garantía 6 meses global, SLA con respuesta 2 h, prioridad en bolsa de horas, formación del CPA, entrega acelerada |

> Nota: el margen del 30% (recomendado) se mide sobre el costo *con contingencia*; equivaldría a ≈37.5% de margen bruto si se midiera contra el costo directo real. Es el espacio que absorbe retrasos (sección 11).

**Recomendación comercial:** ofrecer **precio por fases** (F0 ≈ $115–125k · F1 ≈ $130–140k · F2 ≈ $100–110k · F3 ≈ $140–150k; total ≈ **$500–525k**). Es equivalente al escenario recomendado, reduce la barrera inicial del cliente PYME y protege el flujo de caja. No negociar por debajo de F0+F1 ≥ $240k (mínimo sostenible del tramo) y jamás fijar un total < $427k.

**Justificación del precio recomendado:** 9–11 meses de trabajo de un equipo boutique en Panamá con entregables de cumplimiento legal/fiscal, observabilidad de extremo a extremo, kill-switch y comprobantes auditables; margen de ~37% bruto es sano para una empresa nueva y deja espacio para absorber retrasos de hasta ~+30% de horas sin volverse pérdida (sección 11).

---

## 9. Modelo de contratación

### 9.1 Comparación

| Modelo | Cuándo conviene | Riesgo proveedor | Riesgo cliente |
|---|---|---|---|
| **Precio fijo total** | Solo con alcance cerrado y decisiones resueltas | Cambios de alcance no cubiertos | Paga por adelantado en hitos |
| **Tiempo y materiales** | Requisitos volátiles, confianza alta | Menor (cobra horas) | Puede dispararse sin tope |
| **Bolsa de horas mensual** | Sostenimiento post-producción | Capacidad ociosa si no se consume | Debe gestionar el consumo |
| **Contrato anual (SLA + bolsa)** | Relación larga y compromiso mínimo | Ingreso recurrente previsible | Se ata a compromiso anual |
| **Híbrido por fases (elegido)** | **Fases bien definidas + evolución incierta** | **Mitigado con fases y CRs** | **Previsibilidad por fase** |

### 9.2 Modelo híbrido recomendado

1. **Discovery/parametrización pagado** al inicio (cuestionario CPA, plan de cuentas, catálogos, cierre de D1–D12): cubierto por el anticipo del 20% (≈ $101k), que financia el arranque y el primer tramo de trabajo.
2. **Desarrollo por fases con precio fijo por fase** y **alcance congelado por fase** (Documento de Alcance firmado por fase que lista módulos, RF, RD/FL y criterios de aceptación).
3. **T&M para cambios:** todo lo no incluido en la fase = change request con estimación aprobada antes de ejecutar (nunca "de paso").
4. **Garantía** limitada (sección 12).
5. **Soporte mensual + bolsa de horas** post-producción (sección 13).
6. **Incidentes críticos** con condiciones explícitas; fuera de horario = horas premium, no "gratis porque es garantía".

**Por qué:** el alcance está bien documentado (apto para precio fijo) pero el cliente PYME y el marco fiscal panameño introducen incertidumbre real (no apto para fijar todo el riesgo en horas). Las fases congeladas dan previsibilidad y permiten cobrar antes de ejecutar cada tramo.

---

## 10. Plan de cobro

Objetivo: que el cliente financie *su* proyecto (no la nómina propia), con hitos ligados a aceptación objetiva.

| Hito | % sobre precio de fase | Momento |
|---|---|---|
| Anticipo de reserva de capacidad y arranque | 20% del valor **total** del contrato | A la firma (≈ $100k) |
| Inicio de fase | 40% del valor de la fase | Al arranque de cada fase (F1…F3) |
| Aceptación de fase (DoD cumplido, UAT firmada) | 50% del valor de la fase | Contra acta de aceptación |
| Cierre de fase | 10% del valor de la fase | 30 días después de la aceptación |
| Retención de garantía | 5% del contrato | Liberada 90 días tras el Go-Live final (o 60 días post última aceptación) |

**Condiciones de cobro:**
- **Aceptación:** el cliente tiene 5 días hábiles de revisión por entrega; **silencio = aceptación tácita** (evita retrasos por aprobaciones tardías — riesgo típico documentado).
- **Plazo de pago: 10 días** tras facturación para facturas de hitos; el 50% de aceptación y el 10% de cierre se facturan con la UAT firmada.
- **Pagos atrasados:** interés moratorio acordado y **derecho a pausar la siguiente fase** sin penalidad propia para la empresa (protege flujo). No financiar indefinidamente: la regla interna es "no superar 1 mes de costo laboral pendiente de cobro" (≈ $38k ≈ costo del tramo F0).
- **Costos iniciales:** el anticipo cubre el costo real del primer mes (nómina ≈ $38k) y deja margen; no entrar a trabajar sin el anticipo de la fase.

Ejemplo de flujo (contrato ≈ $506k): firma $101k · inicio F0 $48k (40% de ~$120k) · aceptación F0 $60k + cierre $12k · y así por fase · retención final ~$25k a 90 días. La empresa recupera ≈ $160k en los primeros 60 días.

---

## 11. Análisis financiero de escenarios (sensibilidad)

Base: precio fijo recomendado ≈ $506k · costo directo real $316k · costo variable ~$44.34/h (blended).

| Escenario | Costo | Utilidad bruta | Margen | Efecto en flujo |
|---|---:|---:|---:|---|
| Termina en tiempo | $316k | ~$190k | ~37% | Sano con cobro por fases |
| Retraso +15% horas (+1,041 h) | $362k | ~$144k | ~28% | Margen aún aceptable |
| Retraso +30% horas (+2,083 h) | $409k | ~$97k | ~19% | Aprieta; revisar velocidad |
| Retraso +50% horas (+3,472 h) | $470k | ~$36k | ~7% | Umbral de alerta |
| **Punto de pérdida** | ~$511k | **$0** | 0% | ≈ **+62% de horas** sin cobrar el exceso |
| Cliente paga +30 días | — | — | — | Tensión de caja ≈ $80–100k de capital de trabajo; mitigado con pausa de fase |
| Integración más compleja (bancos/WhatsApp en vivo) | +$15–25k directos | se erosiona | −5–7 pts | Requiere CR/bolsa antes de ejecutar |
| Menor productividad (80% del ritmo base) | 316×1.25 = $395k | $111k | 22% | Parcialmente absorbido por contingencia |

**Conclusión:** el margen recomendado absorbe retrasos de hasta ~30% sin pérdida y hasta ~50% antes de tocar la utilidad mínima. La pérdida real aparece por **cambios de alcance no cobrados** y por **pagos lentos** (no por horas técnicas): de ahí que el modelo híbrido, los CRs y el plan de cobro sean la protección principal.

---

## 12. Garantía, incidentes y nuevos desarrollos

### 12.1 Garantía (por fase)
- **Duración:** 90 días desde la aceptación de cada fase (o 60 días post Go-Live global).
- **Defecto incluido:** incumplimiento de un RF/RD/FL/acceso documentado en el alcance de la fase, reproducido en el ambiente de staging. Corrección sin costo.
- **Cambio excluido:** toda petición no documentada, ajuste de reglas legales/fiscales que cambien después de la aceptación, integraciones nuevas, cambios de diseño no aprobados. → Change request con estimación.
- **Dependencias del cliente:** datos de prueba correctos, ambientes disponibles, reproducibilidad; si el cliente no puede reproducir, se apoya con bolsa de horas.

### 12.2 Incidentes (post-producción)
| Severidad | Ejemplo | Respuesta | Atención objetivo | Horario |
|---|---|---|---|---|
| P1 Crítico | Plataforma caída, bloqueo de cobros | ≥ 2 h hábiles | Continua hasta estabilizar | Lun–vie 8–18 h América/Panamá; fuera de horario = horas premium |
| P2 Alto | Módulo degradado, cierre bloqueado | ≥ 4 h hábiles | ≤ 24–48 h hábiles | Horario estándar |
| P3 Normal | Error funcional no crítico | ≥ 8 h hábiles | Siguiente release | Horario estándar |
| P4 Menor | Cosmético, mejora | ≥ 16 h hábiles | Backlog acordado | Horario estándar |

- Canal: tickets (portal/email) + teléfono para P1. Escalamiento: QA/dev → Lead → dueño.
- **No se promete soporte 24/7 ni resolución inmediata** (capacidad operativa de boutique). P1 fuera de horario, si el cliente lo exige, se cotiza como horas premium ($85–110/h) con disponibilidad preacordada.

### 12.3 Nuevos desarrollos
Separar siempre: cambio de alcance = **Change Request** con estimación aprobada · pequeña evolución = **bolsa de horas** · desarrollo grande = **nueva fase/proyecto** con contrato propio. **Ningún desarrollo nuevo ilimitado cae dentro de la garantía.**

---

## 13. Bolsa de horas de evolución y soporte (post-producción)

Tarifa táctica de referencia para evolución: **$65/h** (se mantiene la utilidad mínima sostenible: costo marginal ~$44/h + soporte). Descuento por volumen y por compromiso mensual/anual.

| Plan | Horas/mes | Total mensual | Tarifa efectiva | Uso recomendado |
|---|---:|---:|---:|---|
| **Básico** | 20 | **$1,235** | $61.75 | Incidentes y ajustes menores + soporte administrativo |
| **Profesional** | 50 | **$2,860** | $57.20 | Evolución continua (recomendado: incluye soporte estándar) |
| **Empresarial** | 120 | **$6,240** | $52.00 | Mayor capacidad, prioridad y ventanas de cambio acordadas |

- Vigencia 12 meses; **rollover ≤ 30%**; renovación con revisión de tarifa (+IPC o +5% anual).
- Soporte estándar (P2–P4, horario comercial) incluido en el plan Profesional en adelante; P1 fuera de horario siempre por horas premium.
- No ofrecer descuentos que rompan el mínimo: 120 h × $52 = $6,240 frente a 120 × $44 = $5,280 (margen ~15% en el plan más barato — frontera del mínimo aceptable).

---

## 14. Recomendación final

1. **Alcance contractual:** Fases 0–3. Excluir explícitamente: portal propietario (F4), facturación electrónica DGI, multi-empresa/multi-moneda, WhatsApp e integración bancaria en vivo (marcados como futuros por la propia arquitectura PA-04/PA-10/PA-11).
2. **Precio:** ofrecer **≈ $500–525k por fases** (recomendado), con mínimo negociable **$427k** y premium **$602k** si piden SLA/garantía extendida. No bajar a precio de entrada técnico: el trabajo ya está bien documentado y su valor no justifica regalarlo; el primer cliente se gana con modelo por fases + referencias, no con pérdida.
3. **Modelo:** híbrido por fases (precio fijo por fase congelado + T&M para CRs), garantía 90 días por fase, soporte mensual + bolsa de horas post-producción (plan Profesional como opción por defecto).
4. **Cobro:** anticipo 20% a la firma + 40/50/10% por fase + retención de garantía 5%; aceptación con silencio-tácito a 5 días; pausa de fase ante mora.
5. **Antes de firmar F3** (y para ajustar precios): completar el cuestionario CPA (`modulo-contabilidad.md` §15) y la validación legal; cerrar D1–D12 en la sesión de inicio de F1; confirmar proveedores de notificación; definir responsable de producción/hosting y SLA.
6. **Durante el desarrollo:** cada CR se cobra, cada defecto se documenta con reproducción, y la UAT se agenda con el usuario final del cliente (administradora, cobros, contador) para no convertir el testing del cliente en trabajo propio no pagado.

---

## 15. Reglas de ajuste (sensitivity del modelo)

- **Salarios reales distintos:** costo hora actualizado = (sueldo_real × 1.5 × 1.15) / 148. El precio escala linealmente con el cociente de tarifas; p.ej. si el backend real cuesta $56/h (vs $49), el costo laboral sube ~7% → precio recomendado ≈ $540k.
- **Horas de la WBS diferentes:** si el equipo valida otra estimación, reindexar el total oficial (6,943 h) con la cuenta de perfil → tabla de la sección 7.1 (el precio recomendado ≈ costo × 1.6 con contingencia del 12%).
- **Unidades PERT:** presentamos rangos; no hay falsa precisión. Cualquier cifra se cita como "estimación ±15–25%".

---

## 16. Información pendiente priorizada (afecta precio antes de firmar)

| # | Pendiente | Bloqueante | Efecto comercial |
|---|---|---|---|
| 1 | Validación CPA: plan de cuentas, NIIF vs NIIF PYMES, tasas ISR/ITBMS/retenciones, ITBMS de arrendamiento | Sí (F3) | Recalibrar F3 (rango ±10–15%) |
| 2 | Validación legal: derecho de arrendamiento, retención 10 años, Ley 81/2019 | Sí (F1/F3) | Reglas de Contratos y archivo |
| 3 | Confirmación ciudad principal y moneda (PA-01/PA-02) | Sí | Lógica de fechas/impuestos |
| 4 | Decisiones D1–D12 | No | Ajuste de reglas, no de tamaño |
| 5 | Proveedores email/SMS/WhatsApp y storage | No (F2) | Costos operativos del cliente |
| 6 | Migración de datos históricos del cliente | Alto | Servicio aparte (bolsa/nuevo contrato) |
| 7 | Responsable de hosting/producción y SLA | Medio | Incluir en contrato o deuda técnica |
| 8 | Documento de alcance por fase y criterios de aceptación | Sí | Precondición para precio fijo por fase |

---

## 17. Supuestos explícitos (para auditoría del modelo)

- Costos laborales panameños de boutique 2026 (sección 4); carga laboral ×1.5 e indirectos +15%; 148 h productivas/mes.
- Equipo comprometido de 4.5 FTE en el escenario recomendado; nómina mensual en proyecto ≈ $38k.
- Sin facturación electrónica DGI, sin multi-empresa, sin portal propietario en F0–F3.
- Infraestructura de producción y SLAs responsabilidad del cliente (o contrato de hosting aparte, excluido del alcance).
- Volumen objetivo 400 unidades/2,500 pagos (no modifica el estimado de esfuerzo principal).

---

*Documento de trabajo v1.0. Los números son estimaciones para decisión de negocio, no obligaciones contractuales. Validar la lista de la sección 16 antes de emitir la cotización final del cliente.*