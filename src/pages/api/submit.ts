import type { APIRoute } from "astro";
import fs from "fs";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const uuid = crypto.randomUUID();
  fs.writeFileSync(
    `art/${uuid}.json`,
    JSON.stringify({
      pixels: body.pixels,
      uuid: uuid,
    })
  );
  return new Response(JSON.stringify({ message: "Hello, world!" }));
};
