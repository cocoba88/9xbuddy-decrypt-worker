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

        // Contoh sederhana parsing (ganti dengan algoritma nyata nanti)
        const decrypted = parseEncryptedURL(encryptedUrl);

        if (decrypted && Object.keys(decrypted).length > 0) {
          return new Response(JSON.stringify({ data: decrypted }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ error: "No quality links found" }), {
            status: 400,
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

// Fungsi parsing dummy — ganti dengan algoritma nyata dari repo masa2146
function parseEncryptedURL(url) {
  const result = {};
  const base = url.split("?url=")[0] || "";
  const encoded = url.split("?url=")[1] || "";

  ["360p", "480p", "720p", "1080p"].forEach((quality) => {
    if (encoded.includes(quality)) {
      result[quality] = `${base}?url=${decodeURIComponent(encoded)}`;
    }
  });

  return result;
}
