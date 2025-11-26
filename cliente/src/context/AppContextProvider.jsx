import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/$/, "");

  // Estados globales
  const [userData, setUserData] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [configGlobal, setConfigGlobal] = useState(null);

//logout 
  const logoutUser = async () => {
    const navigate = useNavigate();
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}
    setUserData(null);
    setIsLoggedin(false);
    navigate("/login");
  };

  // --- Sesion y usuario ---
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, { withCredentials: true });
      if (data.success) {
        const user = data.userData; 
              
        setUserData(user);
        setIsLoggedin(true);

        // Chequea estado del usuario
        if (user.estado === "inactiva") {
          toast.error("Tu cuenta fue inactivada. Contacta con soporte.");
          await logoutUser();
          return;
        }

        if (user.estado === "suspendida") {
          const fecha = new Date(user.suspension_expira_at).toLocaleString("es-CL", {
            dateStyle: "long",
            timeStyle: "short",
          });
          toast.warn(`Tu cuenta está suspendida hasta ${fecha}.`);
          await logoutUser();
          return;
        }
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch {
      setUserData(null);
      setIsLoggedin(false);
    }
  };

  //Obtener configuracion global 
  const fetchConfigGlobal = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/conf`, {
        withCredentials: true,
      });  
      if (data.success) setConfigGlobal(data.config);
    } catch (error) {
      console.error("Error obteniendo config global:", error);
    }
  };


  // -verifica sesion, si hay cookie valida
  const verificarSesion = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/is-auth`, {}, { withCredentials: true });
      if (data.success) await getUserData();
      else setIsLoggedin(false);
    } catch {
      setIsLoggedin(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Carrito ---
  const fetchCartItems = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/carrito`, { withCredentials: true });
      if (data?.success) {
        setCartItems(data.items || []);
        const total = data.items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
        setCartCount(total);
        
      } else {
        setCartItems([]);
        setCartCount(0);
      }
    } catch {
      setCartItems([]);
      setCartCount(0);
    }
  };

  const refreshCartCount = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/carrito`, { withCredentials: true });
      const items = data?.items || [];
      setCartCount(items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0));
    } catch {
      setCartCount(0);
    }
  };

  // Vaciar carrito en backend y frontend
  const clearCart = async () => {
    try {
      await axios.delete(`${backendUrl}/api/carrito`, { withCredentials: true });
    } catch (error) {
      console.error("Error al vaciar carrito:", error);
    }
    setCartItems([]);
    setCartCount(0);
    window.dispatchEvent(new Event("cartCleared"));
  };

  // Limpia el carrito solo en memoria (para checkout)
  const clearCartVisual = () => {
    setCartItems([]);
    setCartCount(0);
    window.dispatchEvent(new Event("cartCleared"));
  };

  // Guarda una copia del carrito antes de pagar
  const saveCartSnapshot = () => {
    try {
      sessionStorage.setItem("cartBackup", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  };

  // Restaura carrito si cancela
  const restoreCartSnapshot = () => {
    try {
      const snapshot = sessionStorage.getItem("cartBackup");
      if (snapshot) {
        const items = JSON.parse(snapshot);
        setCartItems(items);
        const total = items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
        setCartCount(total);
        window.dispatchEvent(new Event("cartRestored"));
      }
      sessionStorage.removeItem("cartBackup");
    } catch (error) {
      console.error("Error restaurando carrito:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${backendUrl}/api/carrito/items/${itemId}`, {
        withCredentials: true,
      });
      await fetchCartItems(); // actualiza el contador y la lista
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // Sincroniza cambios del carrito
  useEffect(() => {
    const syncCartEvents = (e) => {
      if (e.type === "cartCleared") {
        setCartItems([]);
        setCartCount(0);
      } else if (e.type === "cartRestored") {
        fetchCartItems();
      }
    };

    window.addEventListener("cartCleared", syncCartEvents);
    window.addEventListener("cartRestored", syncCartEvents);

    return () => {
      window.removeEventListener("cartCleared", syncCartEvents);
      window.removeEventListener("cartRestored", syncCartEvents);
    };
  }, []);

  // Inicializacion
  useEffect(() => {
    verificarSesion();
    fetchConfigGlobal();
  }, []);

  useEffect(() => {
    if (isLoggedin) fetchCartItems();
  }, [isLoggedin]);

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        userData,
        setUserData,
        getUserData,
        isLoggedin,
        setIsLoggedin,
        loading,
        cartCount,
        cartItems,
        fetchCartItems,
        refreshCartCount,
        clearCart,
        clearCartVisual,
        saveCartSnapshot,
        restoreCartSnapshot,
        removeFromCart,
        fetchConfigGlobal,
        configGlobal,
        setConfigGlobal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
