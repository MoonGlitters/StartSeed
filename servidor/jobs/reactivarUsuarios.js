import cron from "node-cron";
import { reactivarUsuariosSuspendidosVencidos } from "../servicios/usuario.servicio.js";

export const reactivarUsuariosJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Revisando usuarios suspendidos...");

        try {
        const reactivados = await reactivarUsuariosSuspendidosVencidos();

        if (reactivados.length > 0) {
            console.log(`[CRON] ${reactivados.length} usuarios reactivados automáticamente:`);
            reactivados.forEach(u =>
            console.log(`Usuario ID: ${u.id}, Email: ${u.email}`)
            );
        } else {
            console.log("[CRON] Ningún usuario requería reactivación.");
        }
        } catch (error) {
        console.error("[CRON ERROR] Fallo al reactivar usuarios:", error.message);
        }
    });
};