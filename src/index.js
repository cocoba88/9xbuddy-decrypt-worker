export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("9xbuddy Worker active", { status: 200 });
    }

    if (url.pathname === "/decrypt") {
      return await handleDecrypt(request);
    }

    if (url.pathname === "/debug-html") {
      return await handleDebugHtml(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleDebugHtml(request) {
  const { encryptedUrl } = await request.json();
  const processUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;
  const res = await fetch(processUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CFWorkerBot/1.0)",
    },
  });
  const html = await res.text();
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

async function handleDecrypt(request) {
  // (kode sebelumnya kalau kamu ingin kembalikan JSON list link)
  return new Response(JSON.stringify({ message: "Decrypt in progress..." }), {
    headers: { "Content-Type": "application/json" },
  });
}
