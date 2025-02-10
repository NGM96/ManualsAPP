const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Agregar middleware CORS
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Agregar logging para debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

const CHAPTERS_PATH = 'C:/Users/Nico/Desktop/Autos/Fairlane/Manual desbloqueado/Webapp/Webapp/Capitulos/Ford fairlane';

// Verificar si el directorio existe
fs.access(CHAPTERS_PATH, fs.constants.F_OK, (err) => {
    if (err) {
        console.error('⚠️ ERROR: El directorio de capítulos no existe:', CHAPTERS_PATH);
    } else {
        console.log('✅ Directorio de capítulos encontrado:', CHAPTERS_PATH);
    }
});

// Configurar el servidor para servir archivos estáticos desde la carpeta de capítulos
app.use('/chapters', express.static(CHAPTERS_PATH));

// Definir las rutas estáticas de los PDFs
const CHAPTER_URLS = {
    'C1': 'https://storage.cloud.google.com/bucket_manuales_autos/Ford%20Fairlane/C1%20-%20Identificacion/C1%20-%20Identificacion.pdf?authuser=0',
    'C2': 'INGRESAR_URL',
    'C3': 'INGRESAR_URL',
    // ... resto de capítulos
};

app.post('/api/chapters', (req, res) => {
    const { marca, modelo } = req.body;
    
    if (marca?.toLowerCase() === 'ford' && modelo?.toLowerCase() === 'fairlane') {
        const chapters = [
            {
                id: 'C1',
                title: 'Identificacion',
                pdfUrl: CHAPTER_URLS['C1']
            },
            {
                id: 'C2',
                title: 'Frenos',
                pdfUrl: CHAPTER_URLS['C2']
            }
        ];

        res.json({
            success: true,
            chapters: chapters
        });
    } else {
        res.json({
            success: false,
            message: 'Manual no encontrado'
        });
    }
});

// Modificar el endpoint para obtener el PDF
app.get('/api/chapters/:chapterId/pdf', (req, res) => {
    const chapterId = req.params.chapterId;
    console.log('Solicitando PDF para capítulo:', chapterId);

    const pdfUrl = CHAPTER_URLS[chapterId];
    console.log('URL del PDF:', pdfUrl);

    if (!pdfUrl || pdfUrl === 'INGRESAR_URL') {
        console.error('URL no encontrada para capítulo:', chapterId);
        return res.status(404).json({
            success: false,
            error: 'URL del PDF no configurada'
        });
    }

    res.json({
        success: true,
        pdfUrl: pdfUrl
    });
});

// Agregar un middleware para manejar errores de archivo no encontrado
app.use((err, req, res, next) => {
    if (err.code === 'ENOENT') {
        res.status(404).json({ 
            success: false, 
            error: 'PDF no encontrado' 
        });
    } else {
        next(err);
    }
});

// Puerto configurable
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});