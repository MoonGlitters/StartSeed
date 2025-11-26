import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { AppContext } from "../../context/AppContext";

// URLs desde variables de entorno
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

export const Checkout = () => {
  const navigate = useNavigate();
  const { userData, clearCartVisual, saveCartSnapshot, restoreCartSnapshot, configGlobal } = useContext(AppContext);

  // Estados
  const [mp, setMp] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [idVenta, setIdVenta] = useState(null);
  const [status, setStatus] = useState("loading");
  const [amount, setAmount] = useState(0);

  // Guarda el carrito actual y limpia su visualización
  useEffect(() => {
    saveCartSnapshot();
    clearCartVisual();
  }, []);

  // Inicializa el SDK de Mercado Pago
  useEffect(() => {
    if (window.MercadoPago) {
      const mercadoPagoInstance = new window.MercadoPago(publicKey, {
        locale: "es-CL",
      });
      setMp(mercadoPagoInstance);
    } else {
      toast.error("Error al cargar Mercado Pago. Recarga la página.");
    }
  }, []);

  // Llama al backend para crear la preferencia
  useEffect(() => {
    const crearPreferencia = async () => {
      try {
        toast.loading("Preparando tu pago...");

        const res = await axios.post(
          `${backendUrl}/api/pago/checkout`,
          {},
          { withCredentials: true }
        );
        toast.dismiss();

        if (res.data.success && res.data.preferenceId) {
          setPreferenceId(res.data.preferenceId);
          setIdVenta(res.data.id_venta);
          setAmount(parseInt(res.data.total));
          setStatus("ready");
          toast.success("Checkout listo para pagar");
        } else {
          throw new Error(res.data.message || "No se pudo crear la preferencia");
        }
      } catch (error) {
          toast.dismiss();
          setStatus("error");
          const backendMsg = error.response?.data?.message || error.message;
          toast.error(backendMsg);
          console.error("Error al generar preferencia:", backendMsg);
        }
    };

    crearPreferencia();
  }, []);

  // Renderiza el Brick de pago de Mercado Pago
  useEffect(() => {
    if (!mp || !preferenceId) return;

    const bricksBuilder = mp.bricks();

    bricksBuilder.create("payment", "paymentBrick_container", {
      initialization: {
        amount,
        preferenceId,
      },
      customization: {
        visual: { style: { theme: "default" } },
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          ticket: "all",
          bankTransfer: "all",
        },
      },
      callbacks: {
        // Cuando el Brick está listo
        onReady: () => {},

        // Si ocurre un error en el Brick
        onError: (error) => {
          console.error("Error al renderizar el Brick:", error);
          toast.error("Error al cargar el Brick de pago");
        },

        // Cuando el usuario confirma el pago
        onSubmit: (formData) => {
              return fetch(`${backendUrl}/api/pago/process_payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ formData, id_venta: idVenta }),
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "approved") {
                toast.success("Pago aprobado");
                navigate("/success");
                } else if (data.status === "in_process") {
                toast("Pago en proceso");
                navigate("/pending");
                } else {
                toast.error("Pago rechazado");
                navigate("/failure");
                }
            })
            .catch(() => {
                toast.error("Error al procesar el pago");
            });
            },  
      },
      mercadoPago: mp,
    });
  }, [mp, preferenceId, idVenta]);

  // Interfaz del componente
  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Finaliza tu compra</h2>
        <button
          onClick={() => {
            restoreCartSnapshot();
            navigate("/carrito");
          }}
          className="text-sm text-emerald-700 font-medium hover:underline transition"
        >
          ← Volver al carrito
        </button>
      </div>

      {/* Estado de carga */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-emerald-500 mb-4"></div>
          <p>Preparando el checkout seguro...</p>
        </div>
      )}

      {/* Error al generar preferencia */}
      {status === "error" && (
        <div className="p-4 bg-red-50 text-red-700 text-center rounded-lg">
          Error al generar la preferencia.
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Reintentar
            </button>
            <button
              onClick={() => {
                restoreCartSnapshot();
                navigate("/carrito");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resumen de direccion */}
      <div className="border border-gray-200 rounded-xl p-4 bg-green-50 mb-6">
        <h3 className="text-lg font-semibold text-green-700 mb-2">
          Dirección de envío
        </h3>

        {userData?.calle && userData?.comuna && userData?.region ? (
          <div className="text-gray-700 text-sm">
            <p className="font-medium text-gray-800">
              {userData.calle}, {userData.comuna}, {userData.region}
            </p>
            <p className="text-green-700 mt-1">
               Esta será la dirección utilizada para tu compra.
            </p>
          </div>
        ) : (
          <div className="text-red-600 text-sm">
             Debes completar tu dirección antes de finalizar la compra.
            <p className="mt-1">
              Puedes hacerlo desde <span className="font-semibold">“Mi Perfil”</span> en tu cuenta.
            </p>
          </div>
        )}
      </div>
      {/* Datos con y sin iva*/}
      <div className="border border-gray-200 rounded-xl p-4 bg-white mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Resumen de tu compra
        </h3>

        <div className="text-gray-700 text-sm space-y-1">
          <p>
            Subtotal (sin IVA):{" "}
            <span className="font-medium">
              ${(amount / (1 + (configGlobal?.iva_porcentaje || 19) / 100)).toLocaleString("es-CL")}
            </span>
          </p>
          <p>
            IVA ({configGlobal?.iva_porcentaje || 19}%):{" "}
            <span className="font-medium">
              ${(amount - amount / (1 + (configGlobal?.iva_porcentaje || 19) / 100)).toLocaleString("es-CL")}
            </span>
          </p>
          <p className="text-lg font-bold text-green-700 mt-2">
            Total con IVA: ${amount.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {/* Contenedor del Brick */}
      <div id="paymentBrick_container" className="mt-6"></div>

      {/* Botón para cancelar compra */}
      <button
        onClick={() => {
          restoreCartSnapshot();
          navigate("/carrito");
        }}
        className="mt-6 w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
      >
        Cancelar compra
      </button>
    </div>
  );
};
