import { cuentaBancariaRepositorio } from "../repositorios/cuentaBancaria.repositorio.js";
import { empresaRepositorio } from "../repositorios/empresa.repositorio.js"

const VALID_ACCOUNT_TYPES = ['Corriente', 'Ahorro', 'Vista'];

export const updateDatosBancarios = async (userId, datosBancarios) => {

    const empresa = await empresaRepositorio.findByUserId(userId);

    if (!empresa) {

        throw new Error("Empresa no encontrada.");

    }

    const { banco_nombre, tipo_cuenta, numero_cuenta, rut_titular, nombre_titular } = datosBancarios;

    if (!banco_nombre || !tipo_cuenta || !numero_cuenta || !rut_titular || !nombre_titular) {
        throw new Error("Todos los campos bancarios son obligatorios.");
    }
    if (!VALID_ACCOUNT_TYPES.includes(tipo_cuenta)) {
        throw new Error("Tipo de cuenta no válido. Debe ser Corriente, Ahorro o Vista.");
    }

    const cuentaActualizada = await cuentaBancariaRepositorio.upsert(empresa.id, datosBancarios);

    return cuentaActualizada;

};

export const getDatosBancarios = async (userId) => {

    const empresa = await empresaRepositorio.findByUserId(userId);

    if (!empresa) {

        throw new Error("Empresa no encontrada.");

    }

    const cuenta = await cuentaBancariaRepositorio.findByEmpresaId(empresa.id);

    if (!cuenta) {

        return {}; 

    }

    return {
        banco_nombre: cuenta.banco_nombre,
        tipo_cuenta: cuenta.tipo_cuenta,
        numero_cuenta: cuenta.numero_cuenta,
        rut_titular: cuenta.rut_titular,
        nombre_titular: cuenta.nombre_titular
    };

};