// ** CLAVE DE API - ¡NO LA TOQUES! **
const UNSPLASH_ACCESS_KEY = 'VH9xquGGR5YVjUaf2l1nesrYpeeCOi4f1iy5MOKsIB0'; 

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const imageGallery = document.getElementById('imageGallery');
const statusDiv = document.getElementById('status');
const loadMoreBtn = document.getElementById('loadMoreBtn'); // NUEVO: Capturamos el botón

let currentPage = 1; // NUEVO: Empezamos en la página 1
let currentQuery = ''; // NUEVO: Guardamos el último término buscado

// Función que maneja la búsqueda inicial o la carga de más
async function searchImages(isNewSearch = true) {
    if (isNewSearch) {
        currentQuery = searchInput.value.trim();
        currentPage = 1; // Reiniciar página para la nueva búsqueda
        imageGallery.innerHTML = ''; // Limpiar la galería solo si es una nueva búsqueda
        loadMoreBtn.style.display = 'none'; // Ocultar el botón al inicio
    }
    
    if (!currentQuery) {
        statusDiv.textContent = 'ERROR [0x02]: Introduce un término. ¡El campo de búsqueda está vacío!';
        statusDiv.style.color = '#FF00FF';
        return;
    }

    // Actualizar mensaje de estado
    if (isNewSearch) {
        statusDiv.textContent = `Iniciando búsqueda para "${currentQuery}"... | Estado: OK.`;
    } else {
        statusDiv.textContent = `Cargando página ${currentPage}... | Estado: OK.`;
    }
    statusDiv.style.color = '#00FFFF'; 

    // Construye la URL de la API de Unsplash con la página correcta
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(currentQuery)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=20&page=${currentPage}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}. La transmisión falló.`);
        }

        const data = await response.json();
        
        displayImages(data.results, isNewSearch);
        
        const totalResults = data.total;
        const totalPages = data.total_pages;

        statusDiv.textContent = `Búsqueda Finalizada. Mostrando ${imageGallery.children.length} resultados de ${totalResults} totales.`;
        statusDiv.style.color = '#00FFFF';

        // Mostrar o esconder el botón de "Cargar más"
        if (currentPage < totalPages) {
            loadMoreBtn.style.display = 'flex'; // Mostrar el botón
            currentPage++; // Preparar la siguiente página
        } else {
            loadMoreBtn.style.display = 'none'; // Esconder el botón si no hay más páginas
            statusDiv.textContent = `Búsqueda Finalizada. Mostrando ${imageGallery.children.length} resultados. No hay más páginas disponibles.`;
        }

    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        statusDiv.textContent = `ERROR [API]: Fallo en la conexión de datos.`;
        statusDiv.style.color = '#FF00FF';
    }
}

// Función para mostrar las imágenes en la galería
// NO limpiamos el innerHTML aquí si no es una nueva búsqueda
function displayImages(photos) {
    if (photos.length === 0 && currentPage === 1) {
        imageGallery.innerHTML = `<p style="color: #FFFF00; font-family: 'Orbitron', sans-serif; text-align: center;">[FIN DE LA BÚSQUEDA] No se encontraron imágenes para este término.</p>`;
        loadMoreBtn.style.display = 'none';
        return;
    }

    photos.forEach(photo => {
        const card = document.createElement('div');
        card.classList.add('image-card');
        
        card.onclick = () => window.open(photo.links.html, '_blank');

        const img = document.createElement('img');
        img.src = photo.urls.thumb; 
        img.alt = photo.alt_description || 'Imagen sin descripción';
        img.title = `Foto de ${photo.user.name}. Click para ver fuente.`;

        card.appendChild(img);
        imageGallery.appendChild(card);
    });
}

// ASIGNAR EVENTOS
searchBtn.addEventListener('click', () => searchImages(true)); // Nueva búsqueda
loadMoreBtn.addEventListener('click', () => searchImages(false)); // Cargar más (no es nueva búsqueda)

// Permitir buscar al presionar Enter en el campo de texto
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchImages(true);
    }
});