import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createRequestHandler } from "@react-router/express";
import { createRequestListener } from "@mjackson/node-fetch-server";
import compression from "compression";
import express from "express";
import getPort from "get-port";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";

import { getSecurityHeaders } from "./app/lib/security-headers.server.ts";

process.env.NODE_ENV = process.env.NODE_ENV ?? "production";

sourceMapSupport.install({
  retrieveSourceMap(source) {
    if (!source.startsWith("file://")) return null;

    const filePath = fileURLToPath(source);
    const sourceMapPath = `${filePath}.map`;

    if (!fs.existsSync(sourceMapPath)) return null;

    return {
      url: source,
      map: fs.readFileSync(sourceMapPath, "utf8"),
    };
  },
});

function parseNumber(raw: string | undefined) {
  if (raw === undefined) return undefined;
  const value = Number(raw);
  return Number.isNaN(value) ? undefined : value;
}

function isRSCServerBuild(build: unknown): build is {
  default: { fetch: (request: Request) => Promise<Response> };
  unstable_reactRouterServeConfig?: Record<string, string>;
} {
  return Boolean(
    typeof build === "object" &&
      build &&
      "default" in build &&
      typeof (build as { default?: unknown }).default === "object" &&
      (build as { default?: { fetch?: unknown } }).default &&
      "fetch" in (build as { default: { fetch: unknown } }).default &&
      typeof (build as { default: { fetch: unknown } }).default.fetch ===
        "function",
  );
}

async function run() {
  const port = parseNumber(process.env.PORT) ?? (await getPort({ port: 3000 }));
  const buildPathArg = process.argv[2];

  if (!buildPathArg) {
    console.error(
      "\nUsage: node --import tsx server.ts <server-build-path>\n",
    );
    process.exit(1);
  }

  const buildPath = path.resolve(buildPathArg);
  const buildModule = await import(pathToFileURL(buildPath).href);

  let build: {
    publicPath: string;
    assetsBuildDirectory: string;
    fetch?: (request: Request) => Promise<Response>;
  };
  let isRSCBuild = false;

  if (isRSCBuild = isRSCServerBuild(buildModule)) {
    const config = {
      publicPath: "/",
      assetsBuildDirectory: "../client",
      ...buildModule.unstable_reactRouterServeConfig,
    };

    build = {
      fetch: buildModule.default.fetch,
      publicPath: config.publicPath,
      assetsBuildDirectory: path.resolve(
        path.dirname(buildPath),
        config.assetsBuildDirectory,
      ),
    };
  } else {
    build = buildModule as typeof build;
  }

  const onListen = () => {
    const address =
      process.env.HOST ||
      Object.values(os.networkInterfaces())
        .flat()
        .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
        ?.address;

    if (!address) {
      console.log(`[retailpulse-serve] http://localhost:${port}`);
      return;
    }

    console.log(
      `[retailpulse-serve] http://localhost:${port} (http://${address}:${port})`,
    );
  };

  const app = express();
  app.disable("x-powered-by");

  app.use((req, res, next) => {
    const protocol =
      (typeof req.headers["x-forwarded-proto"] === "string"
        ? req.headers["x-forwarded-proto"].split(",")[0]?.trim()
        : undefined) ?? req.protocol;
    const host = req.headers.host ?? "localhost";
    const request = new Request(`${protocol}://${host}${req.originalUrl}`, {
      method: req.method,
      headers: req.headers as HeadersInit,
    });

    for (const [name, value] of Object.entries(getSecurityHeaders(request))) {
      res.setHeader(name, value);
    }

    next();
  });

  if (!isRSCBuild) {
    app.use(compression());
  }

  app.use(
    path.posix.join(build.publicPath, "assets"),
    express.static(path.join(build.assetsBuildDirectory, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  app.use(build.publicPath, express.static(build.assetsBuildDirectory));
  app.use(express.static("public", { maxAge: "1h" }));
  app.use(morgan("tiny"));

  if (build.fetch) {
    app.all("*", createRequestListener(build.fetch));
  } else {
    app.all(
      "*",
      createRequestHandler({
        build: buildModule,
        mode: process.env.NODE_ENV,
      }),
    );
  }

  const server = process.env.HOST
    ? app.listen(port, process.env.HOST, onListen)
    : app.listen(port, onListen);

  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => server.close(console.error));
  }
}

void run();
