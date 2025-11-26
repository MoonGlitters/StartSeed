import { TransaccionMP } from '../configuracion/sequelize.js';

export const transaccionMPRepositorio = {

  findByPaymentId: async (payment_id, t = null) => {
    const pid = String(payment_id); 
    return await TransaccionMP.findOne({
      where: { payment_id: pid },
      transaction: t,
    });
  },

  createTransaccionMP: async (data, t = null) => {
    try {
      const record = {
        id_venta: String(data.id_venta),         
        payment_id: String(data.payment_id),     
        status: data.status,
        status_detail: data.status_detail || null,
        date_approved: data.date_approved || null,
        payer_email: data.payer_email || null,
        mp_raw: data.mp_raw || {},
        unique_key: `${data.id_venta}-${data.payment_id}`, 
        processed: false,
      };

      const nuevaTransaccion = await TransaccionMP.create(record, {
        transaction: t,
      });

      console.log(`Transacción MP creada: ${record.payment_id}`);
      return nuevaTransaccion;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        console.warn(`Transacción duplicada ignorada: ${data.payment_id}`);
        return null;
      }
      console.error("Error al crear transacción MP:", error.message);
      throw error;
    }
  },
};
