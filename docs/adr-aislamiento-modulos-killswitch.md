# ADR 015–018 — Aislamiento de módulos, kill-switch y control plane (Backend)

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Aprobado como diseño de referencia (pendiente de construcción) |
| **Documento base** | `docs/diseno-arquitectura.md` (v1.1) — sección 22, ADR-001 a 014 |
| **Documentos relacionados** | `docs/requerimientos-modulos.md` (v0.1) · `docs/ui/requerimientos-modulos.md` (v0.1) |

---

## Resumen ejecutivo

Objetivo del conjunto de decisiones: **que un fallo crítico de un módulo quede confinado, visible y apagable desde una plataforma separada, sin tumbar la aplicación completa**, todo dentro de un **monolito modular** (un solo despliegue) y con una **ruta de escape mecánica** hacia microservicios únicamente si el tráfico de un módulo lo justifica.

Nivel de aislamiento aceptado explícitamente: **aislamiento de frontera y contención en proceso**. Se reconoce y documenta que el **aislamiento de proceso completo** (un módulo se cae y el resto no se entera, sin afectación de CPU/memoria) **no es posible en un monolito** y solo se obtiene extrayendo el módulo a un servicio propio.

```
┌────────────────────────────┐      ┌─────────────────────────────┐
│  MAIN HOST (monolito)      │      │  OPS CONSOLE (servicio      │
│  ApartmentAdmin.Host       │      │  mínimo separado)           │
│  · Módulos registrados     │      │  · Registro de módulos      │
│  · ModuleStateService      │◄────►│  · Kill-switch (act./des.)   │
│  · filtro fast-fail 503    │ pub/  │  · Estado de salud          │
│  · jobs que se pausan      │ sub   │  · Acceso logs (Loki)      │
└─────────────┬──────────────┘      └────────────┬───────────────┘
              │                                  └──► Redis (estado)
              ▼                                       + DB (persistencia)
    PostgreSQL (esquema por módulo)
              │
              ▼
    OpenTelemetry Collector ─► Prometheus (métricas) / Loki (logs) / Grafana
```

---

## ADR-015 — Límites de frontera por módulo (esquema, contrato, prohibición de acoplamiento transversal)

### Contexto
El monolito modular ya fue decidido (ADR-001). Para que un módulo pueda fallar y ser apagado **sin cascada**, sus límites deben ser físicos y no solo "recomendaciones de buena práctica".

### Problema
Si los módulos comparten tablas, DbContexts o referencias internas, un error en el módulo Cobros puede corromper el estado, lentificar o bloquear a otros módulos, y la extracción a microservicio futuro sería un refactor masivo.

### Opciones
1. **Esquema por módulo + Shared Kernel mínimo** *(decidida)*.
2. Un solo esquema con prefijos de tabla por módulo (culpa compartida, sin extracción limpia).
3. Microservicios de entrada (rechazada: sobre-ingeniería para ~400 inmuebles, ADR-001).

### Decisión
- **Cada módulo es dueño de sus tablas en su propio esquema PostgreSQL** (`clientes.*`, `contratos.*`, `cobros.*`, `liquidaciones.*`, `incidencias.*`, `lineablanca.*`, `contabilidad.*`, `reportes.*`, `seguridad.*`). **Sin FK entre esquemas.**
- **Shared Kernel mínimo**: solo primitivos, contratos (interfaces), DTOs y eventos. Sin lógica de negocio.
- **Comunicación entre módulos exclusivamente por contrato** (interface in-process) o por eventos de dominio. Ningún módulo referencia el `Infrastructure`/`Domain` concreto de otro.
- Regla de soberanía: accesos cruzados por `IConsultaDeX` (servicio de aplicación del módulo dueño), nunca `JOIN` directo ni DbContext ajeno.

### Consecuencias
- Los fallos por dependencia dejan de propagarse (Reportes no "cae" porque Cobros tiene un error de SQL: Reportes llama por contrato y degrada).
- Las migraciones de un módulo afectan solo su esquema.
- El esquema aislado es la base física para extraer el módulo a servicio (ver ADR-018).

### Implicaciones de seguridad
- Las restricciones de datos del módulo (unicidad, integridad referencial lógica) se validan por su propio Application Service; no hay "rígidez" que otro módulo pueda saltarse vía SQL transversal.

### Implicaciones operativas
- Introducir una consulta multi-módulo exige definir el módulo líder de la transacción (ADR-008) o un contrato de agregación. Cuesta más que un JOIN directo — costo aceptado conscientemente.

### Alternativas rechazadas
- Esquema único con prefijos: imposibilita extracción y degrada la soberanía.
- Microservicios desde el día uno: sobre-ingeniería, transacciones de dinero distribuidas (ADR-001).

---

## ADR-016 — Contención de fallos en proceso (bulkheads, timeouts, circuit breakers, jobs aislados, degradación)

### Contexto
En un solo proceso, un módulo con comportamiento criminal (lentitud, errores, saturación) puede degradar al resto si no hay contención.

### Problema
"El módulo X está fallando" no debe traducirse en "toda la app responde lento o da 500".

### Opciones
1. **Contención por módulo** (semáforos, breakers, timeouts, jobs aislados, degradación) *(decidida)*.
2. Confiar en la buena fe del código y el manejador global de excepciones (demasiado débil).
3. Procesos separados por módulo (rechazada: es microservicios).

### Decisión
- **Bulkhead por módulo**: cada módulo tiene un límite de concurrencia configurable (semáforo). Al saturarse responde `503`/cola acotada inmediatamente, **sin vaciar el threadpool** común.
- **Timeout + circuit breaker por dependencia**: toda llamada de un módulo a otro módulo o a un servicio externo (API de proveedor, Email, SMS, storage) pasa por cliente HTTP/producto resilience con timeout y breaker propio (estados abierto/medio-cerrado/cerrado).
- **Jobs aislados**: cada módulo registra sus `IHostedService` con bandera de activación y captura de errores independiente. El cierre contable fallando no detiene los avisos de visitas.
- **Degradación declarada**: cada consumidor de un módulo declara "si este módulo falla, hago X" (ocultar widget, mostrar aviso, bucket vacío). **Regla: ningún consumidor encadena fallos (no cascada).**
- **Manejo global de excepciones por request**: excepción sin manejar → `ProblemDetails` genérico + `traceId`, telemetría de error; no se propaga detalle interno (nunca stack trace al cliente).

### Consecuencias
- Un módulo lento/errando degrada **solo a sí mismo y a sus consumidores directos**, que degradan limpio.
- Coste: instrumentación de bulkhead/breaker por módulo; configuración de umbrales.
- La contención no cubre fallos fatales de proceso (OOM, crash nativo); eso queda fuera del alcance del monolito (ver ADR-017, kill-switch actúa antes de llegar a fatal, y Docker reinicia el proceso si ocurre).

### Implicaciones de seguridad
- Evita efecto "avalancha" (thundering herd) hacia Postgres por parte de un módulo caído.
- Los mensajes de error internos jamás llegan al cliente (no info disclosure).

### Implicaciones operativas
- Umbrales configurados por módulo en configuración tipada; observables por métrica (semáforo saturado, breaker abierto).

### Alternativas rechazadas
- Confiar solo en try/catch global (no contiene lentitud ni saturación).
- Procesos separados por módulo (microservicios prematuros).

---

## ADR-017 — Kill-switch remoto: control plane separado (Ops Console) + estado persistente + fast-fail

### Contexto
Requisito operativo: *desde una plataforma separada, desactivar un módulo con error crítico para que no aparezca, revisar sus logs, corregir y reactivar.* El interruptor **no puede vivir dentro de la aplicación que falla**.

### Problema
Si la app está caída o colgada, un interruptor incrustado es inalcanzable. Además, el estado del interruptor no debe perderse si el proceso o Redis se reinician.

### Opciones
1. **Control plane separado (Ops Console) + estado en Redis + persistencia en DB + pub/sub + filtro fast-fail** *(decidida)*.
2. Interruptor embebido en la app (inalcanzable si la app cae) — rechazada.
3. Docker pause/stop del contenedor (afecta TODA la app, no un módulo) — rechazada para el caso módulo.

### Decisión
- **Ops Console = servicio mínimo separado** (API + UI simple), fuera del host principal, con acceso de solo administradores, lectura del registro de módulos, escritura del estado y acceso a logs/métricas.
- **Registro de módulos** (`ModuleInfo`): `{ id, nombre, version, dependeDe[], esquema, endpoints, widgetId }`.
- **Estado `module_state:{id} = enabled|disabled`**: escrito por Ops, **en Redis (efímero, para publicación) + en DB de Ops (fuente de verdad persistente)**. Al arrancar o ante indisponibilidad de Redis, el host lee de la DB → **fail-closed** (estado desconocido = disabled/no activar).
- **Propagación**: pub/sub de Redis (cambio inmediato) y TTL corto (~5–10 s) como respaldo local en cada host.
- **Fast-fail**: `ModuleAvailabilityFilter` por módulo (atributo/metadata en ensamblado) — ejecuta antes de cualquier endpoint: si `disabled` → `503 { module, traceId, timestamp }` sin tocar BD ni CPU.
- **Efectos al desactivar** (orquestados por el mismo registro):
  - Endpoints del módulo → `503` inmediato; router no expone rutas del módulo (menor superficie).
  - Jobs de fondo del módulo → pausados (`ModuleJobScheduler` verifica bandera antes de ejecutar).
  - Widgets del dashboard → desaparecen (la composición del Resumen y el menú se alimentan del mismo estado: módulo desactivado = no se ofrece, aunque el usuario tenga permiso).
  - Consumidores → reciben `ModuleDisabledException` disciplinada, breaker se abre, degradación declarada (ADR-016).
- **Flujo de reactivación**: corregir → desplegar (una sola imagen del monolito) → verificar → Ops "ACTIVAR" → pub/sub → fast-fail se retira → auto-recuperación. **Sin reiniciar el host, sin downtime.**
- **Auditoría**: toda acción de Ops (quién desactivó/reactivó, cuándo, por qué) se registra en auditoría de seguridad.

### Consecuencias
- Cumple el requisito "apagar desde otra plataforma" incluso si la app está degradada.
- Coste: un servicio extra mínimo (Ops), un registro por módulo, un filtro por request (microsegundos) y chequeos de estado.
- El dashboard "desaparece" el módulo de forma natural (coherencia frontend/backend por el mismo estado, no por lógica duplicada).

### Implicaciones de seguridad
- **Fail-closed**: nunca reactivar por accidente; estado desconocido = desactivado.
- Ops Console es vector crítico: autenticación fuerte, mínimo privilegio, solo red interna, auditoría de acciones, alerta al desactivar módulos.
- La desactivación NO elimina permisos (RN-S01: `flag + permiso`), simplemente deja de ofrecer el módulo hasta que el flag vuelva.

### Implicaciones operativas
- El operador debe conocer `dependeDe[]` para saber el impacto al desactivar (dependientes degradan).
- Alarma/monitor cuando un módulo pasa a disabled (evita loops "apagado olvidado").

### Alternativas rechazadas
- Interruptor embebido (inalcanzable si la app cae).
- Docker pause del contenedor (afecta todo el host, no un módulo).
- Estado solo en Redis (perdida al reiniciar → reactivación accidental).

---

## ADR-018 — Observabilidad por módulo + evolución mecánica a microservicio

### Contexto
Para "revisar los logs de ese módulo y ver qué pasó" y para decidir cuándo un módulo merece salir del monolito, la telemetría y las fronteras ya deben existir desde el día uno.

### Problema
Sin labels por módulo, diagnosticar "qué falló en Cobros" implica bucear entre todos los logs; sin esquema/contrato propios, extraer un módulo es refactor.

### Decisión
- **Logs estructurados con `module` como label de Loki** (además de `environment`, `operation`, `trace_id`). Filtro rápido: `{module="cobros"} |= "error"`.
- **Métricas por módulo en Prometheus**: `{modulo}_requests_total`, `{modulo}_error_rate`, `{modulo}_latency_p95`, estado del breaker, semáforo saturado, `module_enabled 1|0`.
- **Traces** con atributo `module.name` (OpenTelemetry); correlación `traceId` con Auditoría (ADR-009).
- **Health checks por módulo**: `/health/live`, `/health/ready` agregado, y `/health/ready/{modulo}` individual (incluye estado `disabled|healthy|degraded`).
- **Extracción a microservicio cuando un módulo lo JUSTIFIQUE por métrica** (p99 alto, CPU, necesidad de despliegue/escalado independiente). Procedimiento mecánico porque las fronteras ya existen:
  1. Extraer el proyecto a su propio host.
  2. Sustituir la llamada in-process por contrato HTTP/gRPC/message (la interface no cambia).
  3. Mover el esquema a su propia conexión (ya es propio).
  4. Exponer sus endpoints en el gateway.
  5. Mantener registro/estado y observabilidad (ya son por módulo).
- **Regla anti-moda**: no se extrae por modernidad; se extrae por medición (tráfico, latencia, escalado, cadencia de despliegue).

### Consecuencias
- Diagnóstico = una query de Loki + un dashboard de Grafana por módulo.
- La extracción a microservicio pasa de "refactor gigante" a "semanas" de trabajo mecánico.
- Nada se construye de más por ahora: Ops es pequeño, el registro es dato, el filtro es un middleware.

### Implicaciones de seguridad
- Caché de datos de un módulo (si aplica) siempre con contexto de permisos del solicitante; aun con el módulo desactivado no debe leerse su caché para mostrarla.

### Implicaciones operativas
- Dashboards por módulo en Grafana; SLOs por módulo (error rate, latencia) con alertas.
- Despliegue del monolito = una imagen; la Ops Console y el almacenamiento de estado tienen vida propia (compose/CI separados).

### Alternativas rechazadas
- Observable solo a nivel app (diagnóstico ambigüo).
- Extraer microservicios preventivamente (sobre-ingeniería, ADR-001).

---

## Walkthrough operativo (escenario end-to-end)

1. Cobros empieza a tirar `5xx` por un defecto crítico.
2. Alerta de Grafana: `cobros_error_rate` por encima de SLO.
3. Operador entra a Ops Console → registro: `cobros → DEGRADADO`. Pulsa **DESACTIVAR** (con motivo, queda auditado).
4. Ops escribe `module_state:cobros=disabled` (Redis + DB), publica el cambio.
5. Hosts actualizan su `ModuleStateService` (TTL ≤ 10 s) → Cobros OFF.
6. A partir de ahí: endpoints de Cobros → `503 fast-fail`; sus jobs pausados; widgets del dashboard ocultos; consumidores degradan limpio (Reportes avisan "mora no disponible"). **El resto de la app sigue al 100%.**
7. Operador revisa los logs: `{module="cobros"} |= "ERROR"` en Loki; correlaciona con trazas y el `traceId` del fallo.
8. Corrige el defecto, valida en staging, despliega la imagen del monolito.
9. Operador pulsa **ACTIVAR** → pub/sub → fast-fail se retira → Cobros atiende. Sin reinicio, sin downtime.
10. La auditoría de Ops registra desactivación/activación completas.

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Fallo fatal de proceso (OOM, crash nativo) no confinable en monolito | Reinicio de toda la app | Kill-switch + contención previenen la mayoría de fallos "normales"; Docker `restart` recupera rápidamente; la extracción por métrica (ADR-018) es el plan si la frecuencia de fallos fatales se vuelve relevante |
| Apagar un módulo degrada a dependientes | Funcionalidad cruzada reducida | `dependeDe[]` visible en Ops; degradación declarada en consumidores; alerta de impacto |
| Ops Console comprometida | Apagado/activado malicioso de módulos | Red interna, MFA, mínimo privilegio, auditoría, alertas |
| "Apagado olvidado" | Módulo out por error humano | Monitor de `module_enabled = 0` con alerta y responsable |
| Estado del módulo no sincronizado | Comportamiento inconsistente | TTL corto + pub/sub + fail-closed al arrancar |

---

## Referencias
- `docs/diseno-arquitectura.md` — ADR-001 (monolito modular), ADR-008 (transacciones), ADR-009 (observabilidad), ADR-011 (permisos).
- `docs/ui/requerimientos-modulos.md` — catálogo de módulos, permisos y reglas de negocio por módulo.
- `docs/requerimientos-modulos.md` — *¿Referencia alternativa?* El catálogo de módulos de producción vive en la UI; los flujos de backend se detallan en los ADR y en los contratos de cada módulo.

---
*Conjunto de decisiones de arquitectura de backend v1.0. En línea con ADR-001 a 014; los ADR-015 a 018 se registran también en `docs/diseno-arquitectura.md` sección 22.*