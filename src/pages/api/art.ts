import type { APIRoute } from "astro";
import { readdir, readFile } from "fs/promises";

export const GET: APIRoute = async ({ params }) => {
  const files = await readdir("art");
  // each file is json, get the contents
  const art = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(`art/${file}`, "utf-8");
      return JSON.parse(contents);
    })
  );

  return new Response(JSON.stringify(art));
};
