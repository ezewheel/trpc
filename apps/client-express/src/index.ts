const BASE = "http://localhost:3002";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

async function main() {
  const res = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      // falta el nombre, pero TypeScript no detecta el error.
      email: "ana@mail.com",
      age: 28,
    }),
  });

  const user = (await res.json()) as User;

  console.log("Creado:", user);
  console.log(user.name);
}

// El endpoint, el método HTTP y el formato de la request
// los definimos manualmente.

// Además, User es otra definición del contrato:
// si el servidor cambia, esta interfaz puede quedar desactualizada.
