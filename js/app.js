// ============================
// VARIABLES GLOBALES
// ============================
let catalogoData = null;
let categoriaActiva = null;
let modalInterval = null;

// ============================
// MENÚ HAMBURGUESA
// ============================
const btnHamburguesa = document.getElementById('btnHamburguesa');
const menuPrincipal = document.getElementById('menuPrincipal');

if (btnHamburguesa && menuPrincipal) {
    btnHamburguesa.addEventListener('click', () => {
        btnHamburguesa.classList.toggle('activo');
        menuPrincipal.classList.toggle('abierto');
    });
}

// Cerrar el menú al hacer clic en un enlace (sin incluir el dropdown)
const enlacesMenu = document.querySelectorAll('.nav__link:not(.nav__link--dropdown)');
enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', () => {
        if (btnHamburguesa) btnHamburguesa.classList.remove('activo');
        if (menuPrincipal) menuPrincipal.classList.remove('abierto');
    });
});

// ============================
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

    if (card.dataset.catalogo === 'true') {
        btn.dataset.i18n = 'ver_catalogo';
        btn.textContent = 'Ver catálogo';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirCatalogo();
        });
    } else {
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

        const btnVerMas = clon.querySelector('.subservicio__vermas');
        if (btnVerMas) btnVerMas.remove();

        const linkClonado = clon.querySelector('.subservicio__link');
        if (linkClonado) {
            const btn = document.createElement('button');
            btn.className = 'subservicio__link subservicio__link--modal';
            btn.type = 'button';
            btn.textContent = linkClonado.textContent;
            if (linkClonado.dataset.i18n) {
                btn.dataset.i18n = linkClonado.dataset.i18n;
            }
            linkClonado.replaceWith(btn);
        }

        modalInfo.appendChild(clon);
    }

    modal.classList.add('abierto');
    document.body.style.overflow = 'hidden';

    iniciarRotacionModal();

    const idiomaActual = localStorage.getItem('idioma') || 'es';
    aplicarIdioma(idiomaActual);

    crearFlechas(modalCarousel);
}

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
    // Función vacía por compatibilidad
}

if (modalCerrar) modalCerrar.addEventListener('click', cerrarModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});

// ============================
// FORMULARIO DE CONTACTO → WHATSAPP
// ============================
const formContacto = document.getElementById('formContacto');

if (formContacto) {
    formContacto.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputNombre = document.getElementById('nombre');
        const inputServicio = document.getElementById('servicio');
        const inputFecha = document.getElementById('fecha');
        const inputIdea = document.getElementById('idea');

        if (!inputNombre || !inputServicio || !inputIdea) return;

        const nombre = inputNombre.value.trim();
        const servicio = inputServicio.value;
        const fecha = inputFecha ? inputFecha.value : '';
        const idea = inputIdea.value.trim();

        if (!nombre || !servicio || !idea) {
            alert('Por favor completá todos los campos obligatorios.');
            return;
        }

        let mensaje = `Hola Michelle! 👋🤍\n\n`;
        mensaje += `Nombre y Apellido: ${nombre}\n`;
        mensaje += `Servicio: ${servicio}\n`;
        if (fecha) {
            mensaje += `Fecha preferida: ${fecha}\n`;
        }
        mensaje += `\nIdea:\n${idea}\n\n`;
        mensaje += `Enviado desde tu web 🎨`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const numero = '393520461199';
        const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;
        window.open(url, '_blank');
    });
}

// ============================
// SISTEMA DE IDIOMAS
// ============================
const idiomaGuardado = localStorage.getItem('idioma') || 'es';

async function aplicarIdioma(idioma) {
    try {
        const respuesta = await fetch(`lang/${idioma}.json`);
        if (!respuesta.ok) throw new Error(`No se pudo cargar el idioma ${idioma}`);
        const traducciones = await respuesta.json();

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

        // ⭐ BANDERA ARGENTINA para español
        const banderas = {
            es: 'https://flagcdn.com/w40/ar.png',
            it: 'https://flagcdn.com/w40/it.png',
            en: 'https://flagcdn.com/w40/gb.png',
            pt: 'https://flagcdn.com/w40/pt.png'
        };
        document.querySelectorAll('.idiomas__toggle img').forEach(img => {
            img.src = banderas[idioma];
        });

        document.querySelectorAll('.idiomas__opcion').forEach(op => {
            op.classList.toggle('idiomas__opcion--activo', op.dataset.idioma === idioma);
        });

        document.documentElement.lang = idioma;
        localStorage.setItem('idioma', idioma);

        if (typeof refrescarModal === 'function') refrescarModal();

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

aplicarIdioma(idiomaGuardado);

// ============================
// CARRUSELES AUTOMÁTICOS
// ============================
document.querySelectorAll('.carousel').forEach(carousel => {
    const folder = carousel.dataset.folder;
    const count = parseInt(carousel.dataset.count) || 5;

    if (!folder) return;

    for (let i = 1; i <= count; i++) {
        const img = document.createElement('img');
        img.src = `assets/img/${folder}/${i}.jpg`;
        img.alt = `Trabajo - ${folder}`;

        img.onerror = () => {
            img.remove();
            if (carousel.querySelectorAll('img').length === 0) {
                carousel.classList.add('carousel--vacio');
            }
        };

        img.onload = () => {
            if (!carousel.querySelector('img.activo')) {
                img.classList.add('activo');
            }
        };

        carousel.appendChild(img);
    }

    setInterval(() => {
        const imgs = carousel.querySelectorAll('img');
        if (imgs.length < 2) return;
        const actual = [...imgs].findIndex(i => i.classList.contains('activo'));
        if (actual === -1) return;
        imgs[actual].classList.remove('activo');
        imgs[(actual + 1) % imgs.length].classList.add('activo');
    }, 2300);

    crearFlechas(carousel);
});

// ============================
// CATÁLOGO DE OBRAS
// ============================
const modalCatalogo = document.getElementById('modalCatalogo');
const modalCatalogoCerrar = document.getElementById('modalCatalogoCerrar');
const catalogoTabs = document.getElementById('catalogoTabs');
const catalogoGrid = document.getElementById('catalogoGrid');

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
}

function renderizarObras() {
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

function mostrarProducto(obra) {
    const idioma = localStorage.getItem('idioma') || 'es';
    const nombre = obra.nombre[idioma] || obra.nombre.es;
    const tecnica = obra.tecnica[idioma] || obra.tecnica.es;

    document.getElementById('productoImagenPrincipal').src = obra.foto;
    document.getElementById('productoImagenPrincipal').alt = nombre;
    document.getElementById('productoNombre').textContent = nombre;
    document.getElementById('productoTecnica').textContent = tecnica;
    document.getElementById('productoMedidas').textContent = obra.medidas;

    const mensaje = `Hola Michelle! 👋🤍\n\nMe interesa la obra: *${nombre}*\n\n¿Está disponible?`;
    const url = `https://wa.me/393520461199?text=${encodeURIComponent(mensaje)}`;
    document.getElementById('productoWhatsapp').href = url;

    document.getElementById('catalogoVistaGrilla').classList.add('catalogo-vista--oculta');
    document.getElementById('catalogoVistaProducto').classList.remove('catalogo-vista--oculta');

    document.querySelector('.modal-catalogo').scrollTop = 0;

    const imgProducto = document.getElementById('productoImagenPrincipal');
    const contenedorProducto = imgProducto.parentElement;
    const idiomaActual = localStorage.getItem('idioma') || 'es';

    const txtProximamente = {
        es: 'Próximamente',
        it: 'Prossimamente',
        en: 'Coming soon',
        pt: 'Em breve'
    };

    contenedorProducto.classList.remove('producto-detalle__imagen-principal--proximamente');
    imgProducto.style.display = 'block';

    imgProducto.onerror = () => {
        imgProducto.style.display = 'none';
        contenedorProducto.classList.add('producto-detalle__imagen-principal--proximamente');
        contenedorProducto.innerHTML = `<span>${txtProximamente[idiomaActual] || txtProximamente.es}</span>`;
        const nuevaImg = document.createElement('img');
        nuevaImg.id = 'productoImagenPrincipal';
        contenedorProducto.appendChild(nuevaImg);
    };
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#catalogoVolver')) {
        document.getElementById('catalogoVistaProducto').classList.add('catalogo-vista--oculta');
        document.getElementById('catalogoVistaGrilla').classList.remove('catalogo-vista--oculta');
    }
});

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

// ============================
// SUBMENÚ "OBRAS DISPONIBLES"
// ============================
(function () {
    const dropdowns = document.querySelectorAll('.nav__link--dropdown');
    const subItems = document.querySelectorAll('.nav__submenu-item');
    const menuPrinc = document.getElementById('menuPrincipal');
    const btnHamb = document.getElementById('btnHamburguesa');

    dropdowns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const contenedor = btn.closest('.nav__item-dropdown');

            const seccion = document.getElementById('obras-disponibles');
            if (seccion) {
                seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            contenedor.classList.toggle('abierto');
        });
    });

    subItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const categoria = item.dataset.categoria;

            document.querySelectorAll('.nav__item-dropdown').forEach(d => d.classList.remove('abierto'));
            if (menuPrinc) menuPrinc.classList.remove('abierto');
            if (btnHamb) btnHamb.classList.remove('activo');

            categoriaActiva = categoria;
            abrirCatalogo();
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav__item-dropdown')) {
            document.querySelectorAll('.nav__item-dropdown').forEach(d => d.classList.remove('abierto'));
        }
    });
})();

// ============================
// BOTONES DE LA SECCIÓN OBRAS DISPONIBLES
// ============================
document.querySelectorAll('.obras-disponibles__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        categoriaActiva = btn.dataset.categoria;
        abrirCatalogo();
    });
});

// ============================
// FLECHAS DE NAVEGACIÓN
// ============================
function crearFlechas(carousel) {
    const prev = document.createElement('button');
    prev.className = 'carousel__flecha carousel__flecha--prev';
    prev.setAttribute('aria-label', 'Anterior');
    prev.innerHTML = '‹';
    prev.addEventListener('click', (e) => {
        e.stopPropagation();
        navegarCarrusel(carousel, -1);
    });

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
}

// ============================
// CONSULTAR EN EL MODAL → CERRAR + WHATSAPP
// ============================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.subservicio__link--modal');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const modalServicio = document.getElementById('modalServicio');
    if (modalServicio) {
        modalServicio.classList.remove('abierto');
        document.body.style.overflow = '';
        if (modalInterval) clearInterval(modalInterval);
    }

    const info = btn.closest('.subservicio__info');
    const titulo = info ? info.querySelector('.subservicio__nombre') : null;
    const nombre = titulo ? titulo.textContent.trim() : '';

    const mensaje = `Hola Michelle! 👋🤍\n\nMe interesa el servicio: *${nombre}*\n\n¿Me contás más?`;
    const url = `https://wa.me/393520461199?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
});

// ============================
// ✨ 1. ANIMACIONES AL HACER SCROLL
// ============================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(
    '.sobre__texto, .sobre__imagen, .etapa, .servicio, .obras-disponibles__card, .contacto__grid, .footer__columna, .historia__titulo, .faq__item'
).forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ============================
// ✨ 2. BOTÓN VOLVER ARRIBA
// ============================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================
// ✨ 3. LIGHTBOX
// ============================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function abrirLightbox(src, alt) {
    if (!lightbox || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('abierto');
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('abierto');
    document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
    const img = e.target.closest('.modal__carousel img.activo, .obra-catalogo__imagen img, .producto-detalle__imagen-principal img');
    if (img && img.src && !img.src.endsWith('undefined')) {
        abrirLightbox(img.src, img.alt);
    }
});

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox__cerrar')) {
            cerrarLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarLightbox();
    });
}

// ============================
// ✨ 4. WHATSAPP DINÁMICO POR SECCIÓN
// ============================
const seccionesWhatsapp = [
    { id: 'tatuajes', clave: 'tatuajes' },
    { id: 'cuadros', clave: 'obras' },
    { id: 'murales', clave: 'murales' },
    { id: 'eventos', clave: 'eventos' },
    { id: 'talleres', clave: 'talleres' },
    { id: 'contacto', clave: 'consulta general' }
];

const whatsappBtn = document.querySelector('.whatsapp-flotante');
const whatsappTexto = document.querySelector('.whatsapp-flotante__texto');
let seccionActual = null;

if (whatsappBtn && 'IntersectionObserver' in window) {
    const observadorSecciones = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const seccion = seccionesWhatsapp.find(s => s.id === entry.target.id);
                if (seccion && seccion.id !== seccionActual) {
                    seccionActual = seccion.id;
                    const idioma = localStorage.getItem('idioma') || 'es';
                    const etiquetas = {
                        es: { tatuajes: 'Tatuajes', obras: 'Obras', murales: 'Murales', eventos: 'Eventos', talleres: 'Talleres', 'consulta general': 'Consulta' },
                        it: { tatuajes: 'Tatuaggi', obras: 'Opere', murales: 'Murales', eventos: 'Eventi', talleres: 'Laboratori', 'consulta general': 'Consulenza' },
                        en: { tatuajes: 'Tattoos', obras: 'Works', murales: 'Murals', eventos: 'Events', talleres: 'Workshops', 'consulta general': 'Inquiry' },
                        pt: { tatuajes: 'Tatuagens', obras: 'Obras', murales: 'Murais', eventos: 'Eventos', talleres: 'Oficinas', 'consulta general': 'Consulta' }
                    };
                    const dict = etiquetas[idioma] || etiquetas.es;
                    const nuevoTexto = dict[seccion.clave] || dict['consulta general'];
                    if (whatsappTexto) whatsappTexto.textContent = nuevoTexto;
                    const msg = `Hola Michelle! 👋🤍\n\nMe interesa el servicio de: *${nuevoTexto}*\n\n¿Me contás más?`;
                    whatsappBtn.href = `https://wa.me/393520461199?text=${encodeURIComponent(msg)}`;
                }
            }
        });
    }, { threshold: 0.4 });

    seccionesWhatsapp.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observadorSecciones.observe(el);
    });
}