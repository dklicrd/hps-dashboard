import { useResumenAnual } from '../hooks/useDashboardData';
import KPICard, { ChartCard } from '../components/UI';

const fmt = (v, d = 2) =>
  Number(v).toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const fmtP = (v) => Number(v).toFixed(1) + '%';

export default function DashboardPage() {
  const { resumen, loading } = useResumenAnual(2026);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  const t = resumen?.totales;
  const meses = resumen?.meses || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-primary">📊 Dashboard de KPIs</h1>
        <span className="bg-accent text-white text-xs px-3 py-1.5 rounded-full font-semibold">
          Visión Global 2026
        </span>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KPICard
          label="Ventas Netas"
          value={`$${fmt(t?.ventasNetasUSD || 0)}`}
        />
        <KPICard
          label="Margen Bruto"
          value={fmtP(t?.margenBrutoPct || 0)}
          sub={`$${fmt(t?.margenBrutoUSD || 0)}`}
          color="accent"
        />
        <KPICard
          label="Utilidad Neta"
          value={`$${fmt(t?.netoUSD || 0)}`}
          sub={`Margen: ${fmtP(t?.margenNetoPct || 0)}`}
          color={(t?.netoUSD || 0) >= 0 ? 'success' : 'danger'}
        />
        <KPICard
          label="Cumplimiento Meta"
          value={fmtP(t?.cumplimientoMetaAnual || 0)}
          sub={`Meta: $${fmt(t?.metaAnualUSD || 0)}`}
          color={(t?.cumplimientoMetaAnual || 0) >= 80 ? 'success' : 'accent'}
        />
      </div>

      {/* KPIs comerciales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <KPICard
          label="Total Presupuestos"
          value={t?.totalPresupuestos || 0}
          sub={`Monto: $${fmt(t?.totalMontoPresupuestadoUSD || 0)}`}
          color="info"
        />
        <KPICard
          label="Tasa Aprobación"
          value={fmtP(t?.tasaAprobacionGeneral || 0)}
          sub={`${t?.totalAprobados || 0} de ${t?.totalPresupuestos || 0}`}
          color="dso"
        />
        <KPICard
          label="Valor Cerrado"
          value={`$${fmt(t?.totalValorCerradoUSD || 0)}`}
          sub={`vs $${fmt(t?.totalMontoPresupuestadoUSD || 0)} presupuestado`}
          color="cash"
        />
      </div>

      {/* Resumen mensual en tabla */}
      <div className="chart-card">
        <h3 className="text-sm font-bold text-primary mb-3">📋 Resumen Mensual 2026</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-primary uppercase tracking-wider">
                <th className="text-left p-2 font-bold">Mes</th>
                <th className="p-2 font-bold">Ventas Netas</th>
                <th className="p-2 font-bold">Margen Bruto</th>
                <th className="p-2 font-bold">Gastos</th>
                <th className="p-2 font-bold">EBIT</th>
                <th className="p-2 font-bold">Neto</th>
                <th className="p-2 font-bold">% Meta</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => (
                <tr key={m.mes} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-2 font-semibold text-left">{m.mes_nombre}</td>
                  <td className="p-2 font-mono">${fmt(m.ventasNetasUSD)}</td>
                  <td className={`p-2 font-mono ${m.margenBrutoPct >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {fmtP(m.margenBrutoPct)}
                  </td>
                  <td className="p-2 font-mono">${fmt(m.totalGastosUSD)}</td>
                  <td className={`p-2 font-mono ${m.ebitUSD >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${fmt(m.ebitUSD)}
                  </td>
                  <td className={`p-2 font-mono font-bold ${m.netoUSD >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${fmt(m.netoUSD)}
                  </td>
                  <td className="p-2 font-mono">{fmtP(m.cumplimientoMeta)}</td>
                </tr>
              ))}
              {meses.length > 0 && (
                <tr className="border-t-2 border-primary bg-primary/5 font-bold">
                  <td className="p-2 text-left">TOTAL</td>
                  <td className="p-2 font-mono">${fmt(t?.ventasNetasUSD || 0)}</td>
                  <td className="p-2 font-mono text-green-700">{fmtP(t?.margenBrutoPct || 0)}</td>
                  <td className="p-2 font-mono">${fmt(t?.totalGastosUSD || 0)}</td>
                  <td className="p-2 font-mono text-green-700">${fmt(t?.ebitUSD || 0)}</td>
                  <td className="p-2 font-mono text-green-700">${fmt(t?.netoUSD || 0)}</td>
                  <td className="p-2 font-mono">{fmtP(t?.cumplimientoMetaAnual || 0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}