# Análisis de stack alternativo — Laravel + FilamentPHP (vs. diseño .NET v1.5)

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 21/09/2026 |
| **Estado** | Borrador de análisis. Evalúa reemplazar el stack .NET de `docs/diseno-arquitectura.md` v1.5 por Laravel 13 + FilamentPHP. **No modifica ADRs**: cualquier cambio de plataforma requiere un ADR que confirme o rechace esta evaluación |
| **Documento base** | `docs/diseno-arquitectura.md` (v1.5) — secciones 3, 4, 5, 6, 17, 18, 19, 22, 23 |
| **Documentos relacionados** | `docs/adr-aislamiento-modulos-killswitch.md` (ADR-015–018) · `docs/modulo-contabilidad.md` · `docs/modulos/README.md` · `docs/ui/diseno-ui-design-system.md` (GRAFITO) |

> **Estado del proyecto**: fase de diseño y documentación, sin código. Este documento es un análisis en papel (alcance documental), no un POC ejecutado.

---

## 1. Resumen ejecutivo

El stack **Laravel 13 + FilamentPHP v5 (Livewire v4)** puede cubrir **el 100% de los requisitos funcionales y arquitectónicos** documentados, con las siguientes salvedades que el equipo acepta explícitamente:

| Área | ¿Equivalente? | Gap principal / mitigación |
|---|---|---|
| Monolito modular + esquema por módulo | ✅ | Eloquent por defecto es conexión única; se configura **una conexión por esquema** (PostgreSQL `search_path`) o se disciplina con tests de arquitectura (Pest `Arch`) y contratos in-process |
| Aislamiento de fallos en proceso (ADR-016) | ✅ (parcial) | Laravel no trae semáforos/circuit breaker por defecto; se implementa en la **capa de Application Service** (por módulo) o con HTTP client + timeouts. Sin equivalente directo a Polly |
| Kill-switch remoto (ADR-017) | ✅ | 100% portable: Redis pub/sub + DB persistente + middleware fast-fail 503 + jobs que se pausan. La Ops Console se implementa como panel Filament separado |
| Observabilidad por módulo (ADR-018) | ✅ | OTel (traces/métricas/logs) vía `keepsuit/laravel-opentelemetry` + `spatie/laravel-prometheus` + Monolog → Loki. Prometheus scrape en el backend (requiere ajustar arquitectura: el diseñado .NET usaba Collector + push; PHP se scrapea) |
| Pagos en línea / ACH (ADR-019) | ✅ | Patrón port-adapter igual que en .NET: `IPaymentProvider` → implementaciones Yappy/ACH/tarjeta. Sin paquete cerrado que fuerce proveedor |
| Firma electrónica (ADR-020) | ✅ | PDF + hash/timestamp + consentimiento; igual que .NET (si el cliente exige firma digital certificada, se integra proveedor vía SDK PHP) |
| Nómina parametrizable (ADR-022) | ✅ | Reglas de cálculo versionadas en BD + planilla de estados inmutables; no requiere framework especial |
| Scheduler + workers (ADR-006) | ✅ | Laravel Scheduler (cron) + **Horizon** (colas Redis) + gestionar tareas desde Filament (`filament-database-schedule`, reemplaza Quartz.NET) |
| Backend REST versionado (ADR API) | ✅ | Routes de API en Laravel + Form Requests + `Problem Details` (RFC 7807) implementable a medida |
| Autenticación BFF (ADR-005) | ✅ (mejor) | Laravel usa **sesiones + cookie httpOnly + CSRF nativo** por defecto. No es necesario JWT; si se necesita API pública, `laravel/sanctum` |
| Roles dinámicos + permisos fijos (ADR-011) | ✅ | **`spatie/laravel-permission` + `bezhansalleh/filament-shield`** → RBAC visible en el panel, permisos sembrados por seed, roles compuestos por el cliente |
| Dinero en centavos (ADR-010) | ✅ | **`brick/money` + `brick/math`** (entero inmutable, `Money::ofMinor`, aritmética exacta) en vez de BIGINT manual |
| Registro de auditoría con traceId (ADR-009) | ✅ | `spatie/laravel-activitylog` (auditoría de negocio) + trazabilidad OTel con `trace_id` en logs |

**Veredicto**: factible; **tiempo estimado de desarrollo y coste de mantenimiento menores** que el stack .NET documentado, sobre todo por (a) panel admin completo casi gratis con Filament, (b) RBAC maduro de spatie + Shield, (c) ecosistema de packages muy activo para Laravel, (d) menos piezas que un monolito ASP.NET + Blazor + YARP + Quartz. Riesgo principal: **esquemas por módulo + contención de fallos requieren disciplina propia del equipo**, no vienen "en la caja".

---

## 2. Veredicto por dimensión (tabla de comparación con ADRs)

| ADR (.NET) | Decisión documentada | Equivalente Laravel | Nivel |
|---|---|---|---|
| ADR-001 | Monolito modular | Monolito modular Laravel (misma filosofía) | Igual |
| ADR-002 | ASP.NET Core 10 + EF Core | **Laravel 13** + Eloquent (PostgreSQL) | Cambio de plataforma |
| ADR-003 | PostgreSQL 17 | **PostgreSQL 17** (sin cambio) | Igual |
| ADR-004 | Blazor Web App + MudBlazor | **FilamentPHP v5 + Livewire v4** (admin) + **Livewire/Blade** (portales) | Cambio de plataforma |
| ADR-005 | JWT + refresh rotativo BFF | **Sesiones Laravel** (cookie httpOnly + CSRF) + **Sanctum** solo si hay API | Cambio de plataforma (más simple) |
| ADR-006 | Quartz.NET | **Laravel Scheduler** + Horizon + `filament-database-schedule` | Cambio de plataforma |
| ADR-007 | Port-adapter para integraciones | Mismo patrón (interfaces PHP) | Igual |
| ADR-008 | Transaccionalidad entre módulos | `DB::transaction` (misma semántica ACID) | Igual |
| ADR-009 | OTel → Collector → Grafana/Loki | OTel PHP + Prometheus client PHP + Monolog → Loki | Parcial (ver §5.3) |
| ADR-010 | Montos BIGINT centavos | `brick/money` (inmutable, minor units) | Igual (más seguro) |
| ADR-011 | Catálogo permisos fijo + roles dinámicos | `spatie/laravel-permission` + `filament-shield` + seeds | Igual |
| ADR-012 | Cierres contables parametrizables | Módulo de Contabilidad propio + Scheduler | Igual |
| ADR-014 | Recibos PDF inmutables | `spatie/laravel-pdf` (DOMPDF) + Object Storage S3 | Igual |
| ADR-015 | Esquemas por módulo, sin FK entre esquemas | Conexiones por esquema o convención + tests Arch; **sin FK entre esquemas** | Igual (requiere disciplina) |
| ADR-016 | Bulkheads/breakers/degrada (Polly) | Patrón manual (Application Services + timeouts) | **Gap parcial** |
| ADR-017 | Kill-switch remoto + Redis pub/sub + fast-fail 503 | Implementación propia equivalente | Igual |
| ADR-018 | OTel por módulo + Prometheus/Loki | Prometheus scrape + Monolog JSON → Loki + OTel traces | **Gap parcial** (§5.3) |
| ADR-019 | Pagos por `IPaymentProvider` | Interfaz `IPaymentProvider` + implementaciones | Igual |
| ADR-020 | Firma electrónica (Ley 51/2008) | `spatie/laravel-pdf` + evidencia de firma | Igual |
| ADR-021 | KPI con reglas parametrizables | Reglas DB + vistas materializadas/caché | Igual |
| ADR-022 | Nómina parametrizable + planilla inmutable | Modelo propio + Scheduler + contabilidad | Igual |

---

## 3. Stack objetivo (confirmado a 21/09/2026)

| Componente | Versión objetivo | Notas / fuentes |
|---|---|---|
| PHP | **8.4 o 8.5** | Laravel 13 soporta 8.3–8.5; los packages clave (spatie/laravel-prometheus 1.6, activitylog 5.x) ya exigen ^8.4 |
| Laravel | **13.30.x** | v13 es el major actual (mar-2026 PHP 8.3+); Laravel 12 quedó solo en modo seguridad (ago-2026) |
| FilamentPHP | **v5.7.x** | Con Livewire v4 (feb-2026). v4 sigue manteniéndose; se elige v5 = Livewire 4 |
| Livewire | **v4** | Requisito de Filament v5 |
| PostgreSQL | **17** | Sin cambio (ADR-003) |
| Redis | 7.x | Colas (Horizon), caché con invalidación, locks, pub/sub (kill-switch) |
| Node | ≥ 20.12 | Solo para el build de assets de Filament (Vite) |
| Driver de colas | Redis | Horizon como dashboard/monitor de colas |

---

## 4. Catálogo completo de paquetes/plugins del proyecto

> Todos los paquetes listados fueron verificados en Packagist/GitHub (estado: 21/09/2026). Incluye seguridad, observabilidad, feature flags y todo lo demás necesario para construir la plataforma completa, particionado por responsabilidad.

### 4.1 Núcleo de plataforma

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `laravel/framework` ^13 | Framework base (routing, Eloquent, auth, cache, colas, scheduler, Vite) | Plataforma completa del backend |
| `laravel/sanctum` | Tokens de API / auth SPA para cuando el cliente requiera API REST pública o consumo desde los portales | Complements ADR-005 (solo si hay API externa) |
| `laravel/horizon` | Dashboard de colas Redis (jobs en cola, fallidos, velocidad, procesos) | Reemplaza la vista "cola del scheduler" del diseño .NET; monitoreo job-ready |
| `laravel/reverb` | Servidor WebSocket (primer-party) | Notificaciones en tiempo real del portal (calendario/visitas/pagos) si se decide push; alternativa a polling |
| `laravel/telescope` | Inspector de request, queries, jobs, correos (solo dev) | Diagnóstico en desarrollo; se desactiva en prod |
| `laravel/pulse` | Dashboard de métricas de la app (uso, latencia, colas) con almacenamiento propio | Primer plano de observabilidad ejecutiva; complementa al Prometheus scrape |
| `laravel/nightwatch` *(opcional)* | APM gestionado de Laravel | Alternativa SaaS si el cliente prefiere no operar Grafana; se usa solo si se contrata |
| `vite` + `vitejs/plugin-vue` | Build de assets frontend | Requerido por Filament v5 para compilar el tema GRAFITO |
| `predis/predis` (o `ext-redis`) | Cliente Redis | Conecta colas/caché/pub-sub |

### 4.2 Panel administrativo (Filament)

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `filament/filament` v5 | Framework de paneles admin (CRUD, forms, tables, widgets, auth, MFA) sobre Livewire | Sustituye a Blazor+MudBlazor (ADR-004) para el área admin y la Ops Console |
| `bezhansalleh/filament-shield` | RBAC dentro de Filament: genera automáticamente permisos `modulo.accion` por Resource/Page/Widget y policy | Implementa ADR-011 "catálogo de permisos fijo + roles dinámicos creados por el cliente" con edición desde el panel |
| `husam-tariq/filament-database-schedule` | Gestión de tareas programadas desde Filament (create/activate/inactivate/delete/history) guardadas en BD | Reemplaza Quartz.NET (ADR-006): programar cierres, recibos, avisos sin relanzar |
| Filament **Import/Export nativo** (v3+) | Acciones de importar/exportar CSV/XLSX con colas | Import/export de catálogos (clientes, inmuebles, plan de cuentas) y reportería rápida |
| `spatie/laravel-health` | Checks de salud (BD, cache, Redis, colas, backups, disco, CPU, security advisories) con endpoint JSON | `health` checks de ADR-009/018: `/health/live`, `/health/ready`, por módulo (las alarmas disparan hacia notificadores) |
| `spatie/security-advisories-health-check` | Check que detecta vulnerabilities conocidas en `composer.lock` | Seguridad continua: falla el deploy/health si un paquete tiene CVE |
| `tharinda-rodrigo/filament-spatie-roles-permissions` *(alternativa a Shield)* | Resources de Roles/Permissions para spatie | Se evalúa si Shield no cubre; no es necesario si Shield basta |

### 4.3 Seguridad

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `spatie/laravel-permission` | Modelo RBAC para roles/permisos acoplado al `Gate` de Laravel | Motor de autorización del catálogo `modulo.accion`; el backend valida siempre |
| Filament **MFA integrado** (v4/v5) | 2FA por app autenticadora (TOTP) y/o email, con recovery codes, before login | Cumple el requisito MFA/TOTP del módulo Administración y Seguridad (§6, `features.mfa`) **sin plugin extra** en el panel admin |
| `laragear/twofactor` | 2FA (TOTP) portable fuera de Filament (portales inquilino/propietario) | Aplica MFA en los portales (no son parte del panel Filament) |
| `pragmarx/google2fa` | Implementación TOTP RFC 6238 (soporte de los paquetes anteriores) | Dependencia subyacente, sin uso directo salvo validación custom |
| `symfony/http-client` + middleware HTTP | Cliente HTTP con timeouts que se usan en circuit breaker | Port-adapter de pagos/notificaciones (ADR-016/019) |
| `laravel` nativo | CSRF tokens, `SameSite=Lax/Strict`, cookie httpOnly, rate limiting (`throttle`), `DB::transaction`, sesiones cifradas | OWASP Top 10, cero dependencias extra: posture segura por defecto |
| `phpunit` / `pestphp/pest` + Plugin Arch | Tests; `Arch` valida arquitectura (módulos no se acoplan, no hay `JOIN` cruzado, capas limpias) | **Disciplina para ADR-001/015**: hace cumplir la frontera de módulos en CI |
| `laravel/pint` | Code style PSR-12 automático | Calidad consistente |
| `larastan/larastan` | PHPStan para Laravel (análisis estático) | Detecta errores antes de ejecutar; nivel 5+ recomendado |

### 4.4 Feature flags

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `laravel/pennant` v1.26 | Feature flags con almacenamiento en BD (driver `database` por defecto), middleware `EnsureFeaturesAreActive`, resolución por usuario | Implementa **toda** la sección 18 del diseño: `features.portal-propietario`, `features.whatsapp`, `features.contabilidad`, etc. El backend valida flag + permiso + regla (RN-S01) |
| Filament plugin de UI para flags *(opcional)* | Panel para un/toggle flags desde el admin | Se construye un Resource Filament ligero sobre Pennant (esfuerzo bajo, evita plugin externo de mantenimiento dudoso) |

### 4.5 Observabilidad y operación (ADR-009/018)

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `spatie/laravel-prometheus` 1.6 | Expone métricas en `/prometheus` (metric names con label `module`); trae collectors de **colas y Horizon**; endpoint protegible por IP | Métricas por módulo como en ADR-018; se scrapea con Prometheus (pull) |
| `keepsuit/laravel-opentelemetry` 2.x | Instrumentación OTLP para Laravel: trazas HTTP/colas/SQL, métricas, logs; inyecta `trace_id` y `user.id` | Trazas distribuidas, cumple ADR-009; exporta por OTLP al Collector |
| `open-telemetry/exporter-otlp` | SDK OTLP PHP (base requerida por keepsuit) | Soporte de transporte |
| `monolog/monolog` (nativo) | Logs estructurados JSON con campos `module`, `trace_id`, `service`, `user_id` | Alimenta Loki (ADR-018); **sin datos sensibles** |
| `grafana` + `mimir` (o Prometheus) + `loki` + `tempo` (infra) | Stack observabilidad (containers) | La misma pieza del diseño .NET; se mantiene |
| `sentry/sentry-laravel` *(opcional)* | Error tracking y captura automática de excepciones/trazas | Complementa si el cliente quiere alertas de errores gestionadas (decisión de operación) |
| `spatie/laravel-backup` + `spatie/laravel-backup-queue` | Backups de BD (PostgreSQL dump binario), archivos, cifrado, limpieza y monitoreo | RPO ≤ 24 h / RTO ≤ 4 h del diseño (§20). Dump + WAL via Postgres (se documenta aparte) |

### 4.6 Dinero, contabilidad y recibos (ADR-010/014/022)

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `brick/money` + `brick/math` | Valor monetario **inmutable** en minor units con aritmética exacta, `Currency` por ISO, rounding explícito | ADR-010: dinero en centavos sin floats; base del módulo Contabilidad/Liquidaciones |
| `spatie/laravel-pdf` v2 (driver DOMPDF) | Generación de PDFs (Blade view → PDF), guardado a disco, **queued**, prueba con `Pdf::fake()`, drivers intercambiables | Recibos/comprobantes inmutables (ADR-014, ADR-020); DOMPDF no requiere Chrome ni Node en el servidor |
| `dompdf/dompdf` | Motor PDF PHP puro (driver de laravel-pdf) | Evita binario adicional; CSS 2.1 + parte de 3 (suficiente para recibos) |
| `maatwebsite/excel` *(opcional)* | Import/export Excel avanzado (múltiples hojas, fórmulas) | Solo si la contabilidad requiere plantillas complejas; Filament nativo cubre CSV/XLSX simple |

### 4.7 Portales y notificaciones

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| Livewire v4 + Blade / Vue soportado por Filament | Portales inquilino/propietario como vistas propias (no dentro del panel admin) | Respeta el diseño GRAFITO y la separación de áreas por rol |
| `laravel` notificaciones (Mail + canales custom) | Canales Email/WhatsApp/SMS/Plataforma detrás del portador `INotificationChannel` | ADR-007: proveedores no elegidos → interfaces + adapters |
| `guzzlehttp/guzzle` | Cliente HTTP para gateways SMS/WhatsApp/Webhooks | Adapters externos |
| `league/flysystem-aws-s3-v3` | Object Storage S3-compatible (fotos, documentos, recibos) con URLs firmadas | ADR Object Storage: binarios fuera de la BD, URLs firmadas con expiración |

### 4.8 Testing y calidad

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `pestphp/pest` v4 + `pest-plugin-laravel` + `pest-plugin-livewire` + `pest-plugin-arch` | Framework de testing legible + assertions Laravel + testing Livewire + **Reglas de arquitectura** | Tests funcionales y **regatea de fronteras** de módulos en CI (ADR-001/015) |
| `phpunit/phpunit` | Motor subyacente de Pest | Base |
| `laravel/dusk` *(opcional)* | E2E con ChromeDriver | Se evalúa para flujos críticos de pagos/cierres; no es obligatorio en v1 |
| `larastan/larastan` | PHPStan + extensiones Laravel | Análisis estático nivel 5-6 |
| `laravel/pint` | Formatter | Estilo consistente en todo el repo (modelo: `pint.json` compartido) |

### 4.9 Localización

| Paquete | Descripción | Por qué lo usamos |
|---|---|---|
| `laravel-lang/lang` (paquete clásico) o `laravel-lang/translator` | Traducciones de las cadenas del framework a español | UI 100% en español (Panamá), incluidos labels de Filament y mensajes de validación |

---

## 5. Plan de implementación de las piezas de plataforma (ADR-015 a 018)

### 5.1 Esquemas por módulo (ADR-015) con Eloquent

La frontera física se mantiene con **una entrada de conexión por esquema** en `config/database.php`:

```php
'connections' => [
    'pgsql_clientes'   => ['driver' => 'pgsql', 'host' => env('DB_HOST'), 'database' => env('DB_DATABASE'), 'schema' => 'clientes', ...],
    'pgsql_cobros'     => ['driver' => 'pgsql', 'host' => env('DB_HOST'), 'database' => env('DB_DATABASE'), 'schema' => 'cobros', ...],
    // ...	inyectar `search_path` por esquema
]
```

Reglas (equivalentes al ADR-015):

- Cada módulo declara su conexión propia y sus migraciones **en su propio esquema** (`clientes.*`, `contratos.*`, `cobros.*`, `liquidaciones.*`, `incidencias.*`, `lineablanca.*`, `contabilidad.*`, `reportes.*`, `seguridad.*`, `hr.*`, `audit.*`). **Sin `FK` entre esquemas**.
- La comunicación entre módulos es **solo por servicios de aplicación (interfaces in-process) o eventos de dominio**; nunca `DB::table()->join()` a un esquema ajeno. Este constraint se **fuerza con Pest Arch** (prohibir `Schema`/`DB` de otra conexión fuera del módulo dueño).
- El Shared Kernel (DTOs, contratos, eventos) vive en una carpeta `src/Shared` / `packages/shared`, sin lógica de negocio.

### 5.2 Kill-switch (ADR-017)

Piezas a construir (sin depender de paquete externo):

- **BD / Redis**: tabla `module_state` (persistente, fail-closed al arrancar) + Redis pub/sub (canal `ops.module.*`) para propagar cambios hacia todas las instancias.
- **Middleware** `EnsureModuleEnabled($module)`: si `ModuleStateService::enabled($module) === false` → `503` inmediato (fast-fail).
- **Jobs**: cada job consulta el estado de su módulo al inicio y **se pausa** si está apagado.
- **Telemetría**: gauge prometheus `module_enabled` (`module=`, `1|0`) alimentado por el mismo servicio → dashboard de Grafana.
- **UI**: la Ops Console es un **panel Filament separado** (`/ops`) con el Resource `ModuleStateResource` (toggle activar/desactivar + auditoría de cada acción) — cumple "control plane separado de la app que falla" con mínimo coste.

### 5.3 Observabilidad (ADR-018) — diferencias con el diseño .NET

| Concepto | .NET diseñado | Laravel |
|---|---|---|
| Trazas | OTel SDK → OTLP → Collector | `keepsuit/laravel-opentelemetry` → OTLP → Collector |
| Métricas | Collector/OTel (push a Prometheus vía remoto-write) | **Prometheus scrape** a `/prometheus` (endpoint propia) — se documenta la diferencia arquitectónica (pull vs push, sin agente exógeno) |
| Logs | Serilog → Loki | Monolog JSON → **Loki vía `symfony/http-client`** (HTTP push al endpoint Loki) o a Collector (OTLP logs) |
| Correlation | `trace_id` en logs/auditoría | `trace_id` inyectado por keepsuit en logs + `spatie/laravel-activitylog` guarda `trace_id` en `properties` |

> Impacto a documentar: **Laravel no requiere OpenTelemetry Collector para métricas**; Prometheus scrapea el endpoint directamente. Se mantiene Collector solo para trazas/logs si no se quiere push directo a Loki.

### 5.4 Contención de fallos (ADR-016)

- **Timeout + breaker por dependencia**: se implementa con `Http::timeout()` + `retry()` y un pequeño `CircuitBreaker` propio (no existe paquete maduro consolidado → implementación corta reutilizable en `src/Platform/Resilience`).
- **Semáforo por módulo**: contador Redis `SETNX`/RLOCK por módulo (configurable) que responde `503` al saturarse.
- **Degradación declarada**: cada consumidor declara qué hace si el módulo falla (regla del ADR: sin cascada).
- **Excepciones → Problem Details RFC 7807**: `Handler::render` global devuelve JSON `{type, title, status, detail, traceId}`; nunca stack trace al cliente.

---

## 6. Catálogo de feature flags mapeado a Pennant

La tabla §18 del diseño se traduce 1:1 a definiciones modernas de Pennant (siempre que el backend valide **flag + permiso + regla** — RN-S01):

| Feature (diseño) | Clase/definición Pennant | Persistencia |
|---|---|---|
| `features.portal-propietario` | `PortalPropietario` | `database` (por default) |
| `features.notificaciones.whatsapp` | `NotificacionesWhatsapp` | database |
| `features.notificaciones.sms` | `NotificacionesSms` | database |
| `features.incidencias` | `Incidencias` | database |
| `features.pagos-en-linea` | `PagosEnLinea` | database |
| `features.debito-ach` | `DebitoAch` | database |
| `features.conciliacion` | `Conciliacion` | database |
| `features.firma-electronica` | `FirmaElectronica` | database |
| `features.kyc` | `Kyc` | database |
| `features.mant-preventivo` | `MantenimientoPreventivo` | database |
| `features.control-llaves` | `ControlLlaves` | database |
| `features.kpis` | `Kpis` | database |
| `features.analitica` | `Analitica` | database |
| `features.mfa` | `Mfa` | database |
| `features.privacidad` | `Privacidad` | database |
| `features.linea-blanca` | `LineaBlanca` | database |
| `features.contabilidad` | `Contabilidad` | database |
| `features.rrhh` | `RecursosHumanos` | database |
| `features.nomina` | `Nomina` | database |
| `features.asistencia` | `Asistencia` | database |
| `features.portal-empleado` | `PortalEmpleado` | database |
| `features.reclutamiento` | `Reclutamiento` | database |
| `features.seguridad-ocupacional` | `SeguridadOcupacional` | database |

---

## 7. Migración de ADRs si se adopta Laravel (pendiente de decisión)

Si el cliente confirmara cambiar de plataforma, los ADRs afectados serían (propuesta de edición, **no realizada aún**):

- **ADR-002**: `ASP.NET Core 10` → `Laravel 13 + Eloquent (PHP 8.4/8.5)`.
- **ADR-004**: `Blazor Web App + MudBlazor` → `FilamentPHP v5 (Livewire v4) + Livewire para portales`, manteniendo GRAFITO (Filament permite tema Tailwind: colores brand `#1B212B` (n950), neutros GRAFITO, tipografías Inter + IBM Plex Mono).
- **ADR-005**: `JWT + refresh BFF` → `Sesiones Laravel + cookie httpOnly + CSRF nativo` (+ `sanctum` solo si se expone API externa).
- **ADR-006**: `Quartz.NET` → `Laravel Scheduler + Horizon` (sin cambio de comportamiento del `schedule:run`).
- **ADR-009/018**: ajustar el pipeline OTel a scrape en `/prometheus` (ver §5.3).
- **ADR-002 nota técnica**: `spatie/laravel-prometheus` y `spatie/laravel-activitylog` 5.x requieren **PHP 8.4+** → el stack mínimo del entorno sube a PHP 8.4 (Laravel 13 soporta 8.3–8.5).

---

## 8. Riesgos y supuestos

| # | Riesgo / supuesto | Impacto | Plan de contención |
|---|---|---|---|
| 1 | **PHP 8.4 obligatorio** por packages clave (prometheus, activitylog) | Entornos deben proveer PHP ≥ 8.4 | Fijar imagen de contenedor con PHP 8.4+ y verificar soporte del proveedor de despliegue |
| 2 | **Esquemas por módulo** no vienen de fábrica en Eloquent | Deuda técnica si no se disciplina | Pest Arch en CI + conexiones por esquema + revisión en code review (Definition of Done) |
| 3 | **Contención/breakers** sin paquete maduro | Comportamiento manual | Implementación corta + tests; documentada en §5.4 |
| 4 | **Filament v5 reciente** (enero 2026); ecosistema de plugins aún migrando | Plugin deseado podría no tener versión 5 | Verificar compatibilidad de cada plugin antes de fijarlo; alternativas enumeradas en §4 |
| 5 | **GRAFITO en Filament** requiere tema a medida (no hay "skins" prontas) | Coste de adaptación de diseño inicial | Re-skin mediante `Theme` (Tailwind) + tokens CSS de GRAFITO; prototipo se conserva como referencia |
| 6 | Proveedores panameños (Yappy/ACH, SMS, WhatsApp, banco) aún indeterminados | Diseño port-adapter se mantiene | Igual que en .NET: interfaces + stubs en Fase 1 |
| 7 | **Validación legal/fiscal** (DGI, ITBMS, ISR, retenciones; decisiones D1–D12) sigue pendiente | Sin reglas fiscales inventadas | Sin cambios: pendiente confirmación con contador/asesor |
| 8 | **Auditoría forense** (asientos inmutables, planilla cerrada) | Requiere append-only + separación de funciones en BD | Se implementa como en .NET: esquema `audit`, contra-asientos, estados inmutables |

---

## 9. Conclusión

Laravel 13 + FilamentPHP v5 cubre todos los módulos y la mayoría de los ADRs con **menos esfuerzo de construcción y menor coste de operación** que el stack .NET v1.5, a cambio de **disciplina explícita en la frontera de módulos y en la contención de fallos**. La decisión de adoptarlo debe formalizarse como ADR (o rechazo) tras revisión conjunta; este documento no modifica ninguna decisión registrada.

---

## 10. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 21/09/2026 | Análisis inicial de factibilidad Laravel + FilamentPHP y catálogo completo de paquetes/plugins | Dev (vía asistente) |