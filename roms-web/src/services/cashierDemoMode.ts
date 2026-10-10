const READONLY_CASHIER_PATH =
  /^\/cashier\/(?:tables(?:\/[^/]+\/order)?|menu|transactions|revenue|audit-logs|end-of-day|shifts\/current)$/;

const DEMO_MUTATION_PATHS: Record<string, RegExp[]> = {
  POST: [
    /^\/cashier\/tables\/merge$/,
    /^\/cashier\/tables\/[^/]+\/mark-clean$/,
    /^\/cashier\/orders$/,
    /^\/cashier\/bills\/validate-promotion$/,
    /^\/cashier\/sessions\/[^/]+\/bill$/,
    /^\/cashier\/payments$/,
    /^\/cashier\/payments\/[^/]+\/refund$/,
    /^\/cashier\/bills\/[^/]+\/split$/,
  ],
};

export function isCashierDemoAuthBypassEnabled(): boolean {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_CASHIER_DEMO_AUTH_BYPASS === 'true'
  );
}

function getRequestPath(request: { url?: string; baseURL?: string }): string {
  if (!request.url) return '';

  return new URL(
    request.url,
    request.baseURL ?? 'http://localhost',
  ).pathname.replace(/^\/api\/v1(?=\/|$)/, '');
}

export function isCashierDemoRequest(request: {
  method?: string;
  url?: string;
  baseURL?: string;
}): boolean {
  const method = request.method?.toUpperCase();
  const path = getRequestPath(request);
  if (!method || !path) return false;

  if (method === 'GET' && READONLY_CASHIER_PATH.test(path)) return true;

  return (DEMO_MUTATION_PATHS[method] ?? []).some((pattern) =>
    pattern.test(path),
  );
}

export function isCashierApiRequest(request: {
  url?: string;
  baseURL?: string;
}): boolean {
  return getRequestPath(request).startsWith('/cashier/');
}
