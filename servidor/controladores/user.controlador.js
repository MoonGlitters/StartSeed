
import { Usuario } from '../configuracion/sequelize.js';
import { subirArchivoS3 } from '../utils/awsS3.js';
import { suspensionUsuarioTemporal, actualizarEstadoUsuario } from '../servicios/usuario.servicio.js';

//GET
export const getUserData = async (req, res) => {
    try {
        const userid = req.userid;

        const usuario = await Usuario.findOne({where: {id: userid}})

        if (!usuario) {
            return res.json({ success:false, message: 'Usuario no encontrado'})
        }

        res.json({
            success:true, 
            userData: {
                username: usuario.username,
                email: usuario.email,
                email_verificado: usuario.is_email_verified,
                telefono_verificado: usuario.is_telefono_verified,
                role: usuario.role,
                url_img_perfil: usuario.url_img_perfil || "",
                numero: usuario.numero,
                region :usuario.region,
                comuna: usuario.comuna,
                calle: usuario.calle,
                villa: usuario.villa,
                telefono: usuario.telefono,
                referencia: usuario.referencia_direccion,
                nombre : usuario.nombre,
                apellido: usuario.apellido,
            }})
        
    } catch (error) {
        res.json({ success:false, message: error.message})
    }
}


export const usuarioId = async (req, res) => {

    const { id } = req.params
    
    try {
        const usuario = await Usuario.findOne({where: {id}})
    
        if (!usuario) {
        return res.status(404).json({ success: false, message: "usuario no encontrada" });
        }

        return res.status(200).json({success: true, data:usuario})
        
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

export const usuarioAll = async (req, res) => {
    
    try {
        const usuario = await Usuario.findAll();
    
        if (!usuario) {
        return res.status(404).json({ success: false, message: "usuario no encontrada" });
        }

        return res.status(200).json({success: true, data:usuario})
        
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

// PATCH 

export const editarUsuario = async (req, res) => {
    // Obtenemos el ID del usuario desde el middleware de autenticación
    const userid = req.userid;

    // Archivo de imagen enviado desde el formulario
    const img_perfil = req.file;

    try {
        // Buscamos el usuario en la base de datos
        const usuario = await Usuario.findOne({ where: { id: userid } });

        if (!usuario) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Inicializamos la URL de la imagen con la que ya tiene el usuario
        let url_img_perfil = usuario.url_img_perfil;

        // Si se envió un nuevo archivo, subimos a S3
        if (img_perfil) {
            try {
                console.log("Subiendo nueva imagen a S3...");
                url_img_perfil = await subirArchivoS3(img_perfil, 'perfil', userid);
                console.log("Imagen subida con éxito:", url_img_perfil);
            } catch (uploadError) {
                console.error("Error al subir la imagen:", uploadError);
                return res.status(500).json({ success: false, message: "Error al subir imagen de perfil" });
            }
        }

        // Limpiamos espacios en todos los campos de texto del body
        const cleanedBody = {};
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                cleanedBody[key] = req.body[key].trim();
            } else {
                cleanedBody[key] = req.body[key];
            }
        }

        // Actualizamos el usuario con los nuevos datos y la URL de la imagen
        await usuario.update({
            ...cleanedBody,
            url_img_perfil
        });

        // Retornamos respuesta exitosa
        return res.status(200).json({
            success: true,
            message: "Usuario actualizado con éxito",
            data: usuario
        });

    } catch (error) {
        // En caso de error, lo mostramos en consola y devolvemos error 500
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({
            success: false,
            message: "Error al actualizar usuario",
            error: error.message
        });
    }
};


// DELETE

export const eliminarUsuario = async (req, res) => {

    const userid = req.userid
    
    try {
        const usuario = await Usuario.findOne({where: {id:userid}})
    
        if (!usuario) {
        return res.status(404).json({ success: false, message: "usuario no encontrada" });
        }

        return res.status(200).json({success: true,message:'usuario eliminada con exito!'})
        
    } catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
}

// suspencion temporal

export const suspenderUsuarioController = async (req, res) => {
        try {
        const { id } = req.params;
        const { duracion } = req.body;
     
        
        if (!duracion || typeof duracion !== 'number' || duracion <= 0) {
            return res.status(400).json({ success: false, message: 'Debe especificar una duracion valida en dias para la suspensión temporal.' });
        }

        const user = await suspensionUsuarioTemporal(id, duracion);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        const fechaFormated = new Date(user.suspension_expira_at).toLocaleString("es-CL", {
        dateStyle: "long",
        timeStyle: "short",
        });

        // responder con fecha bonita
        res.status(200).json({
            success: true,
            message: `Usuario suspendido temporalmente hasta ${fechaFormated}. La empresa asociada ha sido inactivada.`,
            data: user,
            });
        } catch (error) {
        console.error("Error en suspenderUsuarioController:", error); 
        res.status(500).json({ success: false, message: error.message || 'Error interno del servidor.' });
        }
}

// inactivar usuario

export const cambiarEstadoUsuarioController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await actualizarEstadoUsuario(id);
        
        res.status(200).json({ success: true, message: `Usuario actualizado correctamente.`, data: user });
    } catch (error) {
        console.error("Error en updateUserState:", error);
        res.status(500).json({ success: false, message: error.message || 'Error interno del servidor.' });
    }
}