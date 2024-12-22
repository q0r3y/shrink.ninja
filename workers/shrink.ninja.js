/**
 * Worker that gets triggered via api.shrink.ninja
 */

async function fetch(request, env) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "*",
  });
  try {
    if (request.method !== "POST") {
      throw new Error(`Unsupported method`);
    }
    const data = await request.json();
    return await handlePostRequest(data, env);
  } catch (err) {
    console.error(`Error occurred:`, err.message);
    return new Response(JSON.stringify({ error: err.message }), { headers });
  }
}

async function handlePostRequest(data, env) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "*",
  });
  if (data.longUrl) {
    if (isValidHttpUrl(data.longUrl)) {
      const jsonResponse = await createDbRecord(data.longUrl, env);
      return new Response(jsonResponse, { headers });
    }
    throw new Error(`longUrl must be a valid URL string`);
  } else if (data.shortCode) {
    if (isValidShortCode(data.shortCode)) {
      const jsonResponse = await getDbRecord(data.shortCode, env);
      return new Response(jsonResponse, { headers });
    }
    throw new Error(`Invalid shortCode`);
  } else {
    throw new Error(`Invalid or missing parameter`);
  }
}

async function getDbRecord(shortCode, env) {
  const statement = env.shrinkninjadb.prepare(
    `SELECT * FROM links WHERE ShortCode = '${shortCode}'`
  );
  const result = (await statement.first()) || {};
  return JSON.stringify(result);
}

async function createDbRecord(longUrl, env) {
  const shortCode = await generateShortCode(env);
  await env.shrinkninjadb
    .prepare("INSERT INTO links (ShortCode, LongUrl) VALUES (?1, ?2)")
    .bind(shortCode, longUrl)
    .run();
  return JSON.stringify({ shortUrl: `nin.sh/${shortCode}` });
}

async function generateShortCode(env) {
  let attempt = 1;
  let strLen = 5;
  let shortCode;
  do {
    shortCode = Math.random().toString(36).substr(2, strLen);
    if (attempt % 10 === 0) strLen++;
    if (attempt++ >= 20) throw new Error(`unable to create short code`);
  } while (
    await env.shrinkninjadb
      .prepare(`SELECT * FROM links WHERE ShortCode = '${shortCode}'`)
      .first()
  );
  return shortCode;
}

function isValidHttpUrl(str) {
  try {
    let url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function isValidShortCode(str) {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (str.length >= 5 && str.length <= 8) {
    return alphanumericRegex.test(str);
  } else {
    return false;
  }
}

export default { fetch };
