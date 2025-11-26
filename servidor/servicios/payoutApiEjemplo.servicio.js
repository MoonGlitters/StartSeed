
export const payoutApi = {
    realizarTransferencia: async (datosReceptor, monto, referenciaInterna) => {
        
        // Simulación de latencia
        await new Promise(resolve => setTimeout(resolve, 75));

        if (monto <= 500) {
            throw new Error("API Payout: El monto de la transferencia es inferior al mínimo permitido por el banco (500).");
        }
        if (!datosReceptor.numero_cuenta || !datosReceptor.rut_titular || !datosReceptor.banco_nombre) {
            throw new Error("API Payout: Datos bancarios del receptor incompletos.");
        }
        if (!referenciaInterna) {
            throw new Error("API Payout: Requiere una referencia interna (ID Solicitud) para trazabilidad.");
        }
        
        const requestBody = {
            recipient: {
                document_number: datosReceptor.rut_titular,
                name: datosReceptor.nombre_titular,
                bank_code: datosReceptor.banco_nombre, 
                account: datosReceptor.numero_cuenta,
                account_type: datosReceptor.tipo_cuenta,
                country_code: 'CL' 
            },
            transaction: {
                amount: parseFloat(monto.toFixed(2)),
                currency: 'CLP',
                external_id: referenciaInterna, 
                description: `Pago Ganancias Plataforma - Ref: ${referenciaInterna}`, 
                webhook_url: `${API_CONFIG_MOCK.endpoint}/status-update` 
            }
        };

        const { recipient, transaction } = requestBody;

        if (transaction.amount <= 500) {
            throw new Error("API Payout Mock: El monto de la transferencia es inferior al mínimo permitido por el banco (500).");
        }
        if (!recipient.account || !recipient.document_number || !recipient.bank_code) {
            throw new Error("API Payout Mock: Datos bancarios del receptor incompletos en el request.");
        }

        if (recipient.account === '00000' || Math.random() < 0.05) {
            console.error(`[Payout API] Fallo simulado para referencia: ${transaction.external_id}`);
            throw new Error("Error de conexión o cuenta bloqueada. Transacción rechazada.");
        }
        const transferId = `TRX-${Math.floor(Math.random() * 90000000) + 10000000}`;
        
        const responseData = {
            status: 'success',
            transferId: transferId, 
            externalId: transaction.external_id,
            message: 'Transferencia aceptada para procesamiento.'
        };

        console.log(`[Payout API Mock] Transf. iniciada. ID Externo: ${responseData.transferId} (Ref. Int.: ${responseData.externalId})`);
        
        return responseData.transferId; 
    }
};
