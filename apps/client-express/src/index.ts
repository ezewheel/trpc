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
      // falta 'name', pero TypeScript no detecta el error
      email: "ana@mail.com",
      age: 28,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // el error se descubre recién cuando hacemos la request.
    console.log("Error:", data);
    return;
  }

  // confiamos en que la respuesta es un User
  const user = data as User;

  console.log("Creado:", user);
  console.log(user.name);
}

main();
