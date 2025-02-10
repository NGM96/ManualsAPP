async function loadChapters() {
    try {
        const response = await fetch('http://localhost:3000/api/chapters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                marca: document.getElementById('marca').value,
                modelo: document.getElementById('modelo').value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Debug

        if (data.success) {
            const chaptersContainer = document.getElementById('dynamic-chapters-list');
            chaptersContainer.innerHTML = createChapterButtons(data.chapters);

            // Agregar event listeners a los nuevos botones
            document.querySelectorAll('.chapter-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const path = button.dataset.path;
                    // Aquí puedes manejar la navegación al capítulo
                    console.log('Abriendo capítulo:', path);
                });
            });
        } else {
            alert('Manual no encontrado. Verifica marca y modelo.');
        }
    } catch (error) {
        console.error('Error al cargar los capítulos:', error);
    }
}

// Llamar a loadChapters cuando se muestre la sección de capítulos
document.querySelector('[data-section="capitulos"]').addEventListener('click', loadChapters);

document.addEventListener('DOMContentLoaded', () => {
    // Ocultar todas las secciones excepto la activa
    const showSection = (sectionId) => {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    };

    // Manejar clicks en enlaces de navegación
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-section]')) {
            e.preventDefault();
            const sectionId = e.target.getAttribute('data-section');
            showSection(sectionId);
        }
    });

    // Mostrar sección inicial basada en el hash de la URL
    const initialSection = window.location.hash.slice(1) || 'home';
    showSection(initialSection);

    // Manejo del estado de login
    const loginBtn = document.getElementById('loginBtn');
    const userAvatar = document.getElementById('userAvatar');

    // Simular login (esto se reemplazaría con tu lógica real de autenticación)
    loginBtn.addEventListener('click', () => {
        loginBtn.classList.add('hidden');
        userAvatar.classList.remove('hidden');
    });

    userAvatar.addEventListener('click', () => {
        // Aquí iría el menú desplegable del usuario
    });

    // Agregar el manejo del formulario de búsqueda
    document.getElementById('searchForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const marca = document.getElementById('marca').value;
        const modelo = document.getElementById('modelo').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/chapters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ marca, modelo })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Mostrar la sección de capítulos
                showSection('capitulos');
                
                // Cargar los capítulos en la lista
                const chaptersContainer = document.getElementById('dynamic-chapters-list');
                chaptersContainer.innerHTML = createChapterButtons(data.chapters);
            } else {
                alert('Manual no encontrado. Verifica marca y modelo.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al buscar el manual. Verifica que el servidor esté ejecutándose.');
        }
    });
});

function createChapterButtons(chapters) {
    return chapters.map(chapter => `
        <div class="chapter-container">
            <button class="chapter-btn" data-chapter-id="${chapter.id}">
                ${chapter.id} - ${chapter.title}
            </button>
            <div class="chapter-actions" id="actions-${chapter.id}">
                <button class="action-btn" data-action="ver" data-chapter="${chapter.id}">
                    <span class="btn-icon">📖</span>
                    Ver Capítulo
                </button>
                <button class="action-btn" data-action="consulta" data-chapter="${chapter.id}">
                    <span class="btn-icon">❓</span>
                    Realizar Consulta
                </button>
                <button class="action-btn" data-action="historial" data-chapter="${chapter.id}">
                    <span class="btn-icon">📋</span>
                    Ver Consultas
                </button>
            </div>
        </div>
    `).join('');
}

// Agregar el manejador de eventos para los capítulos
document.getElementById('dynamic-chapters-list').addEventListener('click', (e) => {
    const chapterBtn = e.target.closest('.chapter-btn');
    if (!chapterBtn) return;

    // Remover la clase active de todos los botones
    document.querySelectorAll('.chapter-btn').forEach(btn => {
        btn.classList.remove('active');
        const actions = document.querySelector(`#actions-${btn.dataset.chapterId}`);
        if (actions) actions.classList.remove('visible');
    });

    // Activar el capítulo seleccionado
    chapterBtn.classList.add('active');
    const actions = document.querySelector(`#actions-${chapterBtn.dataset.chapterId}`);
    if (actions) actions.classList.add('visible');
});

async function showChapterPDF(chapterId) {
    try {
        console.log('Intentando cargar PDF para capítulo:', chapterId);
        
        const response = await fetch(`http://localhost:3000/api/chapters/${chapterId}/pdf`);
        console.log('Respuesta del servidor:', response.status);
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Error al obtener la URL del PDF');
        }

        const pdfUrl = data.pdfUrl;
        console.log('URL del PDF:', pdfUrl);

        // Crear modal...
        const modal = document.createElement('div');
        modal.className = 'pdf-modal';
        modal.innerHTML = `
            <div class="pdf-modal-content">
                <button class="pdf-close-btn">&times;</button>
                <div class="pdf-zoom-controls">
                    <button class="pdf-zoom-btn" data-zoom="out">-</button>
                    <button class="pdf-zoom-btn" data-zoom="reset">100%</button>
                    <button class="pdf-zoom-btn" data-zoom="in">+</button>
                </div>
                <div class="pdf-container">
                    <div id="viewer" class="pdfViewer"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        try {
            console.log('Iniciando carga del PDF con PDF.js');
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                withCredentials: true  // Importante para URLs que requieren autenticación
            });
            
            const pdf = await loadingTask.promise;
            console.log('PDF cargado exitosamente, páginas:', pdf.numPages);

            // ... resto del código de renderizado ...

        } catch (pdfError) {
            console.error('Error al cargar PDF con PDF.js:', pdfError);
            // Mostrar fallback para visualización directa
            modal.querySelector('.pdf-container').innerHTML = `
                <iframe 
                    src="${pdfUrl}" 
                    width="100%" 
                    height="100%" 
                    style="border: none;"
                ></iframe>
            `;
        }

    } catch (error) {
        console.error('Error en showChapterPDF:', error);
        alert('Error al cargar el PDF. Por favor, intenta nuevamente.');
    }
}

// Event listener para el botón "Ver Capítulo"
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-action="ver"]')) {
        const activeChapter = document.querySelector('.chapter-btn.active');
        if (activeChapter) {
            const chapterId = activeChapter.dataset.chapterId;
            showChapterPDF(chapterId);
        }
    }
});
