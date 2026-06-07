# Plan de Unificación — Dashboard Integral HPS-Import

> Basado en el análisis de 3 dashboards existentes (ingresos, ventas, rentabilidad integral)
> Fecha: Junio 2026

---

## 1. Datos YA Cubiertos (Consolidado de los 3 dashboards)

### Tabla de Ingresos / Facturación (dash-ingresos + dash-ventas)
| Campo | Fuente | Notas |
|-------|--------|-------|
| Fecha | Ingresos + Ventas | DD/MM/YYYY |
| Cliente | Ambos | Texto libre |
| Presupuesto # | Ambos | Número de referencia |
| Línea (HPS/IMPORT) | Ambos | Select |
| Producto/Servicio | Ambos | HPS es "P/S", Ingresos es texto libre |
| Monto Bruto (USD) | Principal ingresos | Input directo |
| Monto Neto (USD) | Ambos | Calculado ÷1.18 o input directo |
| ITBIS | Calculado | 18% |
| Estatus (Aprobado/No) | Ventas | — |

### Tabla de Rentabilidad Integral (index_5)
| Categoría | Campos |
|-----------|--------|
| **Ventas** | HPS Brutas, HPS Netas, Import Brutas, Import Netas (USD) |
| **Ingresos Cobrados** | Cobrado Bruto (USD) |
| **Compras/Supply** | ASSA ABLOY, ADUANAS, suplidores dinámicos (nombre + valor USD) |
| **Inventarios** | Inicial, Final (USD) |
| **Nómina** | Global (RD$) |
| **Gastos Operativos** | Caja Chica, Eventos/Publicidad, Correos, Seguro Guagua (RD$) |
| **Gastos Vehículo** | Combustible, Intereses (USD) |
| **Gastos Generales** | Combustible Alejandro, Teléfonos/Data, Viajes, Electricidad/Agua, Depreciación, Seguros (USD) |
| **KPIs Comerciales** | Visitas totales, % presencial, % llamadas, % emails |
| **Presupuestos** | Cantidad realizados, monto total, cantidad aprobados, valor cerrado |
| **Tasa Cambio** | RD$/USD configurable por mes |
| **Metas** | $1,250,000 anual, $104,167 mensual |

---

## 2. Datos que se PODRÍAN AGREGAR (Propuesta de expansión)

### 📦 Logística & Comercio Internacional
| Campo | Por qué es importante |
|-------|----------------------|
| **País de origen del proveedor** | Saber concentración por país, riesgo cambiario |
| **Tiempo de entrega (días)** | Tracking de lead times, identificar cuellos de botella |
| **Flete internacional (USD)** | Costo logístico mayor — actualmente no contabilizado |
| **Seguro de carga (USD)** | Costo adicional |
| **Almacenaje / handling (USD)** | Costos de aduana y depósito |
| **Transporte local (USD)** | Delivery desde puerto/aeropuerto a almacén |
| **Tracking de contenedor / OC** | Número de contenedor, BL, estatus (en tránsito, en aduana, entregado) |
| **Incoterms** | CIF, FOB, etc. |
| **Arancel / DAI pagado** | Costo de nacionalización |

### 💰 Finanzas & Rentabilidad
| Campo | Por qué es importante |
|-------|----------------------|
| **Margen por cliente específico** | Saber qué clientes dan más rentabilidad |
| **Margen por producto** | Identificar líneas más rentables |
| **Antigüedad de cuentas por cobrar** | 30, 60, 90+ días — alerta temprana de morosidad |
| **Costo financiero (intereses)** | Por financiamiento de inventarios o capital de trabajo |
| **Proyección de ingresos vs real** | Forecast rolling 3 meses |
| **Presupuesto anual vs gasto real** | Control de gastos acumulado |
| **Costo de venta directo** | Separar material directo del gasto general |

### 📊 Gestión Comercial (mejorar KPIs)
| Campo | Por qué es importante |
|-------|----------------------|
| **Ticket promedio por mes** | Ventas netas / cantidad transacciones |
| **Conversión lead → cotización** | Efectividad comercial |
| **Conversión cotización → venta** | % de cierre |
| **Ciclo de venta (días)** | Desde primer contacto hasta cierre |
| **Top N productos más vendidos** | Análisis de demanda |
| **Estacionalidad** | Patrones mensuales históricos |
| **Clientes nuevos vs recurrentes** | Lealtad y crecimiento |

### 📈 Reportes y Cumplimiento
| Campo | Por qué es importante |
|-------|----------------------|
| **Impuesto mensual ITBIS a pagar** | Obligación fiscal |
| **ISR mensual estimado** | Proyección de impuesto |
| **Indicador de liquidez** | Razón corriente (activo/pasivo) |
| **ROI de presupuestos** | Valor cerrado vs monto presupuestado |
| **Tasa de efectividad de visitas** | Ventas cerradas / visitas totales |

---

## 3. Esquema de Base de Datos PostgreSQL Propuesto

```sql
-- Tabla principal: Datos mensuales por mes (12 registros por año)
CREATE TABLE meses (
    id SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL DEFAULT 2026,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    UNIQUE (anio, mes)
);

-- Tabla: Ventas & Facturación mensual
CREATE TABLE ventas_mensuales (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    ventas_hps_brutas_usd NUMERIC(12,2) DEFAULT 0,
    ventas_hps_netas_usd NUMERIC(12,2) DEFAULT 0,
    ventas_import_brutas_usd NUMERIC(12,2) DEFAULT 0,
    ventas_import_netas_usd NUMERIC(12,2) DEFAULT 0,
    ingresos_cobrados_bruto_usd NUMERIC(12,2) DEFAULT 0,
    ingresos_cobrados_neto_usd NUMERIC(12,2) DEFAULT 0,
    tasa_cambio_rd NUMERIC(8,2) DEFAULT 61,
    UNIQUE (mes_id)
);

-- Tabla: Transacciones individuales (facturas/ingresos)
CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id),
    fecha DATE NOT NULL,
    cliente VARCHAR(255) NOT NULL,
    presupuesto VARCHAR(100),
    linea VARCHAR(20) CHECK (linea IN ('HPS', 'IMPORT', 'SIN_CLASIFICAR')),
    tipo_producto VARCHAR(1) CHECK (tipo_producto IN ('P', 'S', NULL)),
    estatus VARCHAR(20) CHECK (estatus IN ('APROBADO', 'NO_APROBADO', 'PENDIENTE')),
    monto_bruto_usd NUMERIC(12,2) NOT NULL,
    monto_neto_usd NUMERIC(12,2) NOT NULL,
    itbis_usd NUMERIC(12,2) NOT NULL,
    descripcion TEXT,
    exento_itbis BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transacciones_mes ON transacciones(mes_id);
CREATE INDEX idx_transacciones_cliente ON transacciones(cliente);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);

-- Tabla: Costos y Suplidores
CREATE TABLE costos_mensuales (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    assa_abloy_usd NUMERIC(12,2) DEFAULT 0,
    aduanas_usd NUMERIC(12,2) DEFAULT 0,
    inventario_inicial_usd NUMERIC(12,2) DEFAULT 0,
    inventario_final_usd NUMERIC(12,2) DEFAULT 0,
    flete_internacional_usd NUMERIC(12,2) DEFAULT 0,
    seguro_carga_usd NUMERIC(12,2) DEFAULT 0,
    almacenaje_usd NUMERIC(12,2) DEFAULT 0,
    transporte_local_usd NUMERIC(12,2) DEFAULT 0,
    costos_logisticos_otros_usd NUMERIC(12,2) DEFAULT 0,
    arancel_usd NUMERIC(12,2) DEFAULT 0,
    UNIQUE (mes_id)
);

-- Tabla: Suplidores adicionales (1:N)
CREATE TABLE suplidores_adicionales (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    valor_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    pais_origen VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Gastos administrativos
CREATE TABLE gastos_mensuales (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    nomina_rd NUMERIC(12,2) DEFAULT 0,
    caja_chica_rd NUMERIC(12,2) DEFAULT 0,
    eventos_publicidad_rd NUMERIC(12,2) DEFAULT 0,
    correos_rd NUMERIC(12,2) DEFAULT 0,
    seguro_guagua_rd NUMERIC(12,2) DEFAULT 0,
    combustible_guagua_usd NUMERIC(10,2) DEFAULT 0,
    intereses_vehiculo_usd NUMERIC(10,2) DEFAULT 0,
    combustible_alejandro_rd NUMERIC(10,2) DEFAULT 0,
    telefonos_data_usd NUMERIC(10,2) DEFAULT 0,
    viajes_rd NUMERIC(12,2) DEFAULT 0,
    electricidad_agua_usd NUMERIC(10,2) DEFAULT 0,
    depreciacion_usd NUMERIC(10,2) DEFAULT 0,
    seguros_generales_usd NUMERIC(10,2) DEFAULT 0,
    costo_financiero_usd NUMERIC(12,2) DEFAULT 0,
    otros_gastos_rd NUMERIC(12,2) DEFAULT 0,
    otros_gastos_usd NUMERIC(12,2) DEFAULT 0,
    UNIQUE (mes_id)
);

-- Tabla: KPIs comerciales
CREATE TABLE kpis_comerciales (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    total_visitas INTEGER DEFAULT 0,
    pct_presencial NUMERIC(5,2) DEFAULT 0,
    pct_llamadas NUMERIC(5,2) DEFAULT 0,
    pct_emails NUMERIC(5,2) DEFAULT 0,
    cant_presupuestos INTEGER DEFAULT 0,
    monto_presupuestado_usd NUMERIC(14,2) DEFAULT 0,
    cant_aprobados INTEGER DEFAULT 0,
    valor_cerrado_usd NUMERIC(14,2) DEFAULT 0,
    leads_nuevos INTEGER DEFAULT 0,
    clientes_recurrentes INTEGER DEFAULT 0,
    ticket_promedio_usd NUMERIC(12,2) DEFAULT 0,
    UNIQUE (mes_id)
);

-- Tabla: Cuentas por Cobrar (antigüedad)
CREATE TABLE cuentas_cobrar (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id) ON DELETE CASCADE,
    cliente VARCHAR(255) NOT NULL,
    monto_pendiente_usd NUMERIC(12,2) NOT NULL,
    dias_vencido INTEGER NOT NULL DEFAULT 0,
    factura_ref VARCHAR(100),
    fecha_emision DATE,
    fecha_vencimiento DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_cc_cliente ON cuentas_cobrar(cliente);
CREATE INDEX idx_cc_mes ON cuentas_cobrar(mes_id);

-- Tabla: Proyecciones (rolling forecast)
CREATE TABLE proyecciones (
    id SERIAL PRIMARY KEY,
    mes_id INTEGER NOT NULL REFERENCES meses(id),
    tipo VARCHAR(20) CHECK (tipo IN ('OPTIMISTA', 'REALISTA', 'CONSERVADOR')),
    ingresos_proyectados_usd NUMERIC(14,2),
    gastos_proyectados_usd NUMERIC(14,2),
    margen_esperado_pct NUMERIC(5,2),
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Metas y configuración
CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL DEFAULT 2026,
    meta_anual_usd NUMERIC(14,2) NOT NULL DEFAULT 1250000,
    meta_mensual_usd NUMERIC(14,2) GENERATED ALWAYS AS (meta_anual_usd / 12) STORED,
    isr_tasa_pct NUMERIC(5,2) DEFAULT 27,
    itbis_tasa_pct NUMERIC(5,2) DEFAULT 18,
    moneda_local VARCHAR(3) DEFAULT 'RDS',
    UNIQUE (anio)
);
```

---

## 4. Stack Técnico Recomendado

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Frontend** | React + Vite + Recharts + TailwindCSS | SPA moderna, componentes reutilizables, gráficos fluidos |
| **Backend** | Node.js + Express | Ya definido, funciona bien con PostgreSQL |
| **BD** | PostgreSQL (Render) | Ya definido, robusto para queries analíticas |
| **ORM** | Knex.js o Drizzle | Migrations, seeders, queries tipadas |
| **Auth** | JWT + bcrypt | Login seguro, roles (admin/invitado) |
| **Deploy** | Render (Web Service + PostgreSQL) | Ya definido |
| **API REST** | Express routers | Modular por módulo |
| **Manejo de estado** | React Context + useReducer | Ligero, sin dependencia extra |
| **Gráficos** | Recharts o Chart.js vía react-chartjs-2 | Ya usado en los prototipos |

---

## 5. Propuesta de Módulos / Vistas

### 🔐 Login & Roles
- Admin: CRUD completo, editar datos, ver todo
- Gerente: Ver todo, sin editar
- Invitado: Dashboard resumen solamente

### 📅 Módulo Mensual (Entrada de Datos)
Formulario completo para cada mes con todas las categorías:
- Ventas (HPS/Import, brutas/netas)
- Cobranza (ingresos cobrados)
- Costos (ASSA ABLOY, ADUANAS, suplidores dinámicos, logística internacional)
- Inventarios
- Gastos administrativos (RD$ y US$)
- KPIs comerciales (visitas, presupuestos, aprobaciones)
- Proyecciones

### 💰 Módulo de Rentabilidad (4 perspectivas)
1. **Devengado** — Base contable (facturación emitida)
2. **Caja** — Base de liquidez (cobrado realmente)
3. **DSO** — Días de cobranza, antigüedad de cartera
4. **Comparativo** — Devengado vs Caja lado a lado

### 📊 Dashboard General (KPIs)
- Cumplimiento de meta anual
- Total ventas brutas/netas
- Margen bruto y neto (%)
- Gastos totales
- Utilidad neta (devengado + caja)
- Tasa de aprobación de presupuestos
- Cuentas por cobrar (total + vencidas)

### 📈 Análisis Comercial
- Evolución mensual de ventas
- Top clientes
- Ticket promedio
- Conversión de presupuestos
- Productos más vendidos
- Estacionalidad

### 🚢 Logística & Supply Chain (NUEVO)
- Costos logísticos desglosados (flete, seguro, almacenaje)
- Tracking de órdenes de compra
- Tiempos de entrega por proveedor
- Incoterms
- Rotación de inventario

### 📉 Proyecciones
- Rolling forecast 3 meses
- Metas vs reales
- Escenarios (optimista/realista/conservador)

### 📄 Reportes Exportables
- Estado de Resultados (PyG) mensual y acumulado
- Reporte de cuentas por cobrar
- Reporte de costos logísticos
- Exportable a PDF y CSV

---

## 6. Roadmap de Implementación

### Fase 1 — Fundación (backend + BD)
- Crear esquema PostgreSQL completo
- API REST con Express
- Migraciones y seeders (datos de los 3 dashboards existentes)
- Auth con JWT + bcrypt

### Fase 2 — Frontend Core
- Login
- Módulo mensual (formulario de entrada de datos)
- CRUD de transacciones
- Tablas con filtros

### Fase 3 — Dashboard & Gráficos
- Dashboard KPIs general
- Rentabilidad (4 perspectivas)
- Gráficos de evolución, composición, márgenes

### Fase 4 — Módulos Avanzados
- Logística y supply chain
- Cuentas por cobrar con antigüedad
- Proyecciones
- Exportación de reportes

### Fase 5 — Pulido y Deploy
- Pruebas
- Responsive
- Deploy en Render
- Documentación

---

## 7. Notas Técnicas

- **ITBIS:** 18% sobre el monto bruto. Neto = Bruto / 1.18
- **ISR:** 27% sobre EBIT cuando es positivo
- **Diferencias clave entre dashboards existentes:**
  - Ingresos usa bruto como input → calcula neto
  - Ventas usa neto como input → calcula bruto
  - El unificado debe permitir AMBAS formas (configurable)
- **Tasa de cambio:** Almacenada por mes, default 61-63 RD$/US$