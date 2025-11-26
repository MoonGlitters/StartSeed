import React, { useState } from 'react';
import axios from 'axios'

// Ajusta el puerto y la ruta de tu API
const API_URL = 'http://localhost:4000/api/empresa/prueba-archivo'; 

export const PruebaSubidaArchivo = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [urlS3, setUrlS3] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Captura el objeto File
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setUrlS3('');

        if (!file) {
            setMessage('Por favor, selecciona un archivo.');
            setLoading(false);
            return;
        }

        try {
            // Usar FormData para enviar archivos
            const formData = new FormData();
            // Que el nombre coincida con el que se recibe en servidor
            formData.append('archivo', file); 

            // Realizar la petición
            const response = await axios.post(API_URL, formData);

            const result = await response.data;

            if (response.ok) {
                setMessage('¡Subida exitosa!');
                setUrlS3(result.url_s3); // Captura la URL devuelta
            } else {
                setMessage(`Error: ${result.mensaje || 'Fallo desconocido'}`);
            }
        } catch (error) {
            setMessage(`Error de red: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '2px solid #007bff', borderRadius: '10px' }}>
            <h3>Prueba de Subida a S3</h3>
            <p>Ruta de prueba: <code>POST /prueba-archivo</code></p>
            <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', margin: '15px 0 5px', fontWeight: 'bold' }}>
                    Seleccionar Archivo (Campo "archivo"):
                </label>
                <input 
                    type="file" 
                    name="archivo" 
                    onChange={handleFileChange} 
                    required 
                    style={{ display: 'block', margin: '10px 0' }}
                />
                
                <button 
                    type="submit" 
                    disabled={loading || !file} 
                    style={{ padding: '10px 20px', backgroundColor: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {loading ? 'Subiendo...' : 'Subir a S3 y Obtener URL'}
                </button>
            </form>
            
            <hr style={{ margin: '20px 0' }}/>
            
            {/* Resultados */}
            {message && <p style={{ color: urlS3 ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
            {urlS3 && (
                <div>
                    <p style={{ fontWeight: 'bold' }}> URL Pública Generada:</p>
                    <a href={urlS3} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', color: '#007bff' }}>
                        {urlS3}
                    </a>
                </div>
            )}
        </div>
    );
};