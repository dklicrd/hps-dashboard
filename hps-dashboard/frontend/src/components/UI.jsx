export default function KPICard({ label, value, sub, color = 'default' }) {
  const colorClasses = {
    default: 'text-primary',
    accent: 'text-accent',
    success: 'text-green-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
    cash: 'text-cash',
    dso: 'text-dso',
  };

  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${colorClasses[color] || colorClasses.default}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export function ChartCard({ title, children, fullWidth = false }) {
  return (
    <div className={`chart-card ${fullWidth ? 'col-span-2' : ''}`}>
      <h3 className="text-sm font-bold text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function FormCard({ title, children, accent = true }) {
  return (
    <div className="form-card">
      {title && (
        <h3 className={`text-base font-bold text-primary mb-4 pb-2 inline-block ${
          accent ? 'border-b-2 border-accent' : ''
        }`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function AlertBox({ type = 'info', children }) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-600 text-yellow-800',
    info: 'bg-blue-50 border-blue-600 text-blue-900',
    danger: 'bg-red-50 border-red-600 text-red-800',
    success: 'bg-green-50 border-green-600 text-green-800',
  };

  return (
    <div className={`px-4 py-3 rounded-lg text-sm border-l-4 ${styles[type] || styles.info}`}>
      {children}
    </div>
  );
}