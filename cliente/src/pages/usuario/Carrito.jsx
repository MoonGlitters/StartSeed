import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export const Carrito = () => {
  const { cartItems, fetchCartItems, removeFromCart, clearCart, configGlobal } =
    useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleVaciar = async () => {
    await clearCart();
    toast.info("Carrito vaciado");
  };

  const handleEliminarProducto = async (item) => {
    const idItem = item.id || item.itemId;
    await removeFromCart(idItem);
    toast.info("Producto eliminado del carrito");
  };

  // porcentaje IVA (19% o lo que defina configGlobal)
  const ivaDecimal = parseFloat(configGlobal?.iva_porcentaje || 19) / 100;

  // Calcular totales
  let subtotalSinIva = 0;
  cartItems.forEach((item) => {
    const precioBase = parseFloat(item.producto.precio) || 0;
    const cantidad = parseFloat(item.cantidad) || 1;
    subtotalSinIva += precioBase * cantidad;
  });

  const montoIva = Math.round(subtotalSinIva * ivaDecimal * 100) / 100;
  const totalConIva = Math.round((subtotalSinIva + montoIva) * 100) / 100;

  const format = (num) =>
    num.toLocaleString("es-CL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // Funcion para formatear precio unitario con IVA incluido
  const precioConIva = (precioBase) => {
    const precio = parseFloat(precioBase);
    if (isNaN(precio)) return 0;
    return precio * (1 + ivaDecimal);
  };

  return (
    <div className="min-h-screen bg-gradient-natural py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Tu Carrito
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-6">Tu carrito está vacío</p>
            <Link
              to="/productos"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Ir a productos
            </Link>
          </div>
        ) : (
          <>
            {/*  Listado de productos */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => {
                const precioUnitarioConIVA = precioConIva(item.producto.precio);
                const totalItem = precioUnitarioConIVA * item.cantidad;

                return (
                  <Card
                    key={item.id || item.itemId}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <img
                        src={
                          item.producto.url_imagen_principal ||
                          "https://placehold.co/100x100?text=Sin+imagen"
                        }
                        alt={item.producto.nombre}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h2 className="font-semibold text-lg text-gray-800">
                          {item.producto.nombre}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Cantidad: {item.cantidad}
                        </p>
                        <p className="text-sm text-gray-500">
                          Precio unitario (IVA incl.):{" "}
                          <span className="font-medium text-green-700">
                            ${format(precioUnitarioConIVA)}
                          </span>
                        </p>
                        <p className="text-green-700 font-semibold">
                          Total: ${format(totalItem)}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleEliminarProducto(item)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Quitar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/*  Desgloce */}
            <div className="border-t pt-4 text-right text-gray-700 space-y-1">
              <p>
                Subtotal (sin IVA):{" "}
                <span className="font-medium text-gray-900">
                  ${format(subtotalSinIva)}
                </span>
              </p>
              <p>
                IVA ({(ivaDecimal * 100).toFixed(2)}%):{" "}
                <span className="font-medium text-gray-900">
                  ${format(montoIva)}
                </span>
              </p>
              <p className="text-lg font-bold text-green-700 mt-2">
                Total con IVA: ${format(totalConIva)}
              </p>
            </div>

            {/*  Botones de accion */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t mt-6 pt-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleVaciar}
                  className="bg-gray-300 hover:bg-gray-400 text-black"
                >
                  Vaciar
                </Button>
                <Button
                  onClick={() => navigate("/checkout")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Ir a pagar
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
