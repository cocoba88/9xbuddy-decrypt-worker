export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("9xbuddy Worker active", { status: 200 });
    }

    if (url.pathname === "/decrypt") {
      try {
        const { encryptedUrl } = await request.json();
        const processUrl = `https://9xbuddy.com/process?url=${encodeURIComponent(encryptedUrl)}`;

        const res = await fetch(processUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; CFWorkerBot/1.0)",
          },
        });

        const html = await res.text();

        // Ekstrak semua <a href="..."> link dari HTML
        const links = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)];
        const extracted = links.map(match => match[1]);

        return new Response(JSON.stringify({ links: extracted }, null, 2), {
          headers: { "Content-Type": "application/json" },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
