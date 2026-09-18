---
theme: default
title: Constructora Especializada · Administración de Inmuebles, Portales y Contabilidad
info: |
  ## Constructora Especializada — Diseño de solución
  Plataforma de administración de inmuebles, portales y contabilidad para Panamá.
  Elaborado a partir de docs/diseno-arquitectura.md, docs/ui/diseno-ui-design-system.md,
  docs/ui/requerimientos-modulos.md y el prototipo validado.
author: Ingeniería de producto
keywords: inmuebles, alquileres, contabilidad, panamá, grafito, rol, permisos
aspectRatio: '16/9'
fonts:
  sans: Inter
  mono: IBM Plex Mono
transition: slide-left
highlighter: shiki
drawings:
  persist: false
---

<div class="g-cover g-cover-canvas">
  <div class="g-mark">CE</div>
  <div class="g-cover-kicker">Constructora Especializada · Diseño de solución</div>
  <h1>Administración de Inmuebles,<br>Portales y Contabilidad</h1>
  <p class="g-cover-sub">Plataforma integral para la gestión del portafolio de alquileres en Panamá — operación, cobro, portales y contabilidad en un solo lugar.</p>
  <div class="g-cover-meta">
    <span class="g-chip-dark">11 módulos</span>
    <span class="g-chip-dark">3 áreas</span>
    <span class="g-chip-dark">USD / Balboa</span>
    <span class="g-chip-dark">Panamá</span>
  </div>
</div>

<!--
Portada de la presentación: identidad GRAFITO, neutral y formal. Presentación del diseño de solución
para la plataforma de administración de inmuebles, portales y contabilidad en Panamá.
-->

---

## Agenda

<div class="g-kicker">Diseño de solución · 4 partes</div>

<div class="g-grid g-two" style="gap:36px">
  <div>
    <div class="g-ag-group">Parte 01 · El problema y la oportunidad</div>
    <ul class="g-agenda">
      <li><span class="g-ag-num">01</span>Contexto y problemática actual</li>
      <li><span class="g-ag-num">02</span>Objetivos y solución propuesta</li>
    </ul>
    <div class="g-ag-group">Parte 02 · La solución en detalle</div>
    <ul class="g-agenda">
      <li><span class="g-ag-num">03</span>Mapa de módulos y portales</li>
      <li><span class="g-ag-num">04</span>Núcleo del negocio (F1)</li>
      <li><span class="g-ag-num">05</span>Operación (F2) y Contabilidad (F3)</li>
      <li><span class="g-ag-num">06</span>Portal inquilino y administración de acceso</li>
      <li><span class="g-ag-num">07</span>Experiencia de usuario · Constructora Especializada</li>
    </ul>
  </div>
  <div>
    <div class="g-ag-group">Parte 03 · Arquitectura y seguridad</div>
    <ul class="g-agenda">
      <li><span class="g-ag-num">08</span>Arquitectura técnica</li>
      <li><span class="g-ag-num">09</span>Seguridad y cumplimiento</li>
    </ul>
    <div class="g-ag-group">Parte 04 · Alcance y plan</div>
    <ul class="g-agenda">
      <li><span class="g-ag-num">10</span>Alcance del proyecto</li>
      <li><span class="g-ag-num">11</span>Plan por fases y prioridades</li>
      <li><span class="g-ag-num">12</span>Migración de datos</li>
      <li><span class="g-ag-num">13</span>Decisiones y próximos pasos</li>
    </ul>
  </div>
</div>

<!--
Agenda en cuatro partes: el problema, la solución (módulos y UX), arquitectura y seguridad,
y finalmente alcance, plan y decisiones pendientes.
-->

---
layout: center
class: g-section
---

<div class="g-sec-num">01</div>
<div class="g-kicker">Parte 01</div>
<h1>El problema</h1>
<p>La situación actual del negocio y por qué formalizar la operación de inmuebles.</p>

---

## Contexto y problemática

<div class="g-kicker">El problema · situación actual</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Situación actual</div>
    <ul class="g-checks">
      <li>Información dispersa en <strong>SharePoint, hojas de cálculo</strong> y comunicaciones por correo/WhatsApp.</li>
      <li>Cobros y control de mora <strong>manuales</strong>: sin comprobantes ni historial auditable.</li>
      <li>Sin una fuente de verdad única para clientes, inmuebles y contratos.</li>
      <li>Riesgo legal y fiscal creciente con el crecimiento del portafolio.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Por qué esto importa</div>
    <ul class="g-checks">
      <li>Sin formalidad en los cobros es difícil <strong>respaldar ingresos</strong> y tomar decisiones.</li>
      <li>La <strong>Ley 81 de 2019</strong> (datos personales) y el marco fiscal de la <strong>DGI</strong> exigen trazabilidad.</li>
      <li>La operación depende de personas: alquileres, incidencias y mantenimientos sin seguimiento.</li>
    </ul>
  </div>
</div>

<div class="g-grid g-three" style="gap:12px;margin-top:18px">
  <div class="g-fact">≈ 400 unidades · portafolio administrado</div>
  <div class="g-fact">≈ 2,500 pagos / mes · flujo de cobro</div>
  <div class="g-fact">3 áreas · admin · inquilino · propietario</div>
</div>

<!--
El negocio administra un portafolio inmobiliario en Panamá: la información vive en SharePoint y hojas,
los cobros y la mora se controlan de forma manual y no existen comprobantes auditables. El volumen es
aprox. 400 unidades y 2,500 pagos mensuales.
-->

---

## Objetivos y solución

<div class="g-kicker">El problema · objetivos del proyecto</div>
<p class="g-sub">Unificar la operación y formalizar el flujo de dinero.</p>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Centro de control operativo</div>
    <ul class="g-checks">
      <li>Clientes, inmuebles y contratos con <strong>dato de verdad único</strong>.</li>
      <li>Cobros con <strong>recibos y comprobantes PDF auditables</strong> por período.</li>
      <li>Incidencias, visitas y mantenimientos con seguimiento completo.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Formalidad y cumplimiento</div>
    <ul class="g-checks">
      <li>Contabilidad panameña integrada: plan de cuentas, asientos y estados financieros.</li>
      <li>Base para cumplir <strong>Ley 81/2019</strong> y el marco fiscal <strong>DGI</strong>.</li>
      <li>Moneda exacta (centavos, sin errores de redondeo) en toda la plataforma.</li>
    </ul>
  </div>
</div>

<div class="g-note g-blue" style="margin-top:16px">
  <strong>Principios rectores:</strong> «el dato manda» · seguridad validada siempre en el backend · comprobantes inmutables · trazabilidad y auditoría de acciones críticas.
</div>

<!--
La solución propone un solo sistema con tres áreas: administración (empleados), portal del inquilino y
portal del propietario. Formaliza el cobro con comprobantes PDF auditables y prepara el terreno para el
cumplimiento normativo panameño.
-->

---
layout: center
class: g-section
---

<div class="g-sec-num">02</div>
<div class="g-kicker">Parte 02</div>
<h1>La solución</h1>
<p>Módulos, portales y la experiencia del usuario.</p>

---

## Mapa de módulos

<div class="g-kicker">11 módulos con límites estrictos · 1 despliegue</div>

<div class="g-grid g-three" style="gap:10px">
  <div class="g-mod"><span class="g-dot g-dot-f0"></span>Administración y Seguridad<span class="g-ph">F0</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f1"></span>Clientes<span class="g-ph">F1</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f1"></span>Inmuebles<span class="g-ph">F1</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f1"></span>Contratos<span class="g-ph">F1</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f1"></span>Finanzas · cobros y liquidaciones<span class="g-ph">F1</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f2"></span>Operaciones · incidencias y visitas<span class="g-ph">F2</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f2"></span>Línea Blanca<span class="g-ph">F2</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f2"></span>Notificaciones + Calendario<span class="g-ph">F2</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f3"></span>Contabilidad<span class="g-ph">F3</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f3"></span>Reportes &amp; Analytics<span class="g-ph">F2/F3</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f0"></span>Auditoría<span class="g-ph">Transv.</span></div>
  <div class="g-mod"><span class="g-dot g-dot-f0"></span>Identity · usuarios y roles<span class="g-ph">F0</span></div>
</div>

<div class="g-note g-green" style="margin-top:14px;padding:9px 14px">
  <strong>Portales:</strong> Administración <span class="g-mono">/app/*</span> · Inquilino <span class="g-mono">/portal/inquilino/*</span> · Propietario <span class="g-mono">/portal/propietario/*</span> <span class="g-chip g-chip-med">en discusión · F4</span>
</div>

<!--
Once módulos con límites estrictos y esquemas de base de datos propios (monolito modular). La fase indica
cuándo se construye cada módulo según el plan por fases. El portal del propietario es F4 y está en discusión.
-->

---

## Núcleo del negocio (F1)

<div class="g-kicker">Módulos F1 · lo esencial para operar el portafolio</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Clientes</div>
    <ul class="g-checks">
      <li>Personas/empresas: inquilino, propietario o ambos; contactos, empleo, documentos y cuentas.</li>
      <li>Consentimientos de datos personales <strong>Ley 81 de 2019</strong>.</li>
      <li>Estado <strong>Mora</strong> derivado automáticamente de los cobros; cambios de estado gestionados con confirmación.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Inmuebles</div>
    <ul class="g-checks">
      <li>Atributos enriquecidos (metros, habitaciones, baños, parking, pisos) y <strong>fotografías</strong>.</li>
      <li>Ciclo de vida: disponible → reservado → alquilado → mantenimiento; <strong>exclusividad de ocupación</strong>.</li>
      <li>Historial de estados, incidencias y equipos asociados.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">3</span>Contratos</div>
    <ul class="g-checks">
      <li>Arrendamiento (canon, garantía, ITBMS) y administración (comisión).</li>
      <li><strong>Snapshot económico</strong> para no alterar liquidaciones históricas.</li>
      <li>Contrato firmado obligatorio en arrendamiento (PDF, máx. 10&nbsp;MB, URL firmada).</li>
      <li>Renovación, terminación con prorrateo y devolución de garantía.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">4</span>Cobros y liquidaciones</div>
    <ul class="g-checks">
      <li>Generación masiva de recibos por período (unicidad contrato × período).</li>
      <li>Mora automática por vencimiento; pago → <strong>comprobante PDF inmutable</strong>.</li>
      <li>Liquidación a propietarios: ingreso cobrado − comisión.</li>
      <li>Cada pago genera el <strong>asiento contable borrador</strong> pendiente de aprobación.</li>
    </ul>
  </div>
</div>

<!--
El núcleo de la fase 1 cubre el ciclo de dinero esencial: clientes, inmuebles, contratos y cobros con
liquidaciones. Reglas clave: exclusividad de ocupación, snapshot económico en contratos, contrato firmado
obligatorio y comprobantes PDF inmutables que disparan asientos contables.
-->

---

## Operación (F2)

<div class="g-kicker">Módulos F2 · control operativo y comunicación</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Incidencias y visitas</div>
    <ul class="g-checks">
      <li>Reporte desde el portal o la administración, con categoría y urgencia.</li>
      <li>Workflow: reportada → presupuesto → asignada → en ejecución → cerrada.</li>
      <li>Timeline <strong>append-only</strong> (historial inmutable y auditable) y SLA por urgencia.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Línea Blanca</div>
    <ul class="g-checks">
      <li>Inventario de equipos por inmueble (A/C, neveras, lavadoras…).</li>
      <li>Historial de mantenimiento preventivo y correctivo, costos y avisos.</li>
      <li>Integración opcional con Contabilidad (activo fijo y depreciación).</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">3</span>Notificaciones + Calendario</div>
    <ul class="g-checks">
      <li>Eventos: vencimiento de pago, visita, pago registrado, incidencia, contrato por vencer.</li>
      <li>Canales: <strong>plataforma, Email, SMS y WhatsApp</strong>; preferencias por persona y reintentos con backoff.</li>
      <li>Agenda del inquilino: pagos, visitas y eventos de contrato.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">4</span>Reportes y auditoría</div>
    <ul class="g-checks">
      <li>Reportes operativos con exportación PDF/CSV/Excel (F2).</li>
      <li>Reportes financieros protegidos por su permiso fuente (F3).</li>
      <li>Bitácora de acciones críticas y traza de cambios de estado y accesos.</li>
    </ul>
  </div>
</div>

<!--
Fase 2 cubre la operación: incidencias con workflow y timeline inmutable, línea blanca, notificaciones
multicanal y agenda del inquilino, más reportes operativos y auditoría transversal.
-->

---

## Contabilidad (F3)

<div class="g-kicker">Módulos F3 · cierre del ciclo contable</div>

<div class="g-grid g-three">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Base contable</div>
    <ul class="g-checks">
      <li>Plan de cuentas jerárquico y versionado, con naturaleza.</li>
      <li>Asientos de <strong>partida doble</strong> con débito = crédito.</li>
      <li>Flujo borrador → aprobado → inmutable; separación crear ≠ aprobar.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Cierres y conciliación</div>
    <ul class="g-checks">
      <li><strong>Cierres parametrizables</strong>: diario, semanal, mensual, trimestral, semestral, anual.</li>
      <li>Bloqueo/reapertura de períodos con auditoría.</li>
      <li>Conciliación bancaria por cuenta y período.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">3</span>Impuestos y resultados</div>
    <ul class="g-checks">
      <li>Motor parametrizado: ITBMS 7%, ISR, retenciones y dividendos.</li>
      <li>Activos fijos y depreciación (integra Línea Blanca).</li>
      <li>Estados financieros: Balance, Resultados, Flujo y Balanza.</li>
    </ul>
  </div>
</div>

<div class="g-note" style="margin-top:14px">
  <strong>Fiscal panameño:</strong> las tasas y reglas (ITBMS 7%, ISR, retenciones) <strong>deben validarse con CPA y asesor legal</strong> antes de implementar; el módulo se parametriza y recalibra en la Fase 3.
</div>

<!--
Fase 3 cierra el ciclo contable: plan de cuentas, asientos de partida doble, cierres parametrizables,
conciliación, impuestos y estados financieros. Todo validado con contador y asesor legal panameño.
-->

---

## Portal y administración de acceso

<div class="g-kicker">Portales y seguridad de la plataforma</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Portal del inquilino <span class="g-chip g-chip-info" style="margin-left:auto">área separada</span></div>
    <ul class="g-checks">
      <li>Dashboard: saldo, próximo pago, incidencias y notificaciones.</li>
      <li>Calendario de pagos y visitas de mantenimiento.</li>
      <li>Reportar y seguir incidencias; descargar comprobantes PDF.</li>
      <li>Acceso solo a sus propios datos (scope por relación, protección IDOR).</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Administración y seguridad <span class="g-chip g-chip-info" style="margin-left:auto">transversal</span></div>
    <ul class="g-checks">
      <li>El cliente <strong>crea sus propios roles</strong> desde un catálogo <strong>fijo</strong> de permisos.</li>
      <li>Permisos <span class="g-mono">módulo.acción</span>; el backend siempre valida permiso + flag + regla.</li>
      <li>Feature flags por módulo y auditoría de acciones críticas.</li>
      <li>Regla «−1»: nadie puede revocarse su último permiso de administración.</li>
    </ul>
  </div>
</div>

<div class="g-note g-blue" style="margin-top:16px">
  <strong>Roles y permisos:</strong> la gestión de accesos es flexible para el cliente, pero las capacidades son controladas: sin permisos nuevos fuera del catálogo sembrado por desarrollo.
</div>

<!--
El portal del inquilino es un área separada con auto-servicio y alcance estrictamente limitado a sus
propios datos. La administración de acceso permite roles dinámicos creados por el cliente sobre un
catálogo fijo de permisos con validación siempre en el backend.
-->

---

## Sistema de diseño · GRAFITO

<div class="g-kicker">Design system v1.7 · identidad sobria y predecible</div>

<div class="g-grid g-four">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Identidad neutra</div>
    <ul class="g-checks">
      <li>Grafito negro-gris frío; sin azules corporativos.</li>
      <li>El <strong>color comunica estado</strong>, no estilo.</li>
      <li>Scaffold <span class="g-mono">#141A22</span> · canvas <span class="g-mono">#F6F7F9</span>.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Tipografía</div>
    <ul class="g-checks">
      <li><strong>Inter</strong> para la UI (acentos y ñ incluidos).</li>
      <li><strong>IBM Plex Mono</strong> para folios, hashes, cédulas/RUC y códigos.</li>
      <li>Escala base 14px; tablas densas y legibles.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">3</span>Formato de datos</div>
    <ul class="g-checks">
      <li>Fechas en pantalla <strong>DD/MM/YYYY</strong>; almacenamiento ISO 8601.</li>
      <li>Montos <span class="g-mono">B/.</span> con cifras de ancho fijo (<span class="g-mono">tabular-nums</span>).</li>
      <li>Rejilla 8px con pasos de 4px; radios contenidos.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">4</span>Accesibilidad</div>
    <ul class="g-checks">
      <li>Contraste AA+ en estados y textos (≥ 4.5:1).</li>
      <li>WCAG 2.2: foco visible, roles semánticos, diálogos accesibles.</li>
      <li>Patrones de confirmación en toda acción con efectos.</li>
    </ul>
  </div>
</div>

<div class="g-row" style="margin-top:16px">
  <span class="g-chip g-chip-alta">Success · PAGADO</span>
  <span class="g-chip g-chip-med">Warning · EN MORA</span>
  <span class="g-chip g-chip-danger">Danger · ANULADO</span>
  <span class="g-chip g-chip-info">Info · NUEVO</span>
  <span class="g-chip g-chip-dark">Neutro · BORRADOR</span>
</div>

<!--
El sistema de diseño GRAFITO es neutro (grafito) y usa el color únicamente para comunicar estado.
Tipografía Inter + IBM Plex Mono, formatos estrictos de fecha y moneda, y accesibilidad WCAG 2.2 AA+.
-->

---

## Experiencia de usuario · capturas (1 de 2)

<div class="g-kicker">Prototipo validado · administración</div>

<div class="g-shots g-two-shots">
  <figure class="g-shot"><img src="/screenshots/v3-resumen.png" alt="Dashboard de administración"><figcaption>Dashboard con KPIs por módulo</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-clientes.png" alt="Módulo de clientes"><figcaption>Clientes: listado con estado</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-inmuebles.png" alt="Módulo de inmuebles"><figcaption>Inmuebles: portafolio y filtros</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-cobros.png" alt="Módulo de cobros"><figcaption>Cobros: recibos, pagos y mora</figcaption></figure>
</div>

<!--
Capturas del prototipo validado: dashboard de KPIs, listados de clientes e inmuebles y el módulo de
cobros con recibos, pagos y estado de mora. Interfaz GRAFITO sobria y formal.
-->

---

## Experiencia de usuario · contabilidad (2 de 2)

<div class="g-kicker">Prototipo validado · contabilidad</div>

<div class="g-shots g-two-shots">
  <figure class="g-shot"><img src="/screenshots/v3-contabilidad-plan.png" alt="Plan de cuentas"><figcaption>Plan de cuentas con naturaleza</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-contabilidad-asientos.png" alt="Asientos contables"><figcaption>Asientos: partida doble</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-contabilidad-ef.png" alt="Estados financieros"><figcaption>Estados financieros por período</figcaption></figure>
  <figure class="g-shot"><img src="/screenshots/v3-contrato-nuevo.png" alt="Asistente de contrato"><figcaption>Contratos: asistente de arrendamiento</figcaption></figure>
</div>

<!--
Módulo de contabilidad en acción: plan de cuentas jerárquico, asientos de partida doble con validación
débito = crédito, estados financieros por período y asistente de contratos de arrendamiento.
-->

---
layout: center
class: g-section
---

<div class="g-sec-num">03</div>
<div class="g-kicker">Parte 03</div>
<h1>Arquitectura y seguridad</h1>
<p>El diseño técnico de la solución y el cumplimiento normativo.</p>

---

## Arquitectura técnica

<div class="g-kicker">Monolito Modular · diseño técnico</div>

<div class="g-grid g-two" style="gap:24px">
  <div class="g-arch">
    <div class="g-abox">Aplicación web<span>Blazor Web App + MudBlazor · Admin y portales</span></div>
    <div class="g-arr">▼ HTTPS/JSON</div>
    <div class="g-abox g-subtle">API Gateway (YARP)<span>routing · rate limit · correlación</span></div>
    <div class="g-arr">▼</div>
    <div class="g-abox g-brand">Núcleo · Monolito Modular<span>11 módulos con esquemas BD propios</span></div>
    <div class="g-arow">
      <div class="g-abox g-scaffold">PostgreSQL 17<span>ACID · JSONB</span></div>
      <div class="g-abox g-scaffold">Redis<span>caché · locks</span></div>
    </div>
    <div class="g-arow">
      <div class="g-abox g-scaffold">Object Storage<span>fotos · PDF</span></div>
      <div class="g-abox g-scaffold">Quartz .NET<span>recibos · cierres</span></div>
    </div>
    <div class="g-arr">▲ OpenTelemetry</div>
    <div class="g-abox g-subtle">Grafana + Loki<span>observabilidad extremo a extremo</span></div>
  </div>
  <div>
    <div class="g-card" style="margin-bottom:14px">
      <div class="g-card-h"><span class="g-num">1</span>¿Por qué monolito modular?</div>
      <ul class="g-checks">
        <li>Un despliegue: menor coste de operación, mismos beneficios de fronteras por módulo.</li>
        <li>Contención de fallos y <strong>kill-switch</strong> por módulo (Ops Console).</li>
        <li>Esquemas BD independientes por bounded context; sin acoplamiento.</li>
      </ul>
    </div>
    <div class="g-card">
      <div class="g-card-h"><span class="g-num">2</span>Reglas técnicas clave</div>
      <ul class="g-checks">
        <li>Comprobantes PDF <strong>inmutables</strong> con URLs firmadas.</li>
        <li>Concurrencia optimista (<span class="g-mono">rowversion</span>) en finanzas.</li>
        <li>Soft delete en maestros; inmutabilidad en dinero y contabilidad.</li>
      </ul>
    </div>
  </div>
</div>

<!--
Arquitectura confirmada: ASP.NET Core 10 + Blazor Web App + MudBlazor, YARP como gateway, monolito
modular con 11 bounded contexts, PostgreSQL 17, Redis, Object Storage S3-compatible y Quartz.NET.
Observabilidad con OpenTelemetry hacia Grafana/Loki. ADRs clave: ADR-015 fronteras por módulo,
ADR-016/017 contención de fallos y kill-switch.
-->

---

## Seguridad y cumplimiento

<div class="g-kicker">Seguridad desde el diseño</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Seguridad técnica</div>
    <ul class="g-checks">
      <li>Autenticación <strong>BFF</strong>: JWT en cookie <span class="g-mono">httpOnly</span> + refresh rotativo (15 min).</li>
      <li>RBAC con roles dinámicos + permisos fijos; validación siempre en backend.</li>
      <li>Protección IDOR en cada recurso; soft delete; cifrado de datos sensibles.</li>
      <li>Contención de fallos y <strong>kill-switch</strong> remoto por módulo (Ops Console).</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Cumplimiento panameño</div>
    <ul class="g-checks">
      <li><strong>Ley 81 de 2019</strong>: consentimientos, derechos del titular, cifrado en reposo.</li>
      <li>Marco fiscal <strong>DGI</strong>: ITBMS 7%, ISR, retenciones — tasas parametrizadas y validadas con CPA.</li>
      <li>Retención documental propuesta de 10 años.</li>
      <li>Moneda base USD/Balboa; montos en centavos (sin errores de redondeo).</li>
    </ul>
  </div>
</div>

<!--
Seguridad transversal: BFF con cookie httpOnly, RBAC con validación en backend, protección IDOR y
kill-switch por módulo. Cumplimiento local: Ley 81 de 2019, marco DGI y retención documental de 10 años.
-->

---
layout: center
class: g-section
---

<div class="g-sec-num">04</div>
<div class="g-kicker">Parte 04</div>
<h1>Alcance y plan</h1>
<p>Qué se incluye, cómo se construye y qué queda pendiente.</p>

---

## Alcance

<div class="g-kicker">Qué incluye la solución y qué queda fuera</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Incluido (Fases 0 a 3)</div>
    <ul class="g-checks">
      <li>Administración completa + portal del inquilino.</li>
      <li>Clientes, inmuebles, contratos, cobros, liquidaciones, incidencias, línea blanca, contabilidad y reportes.</li>
      <li>Notificaciones plataforma + Email (F1) y SMS (F2).</li>
      <li>Observabilidad, Ops Console y seguridad transversal.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Excluido / fase futura</div>
    <ul class="g-checks">
      <li>Portal del propietario (en discusión — F4).</li>
      <li>Facturación electrónica DGI (futuro).</li>
      <li>Multi-empresa / multi-moneda (futuro).</li>
      <li>WhatsApp (contingente, F2 según proveedor).</li>
      <li>Migración de datos históricos desde SharePoint (servicio aparte).</li>
    </ul>
  </div>
</div>

<!--
El alcance F0–F3 cubre administración, portal del inquilino y contabilidad. El portal del propietario,
facturación electrónica, multi-empresa, WhatsApp y la migración de datos quedan fuera o en fases futuras.
-->

---

## Plan de desarrollo por fases

<div class="g-kicker">Implementación · esfuerzo PERT estimado</div>

<div class="g-note g-green" style="margin-bottom:4px">
  Esfuerzo PERT estimado <strong>6,943 horas</strong> · duración recomendada <strong>9–11 meses</strong> · equipo de <strong>4–5 personas</strong>
</div>

<div class="g-tl">
  <div class="g-tl-item">
    <div class="g-tl-phase">Fase 0 · Fundación</div>
    <div class="g-tl-hours">≈ 1,648 h</div>
    <div class="g-tl-desc">Scaffolding monolito, Identity + JWT BFF, RBAC con roles dinámicos, YARP, observabilidad, Ops Console/kill-switch, CI/CD y shell de UI.</div>
    <span class="g-chip g-chip-alta">Alta · prereq.</span>
  </div>
  <div class="g-tl-item">
    <div class="g-tl-phase">Fase 1 · Núcleo</div>
    <div class="g-tl-hours">≈ 1,871 h</div>
    <div class="g-tl-desc">Clientes, inmuebles, contratos, cobros con comprobantes PDF, liquidaciones y portal inquilino base. Cierre de decisiones y validación legal.</div>
    <span class="g-chip g-chip-alta">Alta</span>
  </div>
  <div class="g-tl-item">
    <div class="g-tl-phase">Fase 2 · Operación</div>
    <div class="g-tl-hours">≈ 1,455 h</div>
    <div class="g-tl-desc">Incidencias, visitas y calendario, notificaciones multicanal, línea blanca y reportes operativos.</div>
    <span class="g-chip g-chip-med">Media</span>
  </div>
  <div class="g-tl-item">
    <div class="g-tl-phase">Fase 3 · Contabilidad</div>
    <div class="g-tl-hours">≈ 1,969 h</div>
    <div class="g-tl-desc">Plan de cuentas, asientos y automatización, cierres parametrizables, conciliación, impuestos, activos fijos y estados financieros. Recalibra tras cuestionario CPA.</div>
    <span class="g-chip g-chip-alta">Alta</span>
  </div>
</div>

<!--
Total por fases: 1,648 + 1,871 + 1,455 + 1,969 = 6,943 h. Calendario indicativo: firma oct-2026,
F0 oct–nov, F1 dic–mar, F2 mar–may, F3 may–sep y go-live con garantía hasta dic-2027.
-->

---

## Prioridades por módulo

<div class="g-kicker">Prioridad de cada módulo dentro del plan</div>

<table class="g-table">
  <thead>
    <tr><th>Módulo</th><th>Fase</th><th>Prioridad</th><th>Justificación</th></tr>
  </thead>
  <tbody>
    <tr><td>Administración y Seguridad</td><td>F0</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Base de la plataforma (RBAC, flags, config).</td></tr>
    <tr><td>Clientes</td><td>F1</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Identidad de inquilinos y propietarios.</td></tr>
    <tr><td>Inmuebles</td><td>F1</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Catálogo del portafolio.</td></tr>
    <tr><td>Contratos</td><td>F1</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Fuente de verdad del negocio.</td></tr>
    <tr><td>Finanzas (cobros y liquidaciones)</td><td>F1</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Flujo de dinero: recibos, pagos, mora.</td></tr>
    <tr><td>Portal inquilino (base)</td><td>F1</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Autoservicio del inquilino.</td></tr>
    <tr><td>Incidencias</td><td>F2</td><td><span class="g-chip g-chip-med">Media</span></td><td>Operación; depende de inmuebles/contratos.</td></tr>
    <tr><td>Línea Blanca</td><td>F2</td><td><span class="g-chip g-chip-med">Media</span></td><td>Inventario y mantenimientos.</td></tr>
    <tr><td>Notificaciones + Calendario</td><td>F2</td><td><span class="g-chip g-chip-med">Media</span></td><td>Comunicación; depende de cobros/incidencias.</td></tr>
    <tr><td>Reportes</td><td>F2/F3</td><td><span class="g-chip g-chip-med">Media</span></td><td>Operativos en F2; financieros con contabilidad.</td></tr>
    <tr><td>Contabilidad</td><td>F3</td><td><span class="g-chip g-chip-alta">Alta</span></td><td>Cierra el ciclo; validación CPA previa.</td></tr>
  </tbody>
</table>

<!--
Prioridades derivadas del plan por fases. Dependencias: F0 antes que todo; F1 antes de F2; F2 antes de F3
(parcial). La base contable (plan + asientos manuales) puede iniciarse en paralelo al cierre de F2.
-->

---

## Migración desde SharePoint

<div class="g-kicker">Datos históricos · análisis aparte</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Es posible migrar</div>
    <ul class="g-checks">
      <li><strong>Sí es posible</strong> migrar la data que hoy vive en SharePoint.</li>
      <li>Requiere <strong>revisión y análisis por separado</strong> de las fuentes existentes.</li>
      <li>Sin vía más automatizada contemplada: carga inicial normalizada o captura desde cero.</li>
      <li>Se dimensiona como <strong>servicio aparte</strong> (bolsa de horas o contrato propio), fuera del alcance F0–F3.</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Pasos del análisis</div>
    <ul class="g-checks">
      <li>1 · Inventario de fuentes y volúmenes (clientes, inmuebles, recibos, contratos).</li>
      <li>2 · Validación de calidad y normalización con el equipo del cliente.</li>
      <li>3 · Estrategia: carga inicial completa vs. arranque desde cero.</li>
      <li>4 · Carga, validación (conciliación de saldos) y go-live de datos.</li>
    </ul>
  </div>
</div>

<div class="g-note g-blue" style="margin-top:14px">
  <strong>Recomendación:</strong> coordinar la revisión de datos <strong>al inicio del proyecto</strong> (se nivela con la Fase 1) para que la carga inicial no retrase el arranque de operaciones.
</div>

<!--
La migración de SharePoint es viable pero se trata como un servicio aparte: análisis, normalización y
carga validada de datos. Se recomienda iniciar la revisión junto con la Fase 1.
-->

---

## Decisiones y pendientes

<div class="g-kicker">A confirmar antes de implementar</div>

<div class="g-grid g-two">
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">1</span>Validaciones externas (bloqueantes)</div>
    <ul class="g-checks">
      <li><strong>CPA panameño</strong>: plan de cuentas, NIIF vs NIIF PYMES, tasas ISR/ITBMS/retenciones, ITBMS del arrendamiento.</li>
      <li><strong>Asesor legal</strong>: marco de arrendamiento, retención documental (10 años), Ley 81/2019.</li>
      <li>Confirmación de ciudad principal y proveedores (correo, SMS, WhatsApp, almacenamiento).</li>
    </ul>
  </div>
  <div class="g-card">
    <div class="g-card-h"><span class="g-num">2</span>Reglas de negocio (D1–D12)</div>
    <ul class="g-checks">
      <li>Mora del cliente derivada de cualquier recibo vencido.</li>
      <li>Fórmula de prorrateo / terminación anticipada de contrato.</li>
      <li>Anulaciones: motivo + supervisor; pagos parciales.</li>
      <li>Cierre contable bloqueado si el banco no está conciliado (recomendado).</li>
      <li>Segregación de funciones y permisos nuevos del catálogo.</li>
    </ul>
  </div>
</div>

<div class="g-note" style="margin-top:14px">
  Estas decisiones <strong>cambian el comportamiento, no el tamaño</strong> del proyecto: se cierran idealmente en una sesión de decisiones al inicio de la Fase 1.
</div>

<!--
Pendientes bloqueantes: validación de CPA (plan de cuentas, tasas) y asesor legal (arrendamiento,
retención documental, Ley 81). Además 12 reglas de negocio D1–D12 que se cierran al inicio de la Fase 1.
-->

---
layout: cover
class: g-portada
---

<div class="g-cover">
  <div class="g-mark">CE</div>
  <div class="g-cover-kicker">Constructora Especializada · Diseño de solución</div>
  <h1>¿Siguiente paso?</h1>
  <p class="g-cover-sub">Definamos juntos el alcance contractual por fases, validemos el marco legal y fiscal, y cerremos las decisiones de negocio para arrancar la Fase 0.</p>
  <div class="g-cover-meta">
    <span class="g-chip-dark">Plan sugerido: Fases 0–3</span>
    <span class="g-chip-dark">Esfuerzo: 6,943 h · 9–11 meses</span>
    <span class="g-chip-dark">Migración SharePoint: análisis aparte</span>
  </div>
</div>

<!--
Cierre: proponer el siguiente paso concreto — definir el alcance contractual por fases, validar el marco
legal y fiscal con CPA y abogado, y cerrar las decisiones de negocio (D1–D12) para iniciar la Fase 0.
-->