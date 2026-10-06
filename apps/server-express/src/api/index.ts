const BASE = "http://localhost:3002";

// El tipo de respuesta lo tenemos que definir manualmente.
// Si el servidor cambia, esta definición puede quedar desactualizada.
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

async function main() {
  const res = await fetch(`${BASE}/createUser`, {
    // Tenemos que definir manualmente el endpoint y el método HTTP.
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      // Falta 'name', pero TypeScript no detecta el error:
      // el objeto enviado a fetch no está vinculado al contrato del servidor.
      email: "ana@mail.com",
      age: 28,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // El error se descubre recién cuando hacemos la request.
    console.log("Error:", data);
    return;
  }

  // 'as User' no valida la respuesta: TypeScript simplemente confía en nosotros.
  const user = data as User;

  console.log("Creado:", user);
  console.log(user.name);
}

main();
