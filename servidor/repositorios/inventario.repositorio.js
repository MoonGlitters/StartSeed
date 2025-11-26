import { Inventario } from '../configuracion/sequelize.js';

export const inventarioRepositorio = {
  findInventory: (id_producto, t) => {
    return Inventario.findOne({
      where: { id_producto },
      transaction: t,
    });
  },

  saveInventory: async (inventario, t) => {
    if (!inventario || !inventario.id_producto) {
      throw new Error("Inventario inválido o sin id_producto definido");
    }

    await Inventario.update(
      { stock_actual: inventario.stock_actual },
      { where: { id_producto: inventario.id_producto }, transaction: t }
    );
  },
};
