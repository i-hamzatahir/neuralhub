export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/monitoring/server-errors");
  }
}

export const onRequestError = async (
  error: { digest?: string } & Error,
  request: { path: string; method: string; headers: { [key: string]: string } },
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { reportServerError } = await import(
    "./lib/monitoring/server-errors"
  );

  await reportServerError({
    message: error.message,
    digest: error.digest,
    path: request.path,
    method: request.method,
  });
};
