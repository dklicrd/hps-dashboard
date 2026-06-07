import { useAuth } from '../hooks/useAuth';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function Sidebar({ activeView, onNavigate }) {
  const { usuario, logout, esAdmin } = useAuth();

  return (
    <aside className="w-64 bg-primary text-white flex flex-col fixed inset-y-0 left-0 z-50 shadow-lg overflow-y-auto">
      <div className="px-5 py-5 border-b border-white/20">
        <h2 className="text-sm font-bold leading-tight opacity-95">
          DIVISIÓN ARBOLEDA<br />HPS-IMPORT
        </h2>
        <p className="text-[10px] opacity-60 mt-1">Dashboard Integral 2026</p>
      </div>

      <nav className="flex-1 py-2">
        <p className="px-5 py-2 text-[10px] uppercase tracking-widest opacity-50 font-bold">
          Inicio
        </p>
        <SidebarButton
          icon="📊"
          label="Dashboard KPIs"
          active={activeView === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />

        <p className="px-5 py-2 mt-2 text-[10px] uppercase tracking-widest opacity-50 font-bold">
          Entrada Mensual
        </p>
        {MESES.map((nombre, i) => (
          <SidebarButton
            key={i}
            icon="📅"
            label={nombre}
            active={activeView === `mes-${i + 1}`}
            onClick={() => onNavigate(`mes-${i + 1}`)}
          />
        ))}

        <p className="px-5 py-2 mt-2 text-[10px] uppercase tracking-widest opacity-50 font-bold">
          Análisis
        </p>
        <SidebarButton
          icon="🔄"
          label="Rentabilidad Integral"
          active={activeView === 'rentabilidad'}
          onClick={() => onNavigate('rentabilidad')}
        />
        <SidebarButton
          icon="📈"
          label="Resumen Anual"
          active={activeView === 'anual'}
          onClick={() => onNavigate('anual')}
        />
      </nav>

      <div className="px-5 py-3 border-t border-white/20 flex items-center justify-between text-[11px] opacity-60">
        <span>{usuario?.nombre}</span>
        <button
          onClick={logout}
          className="border border-white/30 px-2 py-1 rounded-full text-[10px] hover:bg-white/20 transition"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-2.5 text-sm transition border-l-3 ${
        active
          ? 'bg-white/15 text-white font-semibold border-l-accent'
          : 'text-white/75 hover:bg-white/5 hover:text-white border-l-transparent'
      }`}
    >
      {icon} {label}
    </button>
  );
}