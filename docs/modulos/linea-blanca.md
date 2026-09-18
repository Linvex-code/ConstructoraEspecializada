# Módulo de Línea Blanca

| Campo | Valor |
|---|---|
| **Versión** | 1.0 |
| **Fecha** | 12/09/2026 |
| **Estado** | Documento oficial del módulo v1.0 |
| **Documento base** | `docs/ui/requerimientos-modulos.md` (v0.1) — sección 7 |
| **Documentos relacionados** | `docs/diseno-arquitectura.md` (v1.1) — §14 · `docs/modulos/README.md` (v1.0) |
| **Esquema BD (referencia)** | `assets` |
| **Feature flag** | `features.linea-blanca` (definido en `docs/diseno-arquitectura.md` §18) |
| **Permisos del catálogo** | `lineablanca.read` · `lineablanca.create` **[P]** · `lineablanca.update` **[P]** · `lineablanca.baja` **[P]** · `lineablanca.mantenimientos.registrar` |

> Transversal RN-S01: el backend valida siempre `permiso` + feature flag + regla de negocio; el frontend solo controla UX.

---

## 1. Objetivo

Inventario de equipos por inmueble (A/C, neveras, lavadoras, calentadores) con mantenimiento preventivo/correctivo, garantía y ciclo de vida.

## 2. Requisitos funcionales

- **RF-LB-01** CRUD de equipos con ficha (marca, modelo, serie, ubicación, compra, costo).
- **RF-LB-02** Estados: `Instalado`, `En reparación`, `De baja` (con motivo/fecha).
- **RF-LB-03** Registro de mantenimientos `preventivo`/`correctivo` (fecha, tipo, costo, proveedor, resultado, próxima fecha).
- **RF-LB-04** Historial completo por equipo (mantenimientos acumulados).
- **RF-LB-05** Aviso de próximos preventivos vencidos (visitas) `[P]`.
- **RF-LB-06** Garantía (fecha fin) y costo acumulado por equipo `[P]`.

## 3. Campos

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

## 4. Permisos

| Acción | Permiso |
|---|---|
| Ver inventario/ficha | `lineablanca.read` |
| Registrar / editar equipo | `lineablanca.create` / `lineablanca.update` |
| Dar de baja | `lineablanca.baja` |
| Registrar mantenimiento | `lineablanca.mantenimientos.registrar` |

## 5. Restricciones de datos (RD)

- **RD-LB-01** `serie` única (por marca/modelo); `inm` obligatorio; `costo > 0`.
- **RD-LB-02** En `De baja` se exige `motivoBaja` y fecha; **no** se registran mantenimientos nuevos.
- **RD-LB-03** Si el registro es preventivo: `sig` (próxima fecha) debe ser posterior a `f`.
- **RD-LB-04** El estado no puede ser `De baja` sin motivo (validación cruzada).

## 6. Restricciones de flujo (FL)

- **FL-LB-01** `Instalado → En reparación` (se registra mantenimiento correctivo) · `En reparación → Instalado` (correctivo terminado) · `Instalado → De baja` (**irreversible**; se excluye de métricas activas) `[DECISIÓN: ¿posibilidad de reacondicionar/reincorporar?]`.
- **FL-LB-02** Preventivo solo si equipo `Instalado`.
- **FL-LB-03** Al cerrar una Incidencia de equipo con proveedor, se **sugiere** el mantenimiento correctivo (integración opcional con Incidencias).

## 7. Casos de uso (CU)

- **CU-LB-01 Registrar equipo.** Precond: `lineablanca.create`.
- **CU-LB-02 Registrar preventivo.** Precond: `lineablanca.mantenimientos.registrar`, equipo Instalado. Resultado: actualiza historial y próxima fecha.
- **CU-LB-03 Reparar (correctivo).** Precond: `lineablanca.mantenimientos.registrar`. Resultado: equipo → `En reparación` → `Instalado`.
- **CU-LB-04 Dar de baja.** Precond: `lineablanca.baja` + motivo. Resultado: `De baja`.
- **CU-LB-05 Consultar ficha con historial.** Precond: `lineablanca.read`.

## 8. Resumen en dashboard

Widget **Línea blanca**: Equipos 5 · Instalados 3 · En reparación 1 · Mant. registrados 4 (permiso: `lineablanca.read`).

## 9. Dependencias con otros módulos

- `Inmuebles` — ubicación del equipo (obligatorio).
- `Incidencias` — sugerencia de mantenimiento correctivo al cerrar una incidencia de equipo.
- `Contratos` — asignación del costo del mantenimiento en inmueble alquilado (regla configurable, ver `docs/diseno-arquitectura.md` §14 RN-B2).
- `Contabilidad` — opcional: equipo como **activo fijo** y depreciación.

## 10. Decisiones y preguntas abiertas

| # | Decisión |
|---|---|
| D1 | ¿Posibilidad de reacondicionar/reincorporar un equipo `De baja`? |
| D2 | ¿Asociación opcional del mantenimiento con la Incidencia de origen? |

## 11. Control de versiones

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 12/09/2026 | Versión inicial del módulo. Extraída y consolidada desde `docs/ui/requerimientos-modulos.md` (v0.1) §7. | Equipo de diseño |

---

*Fin del documento del módulo de Línea Blanca v1.0.*