import { getHistorialDeCompraServicio } from "../servicios/compras.servicio.js";


export const getHistorialDeCompraController = async (req, res) => {
    
    const id_usuario = req.userid; 

    try {
        
        const historial = await getHistorialDeCompraServicio(id_usuario);

        if (!historial || historial.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "Aún no tienes compras realizadas.",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            data: historial
        });

    } catch (error) {
        console.error("Error al obtener el historial de compras:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Ocurrió un error interno al cargar tu historial." 
        });
    }
};