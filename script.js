document.getElementById("consultarBtn").addEventListener("click", async () => {
  const id = document.getElementById("userId").value.trim();
  const resultado = document.getElementById("resultado");
  const error = document.getElementById("error");

  if (!id) {
    alert("Por favor ingresa un ID de usuario");
    return;
  }

  try {
    const response = await fetch(`https://recicla.onrender.com/consulta/${id}`);
    if (!response.ok) throw new Error("Usuario no encontrado");

    const data = await response.json();

    document.getElementById("nombreUsuario").textContent = data.nombre;
    document.getElementById("latas").textContent = data.lata;
    document.getElementById("tetra").textContent = data.tetra;
    document.getElementById("vidrio").textContent = data.vidrio;
    document.getElementById("total").textContent = data.total;

    resultado.classList.remove("oculto");
    error.classList.add("oculto");
  } catch (err) {
    resultado.classList.add("oculto");
    error.classList.remove("oculto");
  }
});
