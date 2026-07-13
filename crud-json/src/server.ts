const { appendFile, mkdir, readFile, writeFile } = require("fs/promises");
const http = require("http");
const path = require("path");
require("dotenv/config");

import type { IncomingMessage, ServerResponse } from "http";

const PORT = process.env.PORT || 3000;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const LOG_DIR = path.join(PROJECT_ROOT, "log");
const RESPONSE_DELAY_MS = Number(process.env.RESPONSE_DELAY_MS || 1000);
const ALLOWED_CORS_HOSTNAME = "localhost";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface Post {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

type PostInput = Partial<Pick<Post, "title" | "body">>;
type ErrorWithCode = Error & { code?: string };

function getCurrentDateFileName(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}.log`;
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isErrorWithCode(error: unknown, code: string): error is ErrorWithCode {
  return error instanceof Error && (error as ErrorWithCode).code === code;
}

function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "Error",
    message: String(error),
  };
}

async function logError(error: unknown, req: IncomingMessage | null = null): Promise<void> {
  const entry = {
    timestamp: new Date().toISOString(),
    level: "error",
    request: req
      ? {
          method: req.method,
          url: req.url,
          origin: getHeaderValue(req.headers.origin),
          userAgent: getHeaderValue(req.headers["user-agent"]),
        }
      : null,
    error: normalizeError(error),
  };

  try {
    console.log("Failed to write error log");
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(path.join(LOG_DIR, getCurrentDateFileName()), `${JSON.stringify(entry)}\n`, "utf8");
  } catch (logWriteError) {
    console.error("Failed to write error log:", logWriteError);
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function readPosts(): Promise<Post[]> {
  try {
    return await readJsonFile<Post[]>(POSTS_FILE);
  } catch (error) {
    if (isErrorWithCode(error, "ENOENT")) {
      await writePosts([]);
      return [];
    }

    throw error;
  }
}

async function writePosts(posts: Post[]): Promise<void> {
  await writeFile(POSTS_FILE, JSON.stringify(posts, null, 2) + "\n", "utf8");
}

function delayResponse(callback: () => void): void {
  const delayMs = Number.isFinite(RESPONSE_DELAY_MS) ? Math.max(0, RESPONSE_DELAY_MS) : 0;
  setTimeout(callback, delayMs);
}

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }

  try {
    const url = new URL(origin);
    return url.hostname === ALLOWED_CORS_HOSTNAME && (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

function applyCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const origin = getHeaderValue(req.headers.origin);

  res.setHeader("Vary", "Origin");

  if (origin && isAllowedCorsOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  delayResponse(() => {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(data));
  });
}

function sendNoContent(res: ServerResponse): void {
  delayResponse(() => {
    res.writeHead(204);
    res.end();
  });
}

function readRequestBody<T = Record<string, unknown>>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");

      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({} as T);
        return;
      }

      try {
        resolve(JSON.parse(body) as T);
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function getPostId(pathname: string): number | null {
  const match = pathname.match(/^\/posts\/([^/]+)$/);
  return match ? Number(match[1]) : null;
}

function validatePostInput(input: PostInput, partial = false): string[] {
  const errors: string[] = [];

  if (!partial || Object.prototype.hasOwnProperty.call(input, "title")) {
    if (typeof input.title !== "string" || input.title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "body")) {
    if (typeof input.body !== "string" || input.body.trim() === "") {
      errors.push("body is required and must be a non-empty string");
    }
  }

  return errors;
}

function normalizePostInput(input: PostInput): PostInput {
  const post: PostInput = {};

  if (Object.prototype.hasOwnProperty.call(input, "title") && typeof input.title === "string") {
    post.title = input.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(input, "body") && typeof input.body === "string") {
    post.body = input.body.trim();
  }

  return post;
}

function resolveDataJsonPath(rawJsonPath: string): string | null {
  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(rawJsonPath);
  } catch {
    return null;
  }

  const trimmedPath = decodedPath.replace(/^[/\\]+/, "");

  if (!trimmedPath || trimmedPath.includes("\0")) {
    return null;
  }

  const jsonPath = trimmedPath.endsWith(".json") ? trimmedPath : `${trimmedPath}.json`;
  const resolvedPath = path.resolve(DATA_DIR, jsonPath);
  const resolvedDataDir = path.resolve(DATA_DIR);

  if (!resolvedPath.endsWith(".json")) {
    return null;
  }

  if (resolvedPath !== resolvedDataDir && resolvedPath.startsWith(`${resolvedDataDir}${path.sep}`)) {
    return resolvedPath;
  }

  return null;
}

async function handleJsonFile(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const rawJsonPath = pathname.slice("/json/".length);
  const filePath = resolveDataJsonPath(rawJsonPath);

  if (!filePath) {
    sendJson(res, 400, { error: "Provide a valid JSON path under the data folder" });
    return;
  }

  try {
    const data = await readJsonFile<JsonValue>(filePath);
    sendJson(res, 200, data);
  } catch (error) {
    if (isErrorWithCode(error, "ENOENT")) {
      sendJson(res, 404, { error: "JSON file not found" });
      return;
    }

    await logError(error, req);
    sendJson(res, 500, { error: "Unable to read JSON file" });
  }
}

async function handlePosts(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  if (pathname === "/posts" && req.method === "GET") {
    const posts = await readPosts();
    sendJson(res, 200, posts);
    return;
  }

  if (pathname === "/posts" && req.method === "POST") {
    const input = await readRequestBody<PostInput>(req);
    const errors = validatePostInput(input);

    if (errors.length > 0) {
      sendJson(res, 400, { errors });
      return;
    }

    const posts = await readPosts();
    const nextId = posts.length === 0 ? 1 : Math.max(...posts.map((post) => post.id)) + 1;
    const now = new Date().toISOString();
    const newPost: Post = {
      id: nextId,
      title: input.title!.trim(),
      body: input.body!.trim(),
      createdAt: now,
      updatedAt: now,
    };

    posts.push(newPost);
    await writePosts(posts);
    sendJson(res, 201, newPost);
    return;
  }

  const postId = getPostId(pathname);

  if (!postId || Number.isNaN(postId)) {
    sendJson(res, 404, { error: "Route not found" });
    return;
  }

  const posts = await readPosts();
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex === -1) {
    sendJson(res, 404, { error: "Post not found" });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, posts[postIndex]);
    return;
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const input = await readRequestBody<PostInput>(req);
    const partial = req.method === "PATCH";
    const errors = validatePostInput(input, partial);

    if (errors.length > 0) {
      sendJson(res, 400, { errors });
      return;
    }

    const updatedPost: Post = {
      ...posts[postIndex],
      ...normalizePostInput(input),
      updatedAt: new Date().toISOString(),
    };

    posts[postIndex] = updatedPost;
    await writePosts(posts);
    sendJson(res, 200, updatedPost);
    return;
  }

  if (req.method === "DELETE") {
    posts.splice(postIndex, 1);
    await writePosts(posts);
    sendNoContent(res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    applyCorsHeaders(req, res);

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/") {
      sendJson(res, 200, {
        message: "Posts CRUD API",
        routes: ["GET /posts", "GET /posts/:id", "POST /posts", "PUT /posts/:id", "PATCH /posts/:id", "DELETE /posts/:id", "GET /json/:path"],
        examples: {
          postsJson: "/json/posts",
          usersJson: "/json/users",
          nestedJson: "/json/examples/items",
        },
      });
      return;
    }

    if (url.pathname === "/posts" || url.pathname.startsWith("/posts/")) {
      await handlePosts(req, res, url.pathname);
      return;
    }

    if (url.pathname.startsWith("/json/")) {
      await handleJsonFile(req, res, url.pathname);
      return;
    }

    sendJson(res, 404, { error: "Route not found" });
  } catch (error) {
    await logError(error, req);
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "Invalid JSON body" ? 400 : 500;
    sendJson(res, statusCode, { error: message });
  }
});

server.on("error", (error: Error) => {
  void logError(error);
});

process.on("unhandledRejection", (error) => {
  void logError(error);
});

process.on("uncaughtException", (error) => {
  logError(error).finally(() => {
    process.exit(1);
  });
});

server.listen(PORT, () => {
  console.log(`Posts API is running at http://localhost:${PORT}`);
});
