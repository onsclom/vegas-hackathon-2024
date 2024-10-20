import type { APIRoute } from "astro";
import { readdir, readFile } from "fs/promises";

export const GET: APIRoute = async ({ params }) => {
  const files = await readdir("art");
  const contents = await readFile(`art/${params.uuid}.json`, "utf-8");
  return new Response(contents);
};
