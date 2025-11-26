import { ventaRepositorio } from "../repositorios/venta.repositorio.js";


export const getHistorialDeCompraServicio = async (id_usuario) => {
    const historial = await ventaRepositorio.getPurchaseHistory(id_usuario);
    // añadir logica de negocios

    return historial;
};