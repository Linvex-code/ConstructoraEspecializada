# Análisis del proyecto — soporte de la presentación GRAFITO

Este documento resume el análisis documental usado para construir la presentación
`docs/presentacion/index.html`. Es un insumo de trabajo y trazabilidad.

## Project brief

- **Nombre:** GRAFITO — Plataforma de Administración de Inmuebles, Portales y Contabilidad (Panamá).
- **Resumen ejecutivo:** un monolito modular (una sola aplicación desplegable con fronteras por módulo) para administrar el portafolio de alquileres de una PYME panameña (~400 unidades, ~2,500 pagos/mes): clientes, inmuebles, contratos, cobros con recibos descargables, liquidaciones, incidencias, línea blanca, notificaciones multicanal, calendario, contabilidad panameña completa, reportes, administración con roles dinámicos/permisos fijos y portal del inquilino.
- **Problema de negocio:** información dispersa (SharePoint/hojas de cálculo), cobros y mora manuales, sin comprobantes auditables ni historial trazable, contabilidad sin soporte de sistema, riesgos legales/fiscales panameños (DGI, Ley 81/2019, ITBMS).
- **Solución propuesta:** una plataforma con 3 áreas (Admin `/app/*`, Portal Inquilino `/portal/inquilino/*`, Portal Propietario `/portal/propietario/*` en discusión), 11 módulos + portal, seguridad desde el diseño (RBAC, BFF JWT, IDOR, cifrado, auditoría).
- **Usuarios:** empleados por rol (Admin, Gerente, Contador, Cobros/Finanzas, Operaciones/Mantenimiento, Soporte, Solo lectura) + inquilinos (portal) + propietarios (futuro).
- **Stack confirmado:** ASP.NET Core 10 + Blazor Web App/MudBlazor + YARP + PostgreSQL 17 + Redis + S3-compatible + OpenTelemetry/Grafana/Loki + Quartz.NET.
- **Alcance cotizado:** Fases 0–3. **Excluido:** portal propietario (F4), facturación electrónica DGI, multi-empresa/multi-moneda, WhatsApp (contingente), migración de datos históricos (servicio aparte).
- **Esfuerzo estimado (PERT):** 6,943 horas · duración recomendada 9–11 meses · equipo 4–5 personas (escenario recomendado; acelerado 7–8 meses; conservador 12–13).

## Fuentes consultadas

| Documento | Uso |
|---|---|
| `docs/diseno-arquitectura.md` (v1.3) | Arquitectura C4, bounded contexts, esquemas, seguridad, ADRs, plan por fases, supuestos |
| `docs/modulo-contabilidad.md` (v1.0) | Diseño funcional contable detallado (sintetizado) |
| `docs/adr-aislamiento-modulos-killswitch.md` | ADR-015..018: aislamiento, kill-switch, observabilidad por módulo |
| `docs/modulos/README.md` + 11 docs de módulos | Módulos, permisos, RF, dependencias |
| `docs/ui/diseno-ui-design-system.md` (v1.7) + `tokens.css` | Identidad GRAFITO, tokens, componentes, accesibilidad |
| `docs/ui/requerimientos-modulos.md` (v0.1) | Decisiones D1–D12, permisos `[P]` |
| `docs/diseno-arquitectura.md` (§25) | Plan por fases y dependencias; pendientes (migración de datos) |
| `ui/prototipo-demo.html` + capturas | Evidencia visual (dashboard, clientes, inmuebles, cobros, contratos, contabilidad) |

## Mapa de módulos (con fase)

- **F0:** Administración y Seguridad.
- **F1:** Clientes, Inmuebles, Contratos, Cobros, Liquidaciones, Portal Inquilino (base).
- **F2:** Incidencias, Línea Blanca, Notificaciones + Calendario, Reportes (operativos).
- **F3:** Contabilidad (plan, asientos, cierres, conciliación, impuestos, activos, EF) y Reportes financieros.

## Prioridades (derivadas del plan por fases)

Alta: Administración y Seguridad, Clientes, Inmuebles, Contratos, Cobros, Liquidaciones, Portal Inquilino, Contabilidad (F3, mayor complejidad, validación CPA previa).
Media: Incidencias, Línea Blanca, Notificaciones + Calendario, Reportes.

## Nota sobre migración de SharePoint (decisión del usuario)

- La data que mantiene el cliente en **SharePoint puede migrarse**, pero **requiere una revisión y análisis por aparte**.
- **No se tiene contemplada una manera más automatizada** en el alcance actual (el diseño asume entrega de datos normalizados o captura desde cero).
- Se recomienda dimensionarlo como **servicio aparte** (bolsa de horas o contrato propio) y coordinar la revisión de datos al inicio para nivelar con la Fase 1.

## Pendientes / supuestos para validar antes de la presentación final

- Validación CPA (plan de cuentas, NIIF vs NIIF PYMES, tasas ISR/ITBMS/retenciones, ITBMS del arrendamiento).
- Validación legal (marco de arrendamiento, retención documental 10 años, Ley 81/2019).
- Confirmación de ciudad principal y proveedores (correo, SMS, WhatsApp, almacenamiento).
- Cierre de decisiones D1–D12 (reglas de negocio).
- Definición de responsable de hosting/producción y SLA.
- Cifras comerciales (costos, precios y modelo de contratación) no se muestran y no forman parte de este repositorio por decisión del equipo.