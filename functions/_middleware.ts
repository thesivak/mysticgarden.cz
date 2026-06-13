const blockedHosts = new Set(['mysticgarden-cz.pages.dev']);

export const onRequest: PagesFunction = async ({ request, next }) => {
  const host = new URL(request.url).hostname.toLowerCase();

  if (blockedHosts.has(host)) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'cache-control': 'no-store',
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  return next();
};
