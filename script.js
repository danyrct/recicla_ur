// script.js - versión con logging detallado para depuración
const consultarBtn = document.getElementById("consultarBtn");
const userIdInput = document.getElementById("userId");
const resultado = document.getElementById("resultado");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");

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
    // Ejecutar fetch con timeout
    const response = await fetchWithTimeout(url, { method: "GET", cache: "no-store" }, 10000);
    console.log("Fetch completado. Código HTTP:", response.status);

    // Revisar status HTTP
    if (!response.ok) {
      console.warn("Respuesta HTTP no OK:", response.status, response.statusText);
      // mostrar mensaje más claro en pantalla
      if (response.status === 404) {
        setStatus("Usuario no encontrado (404). Revisa el ID.", "error");
      } else if (response.status === 500) {
        setStatus("Error del servidor (500). Intenta más tarde.", "error");
      } else {
        setStatus(`Error: ${response.status} ${response.statusText}`, "error");
      }

      // También comprobar si el cuerpo trae información de error
      try {
        const txt = await response.text();
        console.log("Cuerpo de la respuesta (texto):", txt);
      } catch (e) {
        console.log("No se pudo leer cuerpo de respuesta:", e);
      }
      return;
    }

    // Intentar parsear JSON y comprobar estructura
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

    // Validar campos esperados
    const expected = ["lata", "tetra", "vidrio", "total", "nombre", "user_id"];
    const missing = expected.filter(k => !(k in data));
    if (missing.length > 0) {
      console.warn("Faltan campos esperados en el JSON:", missing);
      setStatus("Respuesta incompleta desde el servidor. Ver consola para detalles.", "error");
      console.log("Objeto recibido:", data);
      return;
    }

    // Todo bien: mostrar en la UI
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

    // Posibles causas comunes y cómo verificarlas
    setStatus("No se pudo completar la consulta. Ver consola para más detalles.", "error");
    console.log("Posibles causas a revisar:");
    console.log("- ¿El servidor está en línea?");
    console.log("- ¿Hay un problema de CORS? (Revisa la pestaña Network → el encabezado CORS)");
    console.log("- ¿Tu conexión a internet está activa?");
    console.log("- Verifica la URL y el ID.");
  }
});