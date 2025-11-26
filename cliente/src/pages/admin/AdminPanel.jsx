import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminUsuarios from "./AdminUsuarios";
import AdminSolicitudesEmpresa from "./AdminSolicitudesEmpresa";
import AdminSolicitudesDesembolso from "./AdminSolicitudesDesembolso";
import AdminConfiguracionGlobal from "./AdminConfiguracionGlobal";
import AdminEmpresas from './AdminEmpresas'
import { Card, CardContent } from "@/components/ui/card";
import { Menu } from "lucide-react";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "usuarios":
        return <AdminUsuarios />;
      case "solicitudes-empresa":
        return <AdminSolicitudesEmpresa />;
      case "solicitudes-desembolso":
        return <AdminSolicitudesDesembolso />;
      case "configuracion-global":
        return <AdminConfiguracionGlobal />;
      case "empresas":
        return <AdminEmpresas />;
      default:
        return <AdminUsuarios />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white via-green-50 to-amber-100">
      {/* Botón menú móvil */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <h1 className="text-xl font-bold text-green-700">Panel Admin</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-green-100"
        >
          <Menu className="w-6 h-6 text-green-700" />
        </button>
      </div>

      {/* Sidebar: fijo en desktop, deslizable en móvil */}
      <div
        className={`fixed md:static z-40 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 w-64`}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Card className="border border-gray-200 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-4 md:mb-6">
              Panel Administrativo
            </h1>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 md:p-6">
              {renderContent()}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Fondo oscuro para cerrar menú móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
