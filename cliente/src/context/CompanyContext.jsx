import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "./AppContext.jsx";
import { toast } from "react-toastify";

export const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const { backendUrl, userData } = useContext(AppContext);
  const [empresaUsuario, setEmpresaUsuario] = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);

  const getEmpresaUsuario = async () => {
  if (!userData) return;

  setLoadingEmpresa(true);
  try {
    const { data } = await axios.get(`${backendUrl}/api/empresa/usuario`, { withCredentials: true });
    setEmpresaUsuario(data.empresa || null);
  } catch (error) {
    // Ignorar 404: usuario sin empresa
    if (error.response?.status === 404) {
      setEmpresaUsuario(null);
    } else {
      toast.error("Error al cargar la empresa del usuario");
      setEmpresaUsuario(null);
    }
  } finally {
    setLoadingEmpresa(false);
  }
};

  useEffect(() => {
    getEmpresaUsuario();
  }, [userData]);

  return (
    <CompanyContext.Provider value={{ empresaUsuario, setEmpresaUsuario, loadingEmpresa, getEmpresaUsuario }}>
      {children}
    </CompanyContext.Provider>
  );
};
