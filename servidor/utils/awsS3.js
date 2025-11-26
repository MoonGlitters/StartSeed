import { s3Client, BUCKET_NAME } from "../configuracion/aws.js";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

export const subirArchivoS3 = async (file, carpeta = "generico", id_entidad, nombre_archivo) => {
    
    if (!file || !file.originalname) {
        throw new Error("Objeto de archivo inválido o faltante.");
    }
    
    const fileNameSafe = nombre_archivo || Date.now().toString(); 
    
    const fileExtension = file.originalname.split(".").pop();
    
    const key = `${carpeta}/${id_entidad}/${fileNameSafe}.${fileExtension}`; 

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        },
    });

    const data = await upload.done();
    return data.Location;
};