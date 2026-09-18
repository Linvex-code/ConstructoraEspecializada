# Plataforma de Administración de Inmuebles, Portales y Contabilidad

Sistema integral para la administración de inmuebles y alquileres de una empresa especializada en Panamá: clientes (inquilinos y propietarios), inmuebles, contratos, cobros con recibos descargables, portales para inquilinos, línea blanca, notificaciones multicanal y contabilidad conforme a la normativa panameña.

## Estado del proyecto

El proyecto se encuentra en **fase de diseño y documentación**. La arquitectura, los módulos, el design system y las presentaciones están listos y aprobados; la implementación está planificada por fases (F0–F4) según el roadmap de la sección [Roadmap](#roadmap).

## Objetivo y alcance

1. **Módulo de Clientes**: registro de personas — inquilinos y propietarios — con información general, laboral, documentos, cuentas bancarias y consentimientos de datos personales (Ley 81 de 2019).
2. **Módulo de Inmuebles**: portafolio con atributos enriquecidos (metros, habitaciones, baños, estacionamientos, amueblado, servicios) y fotografías.
3. **Contratos**: contrato de administración (empresa ↔ propietario) y contrato de arrendamiento (empresa ↔ inquilino) con parámetros económicos congelados (snapshot).
4. **Cobros y recibos descargables**: generación de recibos mensuales, registro de pagos, mora y comprobantes PDF inmutables con folio e integridad.
5. **Portales**: portal del inquilino (incidencias, calendario, notificaciones, pagos y comprobantes) y portal del propietario (pagos recibidos — en discusión).
6. **Línea Blanca**: catálogo de electrodomésticos por inmueble con historial de mantenimientos y reportes por equipo.
7. **Contabilidad completa** conforme a la normativa panameña: plan de cuentas, partida doble, asientos, conciliación bancaria, activos fijos y depreciación, impuestos (ISR, ITBMS, retenciones) y **cierres contables parametrizables** (diario, semanal, mensual, trimestral, bimestral, semestral, anual).
8. **Roles y permisos**: el cliente crea y gestiona sus propios roles a partir de un catálogo de permisos fijo definido por el equipo de desarrollo.
9. **Notificaciones multicanal**: plataforma, email, SMS y WhatsApp (por fases), con calendario y preferencias por persona y evento.

## Stack tecnológico (objetivo)

| Capa | Tecnología |
|---|---|
| Frontend | Blazor Web App (ASP.NET Core 10) + MudBlazor |
| Backend | ASP.NET Core 10 — Monolito Modular, Clean Architecture |
| API Gateway | YARP |
| Base de datos | PostgreSQL 17 (esquema por módulo) |
| Caché y locks | Redis |
| Almacenamiento binarios | Object Storage S3-compatible (URLs firmadas) |
| Procesos asíncronos | Quartz.NET (recibos, avisos, cierres, mantenimientos) |
| Observabilidad | OpenTelemetry → Prometheus / Grafana / Loki |

## Módulos

| Módulo | Documento |
|---|---|
| Clientes | [`docs/modulos/clientes.md`](docs/modulos/clientes.md) |
| Inmuebles | [`docs/modulos/inmuebles.md`](docs/modulos/inmuebles.md) |
| Contratos | [`docs/modulos/contratos.md`](docs/modulos/contratos.md) |
| Cobros | [`docs/modulos/cobros.md`](docs/modulos/cobros.md) |
| Liquidaciones | [`docs/modulos/liquidaciones.md`](docs/modulos/liquidaciones.md) |
| Incidencias | [`docs/modulos/incidencias.md`](docs/modulos/incidencias.md) |
| Línea Blanca | [`docs/modulos/linea-blanca.md`](docs/modulos/linea-blanca.md) |
| Contabilidad | [`docs/modulos/contabilidad.md`](docs/modulos/contabilidad.md) |
| Reportes | [`docs/modulos/reportes.md`](docs/modulos/reportes.md) |
| Administración y Seguridad | [`docs/modulos/administracion-seguridad.md`](docs/modulos/administracion-seguridad.md) |
| Portal Inquilino | [`docs/modulos/portal-inquilino.md`](docs/modulos/portal-inquilino.md) |

Registro maestro de versiones por módulo: [`docs/modulos/README.md`](docs/modulos/README.md)

## Arquitectura

- **Patrón**: monolito modular (un despliegue) con **bounded contexts** y **esquema de base de datos por módulo** (soberanía de datos). Extracción a microservicios solo si el volumen de un módulo lo justifica (ADR-001, ADR-015).
- **Aislamiento de fallos**: contención en proceso (bulkheads, circuit breakers), observabilidad por módulo y **kill-switch remoto** (Ops Console) que apaga módulos sin reinicio (ADR-016, ADR-017, ADR-018).
- **Seguridad**: patrón BFF (JWT en cookie httpOnly + refresh rotativo), RBAC con roles dinámicos y permisos fijos, validación siempre en backend, protección de datos personales (Ley 81 de 2019).
- **Dinero**: montos como enteros en centavos, optimismo-concurrency, comprobantes y asientos **inmutables y auditables**.

Documentos de arquitectura:

- [`docs/diseno-arquitectura.md`](docs/diseno-arquitectura.md) — arquitectura v1.3, C4, bounded contexts, seguridad, ADRs y supuestos.
- [`docs/adr-aislamiento-modulos-killswitch.md`](docs/adr-aislamiento-modulos-killswitch.md) — ADR-015…018: aislamiento de módulos, kill-switch y control plane.
- [`docs/modulo-contabilidad.md`](docs/modulo-contabilidad.md) — diseño del módulo de contabilidad panameña (incluye cierres parametrizables).

## Design system — GRAFITO

Sistema de diseño **open design** y tool-agnostic: cualquier equipo puede construir la UI leyendo los tokens y componentes.

- [`docs/ui/diseno-ui-design-system.md`](docs/ui/diseno-ui-design-system.md) — sistema de diseño GRAFITO v1.7, componentes y accesibilidad WCAG 2.2 AA+.
- [`docs/ui/tokens.dtcg.json`](docs/ui/tokens.dtcg.json) — tokens W3C DTCG.
- [`docs/ui/tokens.css`](docs/ui/tokens.css) — variables CSS.
- [`docs/ui/prototipo-validacion.html`](docs/ui/prototipo-validacion.html) — prototipo de validación ejecutable.
- [`ui/prototipo-demo.html`](ui/prototipo-demo.html) — demo del prototipo.

## Estructura del repositorio

```
/
├─ docs/
│  ├─ diseno-arquitectura.md                 # Arquitectura v1.3 (C4, módulos, ADRs)
│  ├─ adr-aislamiento-modulos-killswitch.md  # ADR-015…018 (aislamiento, kill-switch)
│  ├─ modulo-contabilidad.md                 # Diseño del módulo de contabilidad panameña
│  ├─ modulos/                               # Documentos oficiales por módulo (11)
│  ├─ planificacion/                         # Análisis comercial y financiero (interno)
│  ├─ ui/                                    # Design system GRAFITO, tokens y prototipos
│  └─ presentacion/ + presentacion-slidev/   # Presentaciones ejecutables
└─ ui/
   └─ prototipo-demo.html                    # Prototipo interactivo
```

## Presentaciones

1. **Presentación GRAFITO (Reveal.js, autocontenida)**: abrir [`docs/presentacion/index.html`](docs/presentacion/index.html) directamente en el navegador. No requiere servidor ni npm. Versión en PDF: `docs/presentacion/GRAFITO-presentacion.pdf`.
2. **Presentación Slidev**: [`docs/presentacion-slidev/`](docs/presentacion-slidev/) — requiere Node.js ≥ 20.12.

```bash
cd docs/presentacion-slidev
npm install
npm run dev
```

## Roadmap

| Fase | Alcance |
|---|---|
| **F0 — Fundación** | Identity + roles dinámicos con permisos, Gateway, observabilidad, CI/CD, Docker Compose |
| **F1 — Núcleo del negocio** | Clientes, Inmuebles, Contratos, Cobros con recibos descargables, portal inquilino básico, liquidaciones |
| **F2 — Operación y comunicación** | Incidencias, calendario, notificaciones multicanal, línea blanca, reportes operativos |
| **F3 — Contabilidad completa** | Plan de cuentas, asientos automáticos, cierres parametrizables, impuestos, estados financieros, conciliación |
| **F4 — Extensión** | Portal propietario (si se confirma), proveedores defitivos (SMS/WhatsApp), facturación DGI, multi-moneda |

## Pendientes y supuestos

- **Validación bloqueante** del marco legal y fiscal panameño (arrendamiento, DGI, ITBMS/ISR/retenciones) con asesor legal y Contador Público Autorizado antes de fijar las reglas de Contratos y Contabilidad.
- **Decisiones de reglas de negocio abiertas (D1–D12)**: registradas en [`docs/modulos/README.md`](docs/modulos/README.md) (pág. §6).
- Supuestos completos PA-###: [`docs/diseno-arquitectura.md`](docs/diseno-arquitectura.md) (§24).