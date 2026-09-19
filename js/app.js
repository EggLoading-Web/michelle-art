// ============================
// MENÚ HAMBURGUESA
// ============================
const btnHamburguesa = document.getElementById('btnHamburguesa');
const menuPrincipal = document.getElementById('menuPrincipal');

btnHamburguesa.addEventListener('click', () => {
    btnHamburguesa.classList.toggle('activo');
    menuPrincipal.classList.toggle('abierto');
});

// Cerrar el menú al hacer clic en un enlace (en móvil)
const enlacesMenu = document.querySelectorAll('.nav__link');
enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', () => {
        btnHamburguesa.classList.remove('activo');
        menuPrincipal.classList.remove('abierto');
    });
});// ============================
// MODAL DE SUB-SERVICIOS
// ============================
const modal = document.getElementById('modalServicio');
const modalCerrar = document.getElementById('modalCerrar');
const modalCarousel = document.getElementById('modalCarousel');
const modalInfo = document.getElementById('modalInfo');

document.querySelectorAll('.subservicio').forEach(card => {
    const info = card.querySelector('.subservicio__info');
    if (!info) return;

    const btn = document.createElement('button');
    btn.className = 'subservicio__vermas';
    btn.dataset.i18n = 'ver_mas';
    btn.textContent = 'Ver más';

    // Si la tarjeta es de catálogo, el botón abre el catálogo
    if (card.dataset.catalogo === 'true') {
        btn.dataset.i18n = 'ver_catalogo';
        btn.textContent = 'Ver catálogo';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirCatalogo();
        });
    } else {
        // Comportamiento normal: abre el modal
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirModal(card);
        });
    }

    info.appendChild(btn);
});

function abrirModal(card) {
    modalCarousel.innerHTML = '';
    modalInfo.innerHTML = '';

    // Copiar carrusel
    const carousel = card.querySelector('.carousel');
    if (carousel) {
        const imgs = carousel.querySelectorAll('img');
        if (imgs.length === 0) {
            modalCarousel.classList.add('carousel--vacio');
        } else {
            modalCarousel.classList.remove('carousel--vacio');
            imgs.forEach(img => {
                const newImg = document.createElement('img');
                newImg.src = img.src;
                newImg.alt = img.alt;
                if (img.classList.contains('activo')) {
                    newImg.classList.add('activo');
                }
                modalCarousel.appendChild(newImg);
            });
        }
    }

        const infoOriginal = card.querySelector('.subservicio__info');
    if (infoOriginal) {
        const clon = infoOriginal.cloneNode(true);

        // Quitar el botón "Ver más" del clon
        const btnVerMas = clon.querySelector('.subservicio__vermas');
        if (btnVerMas) btnVerMas.remove();

        // Reemplazar el <a> "Consultar" por un <button>
        const linkClonado = clon.querySelector('.subservicio__link');
        if (linkClonado) {
            const btn = document.createElement('button');
            btn.className = 'subservicio__link subservicio__link--modal';
            btn.type = 'button';
            btn.textContent = linkClonado.textContent;
            // Heredar el data-i18n para que se traduzca
            if (linkClonado.dataset.i18n) {
                btn.dataset.i18n = linkClonado.dataset.i18n;
            }
            linkClonado.replaceWith(btn);
        }

        modalInfo.appendChild(clon);
    }

    // Mostrar modal
    modal.classList.add('abierto');
    document.body.style.overflow = 'hidden';

    // Iniciar rotación del carrusel del modal
    iniciarRotacionModal();

    // Reaplicar el idioma actual para que el clon se traduzca
    const idiomaActual = localStorage.getItem('idioma') || 'es';
    aplicarIdioma(idiomaActual);
        // Agregar flechas al carrusel del modal
    crearFlechas(modalCarousel);
}

let modalInterval;
function iniciarRotacionModal() {
    clearInterval(modalInterval);
    modalInterval = setInterval(() => {
        const imgs = modalCarousel.querySelectorAll('img');
        if (imgs.length < 2) return;
        const actual = [...imgs].findIndex(i => i.classList.contains('activo'));
        if (actual === -1) return;
        imgs[actual].classList.remove('activo');
        imgs[(actual + 1) % imgs.length].classList.add('activo');
    }, 1800);
}

function cerrarModal() {
    modal.classList.remove('abierto');
    document.body.style.overflow = '';
    clearInterval(modalInterval);
}

function refrescarModal() {
    // Función vacía para evitar errores si se llama desde aplicarIdioma 
    // Si el modal está abierto y hay un idioma nuevo, no hace falta hacer nada
    // porque aplicarIdioma ya actualiza todos los data-i18n visibles.
    // Esta función existe solo para que no dé error si se llama desde otro lado.
}

modalCerrar.addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});// ============================
// FORMULARIO DE CONTACTO → WHATSAPP
// ============================
const formContacto = document.getElementById('formContacto');

if (formContacto) {
    formContacto.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const idea = document.getElementById('idea').value.trim();

        if (!nombre || !servicio || !idea) {
            alert('Por favor completá todos los campos obligatorios.');
            return;
        }

        // Construir el mensaje
        let mensaje = `Hola Michelle! 👋🤍\n\n`;
        mensaje += `Nombre y Apellido: ${nombre}\n`;
        mensaje += `Servicio: ${servicio}\n`;
        if (fecha) {
            mensaje += `Fecha preferida: ${fecha}\n`;
        }
        mensaje += `\nIdea:\n${idea}\n\n`;
        mensaje += `Enviado desde tu web 🎨`;

        // Codificar para URL
        const mensajeCodificado = encodeURIComponent(mensaje);

        // Número de Michelle (sin +, sin espacios)
        const numero = '393520461199';

        // Abrir WhatsApp
        const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;
        window.open(url, '_blank');
    });
}// ============================
// SISTEMA DE IDIOMAS
// ============================
const idiomaGuardado = localStorage.getItem('idioma') || 'es';

async function aplicarIdioma(idioma) {
    try {
        const respuesta = await fetch(`lang/${idioma}.json`);
        if (!respuesta.ok) throw new Error(`No se pudo cargar el idioma ${idioma}`);
        const traducciones = await respuesta.json();

        // Reemplazar todos los textos marcados con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const clave = el.dataset.i18n;
            if (traducciones[clave]) {
                const valor = traducciones[clave];
                if (/<[a-z][\s\S]*>/i.test(valor)) {
                    el.innerHTML = valor;
                } else {
                    el.textContent = valor;
                }
            }
        });

        // Cambiar la bandera del botón en header y footer
        const banderas = {
            es: 'https://flagcdn.com/w40/es.png',
            it: 'https://flagcdn.com/w40/it.png',
            en: 'https://flagcdn.com/w40/gb.png',
            pt: 'https://flagcdn.com/w40/pt.png'
        };
        document.querySelectorAll('.idiomas__toggle img').forEach(img => {
            img.src = banderas[idioma];
        });

        // Marcar la opción activa en todos los menús
        document.querySelectorAll('.idiomas__opcion').forEach(op => {
            op.classList.toggle('idiomas__opcion--activo', op.dataset.idioma === idioma);
        });

        document.documentElement.lang = idioma;
        localStorage.setItem('idioma', idioma);

        if (typeof refrescarModal === 'function') refrescarModal();

           // Actualizar catálogo si está abierto
        if (catalogoData) {
            renderizarTabs();
            renderizarObras();
        }

    } catch (error) {
        console.error('Error al cargar el idioma:', error);
    }
}

// ============================
// SELECTOR DE IDIOMA (DESPLEGABLE)
// ============================

// Abrir/cerrar menú
document.querySelectorAll('.idiomas__toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const contenedor = toggle.closest('.idiomas');
        document.querySelectorAll('.idiomas').forEach(otro => {
            if (otro !== contenedor) otro.classList.remove('abierto');
        });
        contenedor.classList.toggle('abierto');
    });
});

document.querySelectorAll('.idiomas__opcion').forEach(opcion => {
    opcion.addEventListener('click', () => {
        aplicarIdioma(opcion.dataset.idioma);
        document.querySelectorAll('.idiomas').forEach(m => m.classList.remove('abierto'));
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.idiomas').forEach(m => m.classList.remove('abierto'));
});
function refrescarModal() {
    // Función vacía para evitar errores si se llama desde aplicarIdioma
}

// Aplicar el idioma guardado al cargar la página
aplicarIdioma(idiomaGuardado);
// ============================
// CARRUSELES AUTOMÁTICOS
// ============================
document.querySelectorAll('.carousel').forEach(carousel => {
    const folder = carousel.dataset.folder;
    const count = parseInt(carousel.dataset.count) || 5;

    if (!folder) return;

    // Crear las imágenes dinámicamente
    for (let i = 1; i <= count; i++) {
        const img = document.createElement('img');
        img.src = `assets/img/${folder}/${i}.jpg`;
        img.alt = `Trabajo - ${folder}`;

        img.onerror = () => {
            img.remove();
            // Si no quedó ninguna imagen, mostrar placeholder
            if (carousel.querySelectorAll('img').length === 0) {
                carousel.classList.add('carousel--vacio');
            }
        };

        img.onload = () => {
            // La primera imagen que cargue se muestra
            if (!carousel.querySelector('img.activo')) {
                img.classList.add('activo');
            }
        };

        carousel.appendChild(img);
    }

    // Rotación automática cada 5 segundos
    setInterval(() => {
        const imgs = carousel.querySelectorAll('img');
        if (imgs.length < 2) return;

        const actual = [...imgs].findIndex(i => i.classList.contains('activo'));
        if (actual === -1) return;

        imgs[actual].classList.remove('activo');
        imgs[(actual + 1) % imgs.length].classList.add('activo');
    }, 2300);
        // Agregar flechas de navegación
    crearFlechas(carousel);
});
// ============================
// CATÁLOGO DE OBRAS
// ============================
const modalCatalogo = document.getElementById('modalCatalogo');
const modalCatalogoCerrar = document.getElementById('modalCatalogoCerrar');
const catalogoTabs = document.getElementById('catalogoTabs');
const catalogoGrid = document.getElementById('catalogoGrid');

let catalogoData = null;
let categoriaActiva = null;

async function abrirCatalogo() {
    if (!catalogoData) {
        try {
            const respuesta = await fetch('catalogo.json');
            if (!respuesta.ok) throw new Error('No se pudo cargar el catálogo');
            catalogoData = await respuesta.json();
        } catch (error) {
            console.error('Error al cargar catálogo:', error);
            alert('No se pudo cargar el catálogo. Intentá de nuevo.');
            return;
        }
    }
 // Resetear vistas ANTES de abrir
    document.getElementById('catalogoVistaGrilla').classList.remove('catalogo-vista--oculta');
    document.getElementById('catalogoVistaProducto').classList.add('catalogo-vista--oculta');

    modalCatalogo.classList.add('abierto');
    document.body.style.overflow = 'hidden';

    renderizarTabs();
    if (!categoriaActiva && catalogoData.categorias.length > 0) {
        categoriaActiva = catalogoData.categorias[0].id;
    }
    renderizarObras();
}

function renderizarTabs() {
    catalogoTabs.innerHTML = '';
    const idioma = localStorage.getItem('idioma') || 'es';

    catalogoData.categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'modal-catalogo__tab';
        btn.textContent = cat.titulo[idioma] || cat.titulo.es;
        btn.dataset.categoria = cat.id;
        if (cat.id === categoriaActiva) btn.classList.add('activo');

        btn.addEventListener('click', () => {
            categoriaActiva = cat.id;
            renderizarTabs();
            renderizarObras();
        });

        catalogoTabs.appendChild(btn);
    });
}function renderizarObras() {
    catalogoGrid.innerHTML = '';
    const idioma = localStorage.getItem('idioma') || 'es';

    const categoria = catalogoData.categorias.find(c => c.id === categoriaActiva);
    if (!categoria) return;

    const txtProximamente = {
        es: 'Próximamente',
        it: 'Prossimamente',
        en: 'Coming soon',
        pt: 'Em breve'
    };
    const txtProx = txtProximamente[idioma] || txtProximamente.es;

    categoria.obras.forEach(obra => {
        const card = document.createElement('article');
        card.className = 'obra-catalogo';

        if (obra.placeholder) {
            card.innerHTML = `
                <div class="obra-catalogo__imagen obra-catalogo__imagen--proximamente">
                    <span>${txtProx}</span>
                </div>
                <div class="obra-catalogo__info">
                    <h4 class="obra-catalogo__nombre">${txtProx}</h4>
                    <p class="obra-catalogo__tecnica">${txtProx}</p>
                    <p class="obra-catalogo__medidas">${txtProx}</p>
                </div>
            `;
            card.style.cursor = 'default';
        } else {
            const nombre = obra.nombre[idioma] || obra.nombre.es;
            const tecnica = obra.tecnica[idioma] || obra.tecnica.es;

            card.innerHTML = `
                <div class="obra-catalogo__imagen" data-proximamente="${txtProx}">
                    <img src="${obra.foto}" alt="${nombre}" loading="lazy">
                </div>
                <div class="obra-catalogo__info">
                    <h4 class="obra-catalogo__nombre">${nombre}</h4>
                    <p class="obra-catalogo__tecnica">${tecnica}</p>
                    <p class="obra-catalogo__medidas">${obra.medidas}</p>
                </div>
            `;

            const img = card.querySelector('.obra-catalogo__imagen img');
            img.onerror = () => {
                const contenedor = img.parentElement;
                img.remove();
                contenedor.classList.add('obra-catalogo__imagen--proximamente');
                contenedor.innerHTML = `<span>${txtProx}</span>`;
            };

            card.addEventListener('click', () => {
                mostrarProducto(obra);
            });
        }

        catalogoGrid.appendChild(card);
    });
}

// ============================
// VISTA DE PRODUCTO INDIVIDUAL
// ============================
function mostrarProducto(obra) {
    const idioma = localStorage.getItem('idioma') || 'es';
    const nombre = obra.nombre[idioma] || obra.nombre.es;
    const tecnica = obra.tecnica[idioma] || obra.tecnica.es;

    // Actualizar datos
    document.getElementById('productoImagenPrincipal').src = obra.foto;
    document.getElementById('productoImagenPrincipal').alt = nombre;
    document.getElementById('productoNombre').textContent = nombre;
    document.getElementById('productoTecnica').textContent = tecnica;
    document.getElementById('productoMedidas').textContent = obra.medidas;

    // WhatsApp con el nombre de la obra
    const mensaje = `Hola Michelle! 👋🤍\n\nMe interesa la obra: *${nombre}*\n\n¿Está disponible?`;
    const url = `https://wa.me/393520461199?text=${encodeURIComponent(mensaje)}`;
    document.getElementById('productoWhatsapp').href = url;

    // Cambiar vista
    document.getElementById('catalogoVistaGrilla').classList.add('catalogo-vista--oculta');
    document.getElementById('catalogoVistaProducto').classList.remove('catalogo-vista--oculta');

    // Scroll al inicio del modal
    document.querySelector('.modal-catalogo').scrollTop = 0;

        // Si la imagen del producto falla, mostrar "Próximamente"
    const imgProducto = document.getElementById('productoImagenPrincipal');
    const contenedorProducto = imgProducto.parentElement;
    const idiomaActual = localStorage.getItem('idioma') || 'es';

    const txtProximamente = {
        es: 'Próximamente',
        it: 'Prossimamente',
        en: 'Coming soon',
        pt: 'Em breve'
    };

    // Resetear el estado
    contenedorProducto.classList.remove('producto-detalle__imagen-principal--proximamente');
    imgProducto.style.display = 'block';

    imgProducto.onerror = () => {
        imgProducto.style.display = 'none';
        contenedorProducto.classList.add('producto-detalle__imagen-principal--proximamente');
        contenedorProducto.innerHTML = `<span>${txtProximamente[idiomaActual] || txtProximamente.es}</span>`;
        // Re-crear la img para futuros productos
        const nuevaImg = document.createElement('img');
        nuevaImg.id = 'productoImagenPrincipal';
        contenedorProducto.appendChild(nuevaImg);
    };
}

// Botón "Volver al catálogo"
document.addEventListener('click', (e) => {
    if (e.target.closest('#catalogoVolver')) {
        document.getElementById('catalogoVistaProducto').classList.add('catalogo-vista--oculta');
        document.getElementById('catalogoVistaGrilla').classList.remove('catalogo-vista--oculta');
    }
});

// Cerrar catálogo
if (modalCatalogoCerrar) {
    modalCatalogoCerrar.addEventListener('click', () => {
        modalCatalogo.classList.remove('abierto');
        document.body.style.overflow = '';
         document.getElementById('catalogoVistaProducto').classList.add('catalogo-vista--oculta');
        document.getElementById('catalogoVistaGrilla').classList.remove('catalogo-vista--oculta');
    });
}

if (modalCatalogo) {
    modalCatalogo.addEventListener('click', (e) => {
        if (e.target === modalCatalogo) {
            modalCatalogo.classList.remove('abierto');
            document.body.style.overflow = '';
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCatalogo && modalCatalogo.classList.contains('abierto')) {
        modalCatalogo.classList.remove('abierto');
        document.body.style.overflow = '';
    }
});

// Volver a renderizar el catálogo al cambiar idioma
// (agregamos un hook al aplicarIdioma existente)
const _aplicarIdiomaOriginal = window.aplicarIdioma;
// ============================
// SUBMENÚ "OBRAS DISPONIBLES"
// ============================
(function () {
    const dropdowns = document.querySelectorAll('.nav__link--dropdown');
    const subItems = document.querySelectorAll('.nav__submenu-item');
    const menuPrincipal = document.getElementById('menuPrincipal');
    const btnHamburguesa = document.getElementById('btnHamburguesa');

    document.querySelectorAll('.nav__link--dropdown').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const contenedor = btn.closest('.nav__item-dropdown');

        // Scroll suave a la sección "Obras disponibles"
        const seccion = document.getElementById('obras-disponibles');
        if (seccion) {
            seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Abrir/cerrar submenú
        contenedor.classList.toggle('abierto');
    });
});

    // Selección de categoría
    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const categoria = item.dataset.categoria;

            // Cerrar todos los dropdowns
            document.querySelectorAll('.nav__item-dropdown').forEach(d => d.classList.remove('abierto'));

            // Cerrar menú hamburguesa
            if (menuPrincipal) menuPrincipal.classList.remove('abierto');
            if (btnHamburguesa) btnHamburguesa.classList.remove('activo');

            // Abrir catálogo filtrado
            if (typeof categoriaActiva !== 'undefined') {
                categoriaActiva = categoria;
            }
            if (typeof abrirCatalogo === 'function') {
                abrirCatalogo();
            }
        });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav__item-dropdown')) {
            document.querySelectorAll('.nav__item-dropdown').forEach(d => d.classList.remove('abierto'));
        }
    });
})();// ============================
// BOTONES DE LA SECCIÓN OBRAS DISPONIBLES
// ============================
document.querySelectorAll('.obras-disponibles__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const categoria = btn.dataset.categoria;

        if (typeof categoriaActiva !== 'undefined') {
            categoriaActiva = categoria;
        }
        if (typeof abrirCatalogo === 'function') {
            abrirCatalogo();
        }
    });
});// ============================
// FLECHAS DE NAVEGACIÓN EN CARRUSELES
// ============================
function crearFlechas(carousel) {
    // Flecha izquierda
    const prev = document.createElement('button');
    prev.className = 'carousel__flecha carousel__flecha--prev';
    prev.setAttribute('aria-label', 'Anterior');
    prev.innerHTML = '‹';
    prev.addEventListener('click', (e) => {
        e.stopPropagation();
        navegarCarrusel(carousel, -1);
    });

    // Flecha derecha
    const next = document.createElement('button');
    next.className = 'carousel__flecha carousel__flecha--next';
    next.setAttribute('aria-label', 'Siguiente');
    next.innerHTML = '›';
    next.addEventListener('click', (e) => {
        e.stopPropagation();
        navegarCarrusel(carousel, 1);
    });

    carousel.appendChild(prev);
    carousel.appendChild(next);
}

function navegarCarrusel(carousel, direccion) {
    const imgs = carousel.querySelectorAll('img');
    if (imgs.length < 2) return;

    const actual = [...imgs].findIndex(i => i.classList.contains('activo'));
    if (actual === -1) return;

    imgs[actual].classList.remove('activo');
    const siguiente = (actual + direccion + imgs.length) % imgs.length;
    imgs[siguiente].classList.add('activo');
}// ============================
// CONSULTAR EN EL MODAL → CERRAR + WHATSAPP
// ============================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.subservicio__link--modal');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    // Cerrar el modal
    const modal = document.getElementById('modalServicio');
    if (modal) {
        modal.classList.remove('abierto');
        document.body.style.overflow = '';

        // Detener rotación del carrusel del modal
        if (typeof modalInterval !== 'undefined') {
            clearInterval(modalInterval);
        }
    }

    // Obtener el nombre del servicio
    const info = btn.closest('.subservicio__info');
    const titulo = info ? info.querySelector('.subservicio__nombre') : null;
    const nombre = titulo ? titulo.textContent.trim() : '';

    // Abrir WhatsApp
    const mensaje = `Hola Michelle! 👋🤍\n\nMe interesa el servicio: *${nombre}*\n\n¿Me contás más?`;
    const url = `https://wa.me/393520461199?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
});