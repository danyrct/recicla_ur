// script.js - versión corregida para mostrar ranking siempre abajo en móvil
const consultarBtn = document.getElementById("consultarBtn");
const userIdInput = document.getElementById("userId");
const resultado = document.getElementById("resultado");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");
const topSelect = document.getElementById("topSelect");

// Contenedores de ranking
const rankingContainer = document.getElementById("rankingContainer");
const rankingContainerMobile = document.getElementById("rankingContainerMobile");
const rankingLista = document.getElementById("rankingLista");
const rankingListaMobile = document.getElementById("rankingListaMobile");

function setStatus(text, kind = "info") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.remove("error", "info");
  statusEl.classList.add(kind);
}

// Helper: fetch con timeout
function fetchWithTimeout(url, options = {}, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const e = new Error("timeout");
      e.name = "TimeoutError";
      reject(e);
    }, timeout);

    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Función para sincronizar los rankings entre desktop y mobile
function sincronizarRankings() {
  if (rankingLista && rankingListaMobile) {
    rankingListaMobile.innerHTML = rankingLista.innerHTML;
  }
}

// Función para manejar la visibilidad de rankings según dispositivo
function actualizarVisibilidadRankings() {
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // En móvil: mostrar solo ranking-mobile, ocultar ranking-desktop
    if (rankingContainer) {
      rankingContainer.classList.add("oculto");
    }
    // El ranking-mobile ya se maneja por separado
  } else {
    // En desktop: mostrar solo ranking-desktop, ocultar ranking-mobile
    if (rankingContainerMobile) {
      rankingContainerMobile.classList.add("oculto");
    }
    // El ranking-desktop ya se maneja por separado
  }
}

consultarBtn.addEventListener("click", async () => {
  const id = userIdInput.value.trim();
  console.clear();
  console.log("⟲ Nuevo intento de consulta");
  console.log("ID ingresado:", id);

  resultado.classList.add("oculto");
  errorEl.classList.add("oculto");
  setStatus("", "info");

  if (!id) {
    console.warn("El ID está vacío. Abortando petición.");
    setStatus("Por favor ingresa un ID de usuario.", "error");
    return;
  }

  const url = `https://recicla.onrender.com/consulta/${encodeURIComponent(id)}`;
  console.log("URL de consulta:", url);

  setStatus("Consultando servidor...", "info");

  try {
    const response = await fetchWithTimeout(url, { method: "GET", cache: "no-store" }, 10000);
    console.log("Fetch completado. Código HTTP:", response.status);

    if (!response.ok) {
      console.warn("Respuesta HTTP no OK:", response.status, response.statusText);
      if (response.status === 404) {
        setStatus("Usuario no encontrado (404). Revisa el ID.", "error");
      } else if (response.status === 500) {
        setStatus("Error del servidor (500). Intenta más tarde.", "error");
      } else {
        setStatus(`Error: ${response.status} ${response.statusText}`, "error");
      }

      try {
        const txt = await response.text();
        console.log("Cuerpo de la respuesta (texto):", txt);
      } catch (e) {
        console.log("No se pudo leer cuerpo de respuesta:", e);
      }
      return;
    }

    let data;
    const text = await response.text();
    console.log("Cuerpo recibido (raw):", text);

    try {
      data = JSON.parse(text);
      console.log("JSON parseado:", data);
    } catch (jsonErr) {
      console.error("Error al parsear JSON:", jsonErr);
      setStatus("El servidor devolvió una respuesta no válida (no JSON). Revisa la API.", "error");
      return;
    }

    const expected = ["lata", "tetra", "vidrio", "total", "nombre", "user_id"];
    const missing = expected.filter(k => !(k in data));
    if (missing.length > 0) {
      console.warn("Faltan campos esperados en el JSON:", missing);
      setStatus("Respuesta incompleta desde el servidor. Ver consola para detalles.", "error");
      console.log("Objeto recibido:", data);
      return;
    }

    document.getElementById("nombreUsuario").textContent = data.nombre || "—";
    document.getElementById("latas").textContent = data.lata ?? 0;
    document.getElementById("tetra").textContent = data.tetra ?? 0;
    document.getElementById("vidrio").textContent = data.vidrio ?? 0;
    document.getElementById("total").textContent = data.total ?? 0;

    resultado.classList.remove("oculto");
    setStatus("Consulta exitosa ✔", "info");
    console.log("Datos mostrados en pantalla correctamente.");

  } catch (err) {
    console.error("Error en la petición fetch:", err);

    if (err.name === "TimeoutError") {
      setStatus("Tiempo de espera agotado (timeout). El servidor tardó demasiado.", "error");
      console.log("Sugerencia: comprueba conectividad o que la URL es accesible desde tu navegador.");
      return;
    }

    setStatus("No se pudo completar la consulta. Ver consola para más detalles.", "error");
    console.log("Posibles causas a revisar:");
    console.log("- ¿El servidor está en línea?");
    console.log("- ¿Hay un problema de CORS?");
    console.log("- ¿Tu conexión a internet está activa?");
    console.log("- Verifica la URL y el ID.");
  }
});

// Detectar cambio en el selector de ranking
topSelect.addEventListener("change", async () => {
  const categoria = topSelect.value;

  console.clear();
  console.log("📌 Selector de ranking cambiado a:", categoria);

  // Actualizar visibilidad según dispositivo
  actualizarVisibilidadRankings();

  // Si no selecciona nada, ocultar ambos rankings
  if (categoria === "nada") {
    if (rankingContainer) rankingContainer.classList.add("oculto");
    if (rankingContainerMobile) rankingContainerMobile.classList.add("oculto");
    return;
  }

  try {
    const url = `https://recicla.onrender.com/top_${categoria}`;
    console.log("URL de ranking:", url);

    const resp = await fetchWithTimeout(url, { method: "GET" }, 10000);

    if (!resp.ok) {
      console.warn("Error HTTP:", resp.status);
      setStatus("No se pudo obtener el ranking.", "error");
      return;
    }

    const text = await resp.text();
    let lista;

    try {
      lista = JSON.parse(text);
    } catch (e) {
      console.error("JSON inválido:", e);
      setStatus("Respuesta inválida del servidor.", "error");
      return;
    }

    console.log("Ranking recibido:", lista);

    // Determinar el campo correcto para ordenar y mostrar
    const campoPuntaje = categoria === 'total' ? 'total' : 
                        categoria === 'latas' ? 'lata' :
                        categoria === 'tetra' ? 'tetra' :
                        categoria === 'vidrio' ? 'vidrio' : 'total';

    // Ordenar por puntaje de mayor a menor
    lista.sort((a, b) => b[campoPuntaje] - a[campoPuntaje]);

    // Limpiar contenedor principal
    if (rankingLista) {
      rankingLista.innerHTML = "";
    }

    // Crear cada elemento visual
    lista.forEach((item, index) => {
      if (!rankingLista) return;
      
      const div = document.createElement("div");
      div.className = "ranking-item";
      
      const puntaje = item[campoPuntaje] || 0;
      
      div.innerHTML = `
        <div class="ranking-pos">${index + 1}</div>
        <div class="ranking-nombre">
          ${item.nombre || "Sin nombre"}
          <small>ID: ${item.user_id}</small>
        </div>
        <div class="ranking-score">${puntaje}</div>
      `;
      rankingLista.appendChild(div);
    });

    // Mostrar el ranking apropiado según el dispositivo
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // En móvil: mostrar ranking-mobile, ocultar ranking-desktop
      if (rankingContainerMobile) {
        rankingContainerMobile.classList.remove("oculto");
      }
      if (rankingContainer) {
        rankingContainer.classList.add("oculto");
      }
    } else {
      // En desktop: mostrar ranking-desktop, ocultar ranking-mobile
      if (rankingContainer) {
        rankingContainer.classList.remove("oculto");
      }
      if (rankingContainerMobile) {
        rankingContainerMobile.classList.add("oculto");
      }
    }
    
    // Sincronizar contenido entre desktop y mobile
    sincronizarRankings();
    
    setStatus("Ranking cargado ✔");

  } catch (err) {
    console.error("Error en ranking:", err);
    setStatus("Error al cargar el ranking.", "error");
  }
});

// Inicializar al cargar
window.addEventListener('load', () => {
  actualizarVisibilidadRankings();
  
  // Verificar si hay un ranking ya cargado y ajustarlo
  const categoria = topSelect.value;
  if (categoria !== "nada") {
    // Si ya hay un ranking seleccionado, asegurar visibilidad correcta
    setTimeout(() => {
      actualizarVisibilidadRankings();
      sincronizarRankings();
    }, 100);
  }
});

// Actualizar al cambiar tamaño de ventana
window.addEventListener('resize', () => {
  actualizarVisibilidadRankings();
  
  // Si hay un ranking visible, ajustar su posición
  const categoria = topSelect.value;
  if (categoria !== "nada") {
    setTimeout(actualizarVisibilidadRankings, 50);
  }
});