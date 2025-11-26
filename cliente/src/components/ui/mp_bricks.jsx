import { loadMercadoPago } from "@mercadopago/sdk-js";
import axios from "axios";

await loadMercadoPago();

const id_usuario = ''

const mp = new window.MercadoPago(import.meta.env.MP_PUBLIC_KEY, { locale: "es-CL" });

const { id_venta, total } = await axios.post("/checkout", { method: "POST", body: JSON.stringify({ id_usuario }) }).then(r => r.json());

const bricksBuilder = mp.bricks();
const renderCardPayment = async () => {
    await bricksBuilder.create(
        "cardPayment",
        "paymentBrick_container",
        {
            initialization: {
                amount: total,
                externalReference: id_venta
            },
            callbacks: {
                onPaymentApproved: async (paymentData) => {
                    await fetch("/mp/pago", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(paymentData)
                    });
                    alert("Pago aprobado!");
                },
                onError: (err) => console.error(err)
            }
        }
    );
};

renderCardPayment();