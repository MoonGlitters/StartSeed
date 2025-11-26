export const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: "usuarios", label: "Usuarios" },
    { id: "solicitudes-empresa", label: "Solicitudes Empresa" },
    { id: "solicitudes-desembolso", label: "Solicitudes Desembolso" },
    { id: "configuracion-global", label: "Configuración Global" },
    { id: "empresas", label: "Empresas"},
    ];

  return (
    <aside className="h-full bg-white/95 backdrop-blur-sm shadow-md border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-green-700 select-none">Admin</h2>
        <p className="text-sm text-gray-500">Gestión del sistema</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-all duration-200
              ${
                activeTab === item.id
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-green-100 hover:text-green-700"
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar