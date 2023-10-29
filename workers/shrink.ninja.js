/**
 * Worker that gets triggered via api.shrink.ninja
 */

export default {
  async fetch(request, env) {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    try {
      if (request.method === "POST") {
        const data = await request.json();
        if (data.longUrl) {
          if (isValidHttpUrl(data.longUrl)) {
            const shortCode = await generateShortCode(env);
            await env.shrinkninja_kv.put(shortCode, data.longUrl);
            const resJson = JSON.stringify({ shortUrl: `nin.sh/${shortCode}` });
            return new Response(resJson, { headers: headers });
          }
          throw new Error(`longUrl must be a valid url string`);
        } else if (data.shortCode) {
          const longUrl = (await env.shrinkninja_kv.get(data.shortCode)) || "";
          return new Response(JSON.stringify({ longUrl: `${longUrl}` }), {
            headers: headers,
          });
        } else {
          throw new Error(`missing parameter`);
        }
      } else {
        throw new Error(`unsupported method`);
      }
    } catch (err) {
      console.error(`Error occurred:`, err.message);
      return new Response(JSON.stringify({ error: err.message }), {
        headers: headers,
      });
    }
  },
};

async function generateShortCode(env) {
  let attempt = 1;
  let strLen = 5;
  let shortCode;
  do {
    shortCode = Math.random().toString(36).substr(2, strLen);
    if (attempt % 10 === 0) strLen++;
    if (attempt++ >= 20) throw new Error(`unable to create short code`);
  } while (await env.shrinkninja_kv.get(shortCode));
  return shortCode;
}

function isValidHttpUrl(string) {
  try {
    let url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
