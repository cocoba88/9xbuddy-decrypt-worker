export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("9xbuddy Decrypt Worker is running.", { status: 200 });
    }

    if (url.pathname === "/health") {
      return new Response("Worker is running!", { status: 200 });
    }

    if (url.pathname === "/decrypt") {
      try {
        const { encryptedUrl } = await request.json();

        const decrypted = await decryptFrom9xbuddy(encryptedUrl);

        if (decrypted && Object.keys(decrypted).length > 0) {
          return new Response(JSON.stringify({ data: decrypted }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ error: "No quality links found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid input", details: e.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

// Fungsi utama untuk fetch dan parse dari 9xbuddy
async function decryptFrom9xbuddy(encryptedUrl) {
  const result = {};
  const apiUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;

  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CloudflareWorkerBot/1.0)",
    },
  });

  const html = await res.text();

  // Parse <a href="...">[Quality]</a> seperti pada 9xbuddy
  const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(\d{3,4}p)<\/a>/g)];

  for (const [, href, quality] of links) {
    result[quality] = href;
  }

  return result;
}
