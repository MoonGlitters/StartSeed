import { sequelize, Empresa  } from "../configuracion/sequelize.js";
import { empresaRepositorio } from "../repositorios/empresa.repositorio.js";
import { usuarioRepositorio } from "../repositorios/usuario.repositorio.js";

export const suspensionUsuarioTemporal = async (userId, duracion) => {
    
    return await sequelize.transaction(async (t) => {
        if (!Number.isInteger(duracion) || duracion <= 0) {
        throw new Error("Duración inválida para suspensión.");
        }

        const user = await usuarioRepositorio.findById(userId, { transaction: t });
        if (!user) throw new Error("Usuario no encontrado.");
        if (user.estado === "suspendida") throw new Error("El usuario ya está suspendido.");

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + duracion);

        await usuarioRepositorio.updateUserStatusAndExpiry(
        userId,
        "suspendida",
        expirationDate,
        { transaction: t } 
        );


        if (user.has_empresa) {
        const empresa = await Empresa.findOne({
            where: { id_usuario: userId },
            transaction: t,
            });

        if (empresa) {
            await empresaRepositorio.updateEmpresaStatus(
            empresa.id,
            "inactiva",
            { transaction: t }
            );
        }
        }

        const userActualizado = await usuarioRepositorio.findById(userId, { transaction: t });

        // Retornar el usuario actualizado
        return userActualizado;

    });
};


export const actualizarEstadoUsuario = async (id) => {
    const transiciones = {
        activa: "inactiva",
        inactiva: "activa",
        suspendida: "activa"
    };

    return sequelize.transaction(async (t) => {
        const user = await usuarioRepositorio.findById(id, { transaction: t });
        if (!user) throw new Error("Usuario no encontrado.");

        const nuevoEstado = transiciones[user.estado];
        if (!nuevoEstado) throw new Error(`Estado de usuario desconocido: ${user.estado}`);

        await usuarioRepositorio.updateUserStatusAndExpiry(
        id,
        nuevoEstado,
        nuevoEstado === "activa" ? null : user.suspension_expira_at,
        { transaction: t }
        );

        return usuarioRepositorio.findById(id, { transaction: t });
    });
};

export const reactivarUsuariosSuspendidosVencidos = async () => {
    return await sequelize.transaction(async (t) => {
        const usuarios = await usuarioRepositorio.findUsuariosSuspendidosVencidos(t);
        const reactivados = [];

        for (const user of usuarios) {
            const actualizado = await usuarioRepositorio.reactivarUsuario(user, t);
            reactivados.push(actualizado);
        }

        return reactivados;
        });
};