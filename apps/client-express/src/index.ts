const BASE = "http://localhost:3002";

const nuevoUsuario = {
  name: "Ana",
  email: "ana@mail.com",
  age: 28,
};

async function main() {
  // ── El caso que funciona ──────────────────────────────────────────
  const ok = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
  });

  console.log("createUser:", await ok.json());

  // ═════════════════════════════════════════════════════════════════
  // PROBLEMA A: el body es un string armado a mano.
  // ═════════════════════════════════════════════════════════════════
  // El typo está a la vista, en `nombre`. El server responde 400 y vos
  // te enterás acá, ejecutando, no compilando.

  const user = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nombre: "Ana", // debería ser 'name'
      email: "ana@mail.com",
      age: 28,
    }),
  });

  console.log(
    "PROBLEMA A → status:",
    user.status,
    "| body:",
    JSON.stringify(await user.json()).slice(0, 70),
  );

  // En tRPC, `client.createUser.mutate({ nombre: "Ana" })` es error de
  // compilación. El typo se detecta sin ejecutar nada.

  // ═════════════════════════════════════════════════════════════════
  // PROBLEMA B: la respuesta no tiene tipo.
  // ═════════════════════════════════════════════════════════════════
  const res = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
  });

  const data: unknown = await res.json();

  // OJO: el `as any` de abajo es OBLIGATORIO. Sin él, la línea siguiente
  // da error TS18046 ('data' es de tipo 'unknown'). TypeScript te
  // protege... hasta que necesitás hacer algo útil. Y castear a `any`
  // es siempre necesario, porque nadie parsea un `unknown` a mano.
  // En el momento del cast, la protección desaparece:
  const json = data as any;

  console.log("PROBLEMA B → esto imprime:", json.nombre);

  // `nombre` no existe: el server devuelve `name`. COMPILA. El server
  // responde 201 igual, vos imprimís `undefined`, y la app muestra
  // datos vacíos. Nadie se entera hasta que pasa en producción.
  //
  // En tRPC, `user.name` está garantizado por el tipo que se generó
  // desde tu router. Si renombrás el campo, el cliente deja de compilar.

  // ═════════════════════════════════════════════════════════════════
  // PROBLEMA C: una URL mal escrita no es error de nada.
  // ═════════════════════════════════════════════════════════════════
  const malUrl = await fetch(`${BASE}/create-user`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
  });

  console.log("PROBLEMA C → status:", malUrl.status);

  // fetch NO tira error con un 404: solo devuelve la respuesta y seguís
  // como si nada. Si no chequeás `.status`, te comés un body vacío o un
  // HTML de error sin enterarte.
  //
  // OJO: Express enruta sin distinguir mayúsculas, así que `/createuser`
  // SÍ matchea `/createUser`. Por eso arriba usé un guion.
  //
  // En tRPC, `client.createUser.mutate(...)` con un nombre mal escrito
  // es error de compilación: el cliente literalmente no tiene ese método.

  // ═════════════════════════════════════════════════════════════════
  // PROBLEMA D: el tipo lo escribís vos, y no lo chequea nadie.
  // ═════════════════════════════════════════════════════════════════
  // Esta es la mejor idea que se puede tener con Express: en vez de
  // comerte un `unknown`, declarás la forma de la respuesta. Y funciona.
  interface User {
    id: number;
    name: string;
    email: string;
    age: number;
  }

  const typedRes = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
  });

  const typed = (await typedRes.json()) as User;

  console.log("PROBLEMA D → bien tipeado:", typed.name, typed.email, typed.age);

  // ── Ahora mirá lo que pasa si la interface se equivoca ────────────
  // Esta NO coincide con lo que devuelve el server. Y compila igual.
  interface UserMentirosa {
    id: number;
    nombre: string; // el server manda `name`, no `nombre`
  }

  const mentirosoRes = await fetch(`${BASE}/createUser`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(nuevoUsuario),
  });

  const mentiroso = (await mentirosoRes.json()) as UserMentirosa;

  console.log("PROBLEMA D → interface mentirosa:", mentiroso.nombre);

  // Arriba compiló `mentiroso.nombre` contra un campo que el server
  // nunca manda, e imprime `undefined`. Es EXACTAMENTE el PROBLEMA B.
  //
  // La diferencia es que vos lo declaraste, y TypeScript te creyó.
  // `as User` no verifica NADA: es una promesa, no un chequeo.
  //
  // ── Por qué el server no te salva ─────────────────────────────────
  // Son TRES copias de la misma forma, y las escribiste vos:
  //
  //   1. type User              apps/server-express/src/api/index.ts
  //   2. z.object({ ... })      apps/server-express/src/api/index.ts
  //   3. interface User         apps/client-express/src/index.ts
  //
  // El PROBLEMA A era que el body era una string suelta. Acá escribiste
  // el tipo a mano, que suena más seguro, pero es la misma manualidad:
  // si mañana el server agrega `lastName`, el `interface User` queda
  // viejo y el `as User` sigue compilando igual.
  //
  // tRPC no tiene este problema porque el tipo NO lo escribís vos: lo
  // DERIVA del router. No hay una segunda copia que pueda quedar vieja
  // porque no hay una segunda fuente de verdad. El compilador leyó el
  // mismo archivo que se está ejecutando.
  //
  // ── Lo mejor que Express puede lograr ─────────────────────────────
  // Exportar el schema Zod del server e importarlo en el cliente:
  //
  //   // server-express/src/api/index.ts
  //   export const createUserSchema = z.object({ ... });
  //   export type User = z.infer<typeof createUserSchema>;
  //
  //   // client-express
  //   import { createUserSchema } from "server-express/api";
  //
  // Eso elimina la copia manual del INPUT (una sola fuente de verdad).
  // Pero el RETURN sigue sin tipo: el server no declara qué devuelve,
  // así que la respuesta sigue siendo `unknown` y el `as` sigue siendo
  // una promesa. Eso es lo que tRPC resuelve y Express no.
}

main();
