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
    return await handlePostRequest(env, data);
  } catch (err) {
    console.error(`Error occurred:`, err.message);
    return new Response(JSON.stringify({ error: err.message }), { headers });
  }
}

async function handlePostRequest(env, data) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "*",
  });
  if (data.LongUrl) {
    if (isValidHttpUrl(data.LongUrl)) {
      const recordInDb = await getDbRecordByLong(env, data.LongUrl);
      if (recordInDb) {
        const jsonResponse = JSON.stringify(recordInDb);
        return new Response(jsonResponse, { headers });
      } else {
        const jsonResponse = await createDbRecord(env, data.LongUrl);
        return new Response(jsonResponse, { headers });
      }
    }
    throw new Error(`longUrl must be a valid URL string`);
  } else if (data.ShortCode) {
    if (isValidShortCode(data.ShortCode)) {
      const recordInDb = (await getDbRecordByShort(env, data.ShortCode)) || {};
      const jsonResponse = JSON.stringify(recordInDb);
      return new Response(jsonResponse, { headers });
    }
    throw new Error(`Invalid shortCode`);
  } else {
    throw new Error(`Invalid or missing parameter`);
  }
}

async function getDbRecordByShort(env, ShortCode) {
  const query = "SELECT * FROM links WHERE ShortCode = ? LIMIT 1";
  const result = await env.database.prepare(query).bind(ShortCode).first();
  return result;
}

async function getDbRecordByLong(env, LongUrl) {
  const query = "SELECT * FROM links WHERE LongUrl = ? LIMIT 1";
  const result = await env.database.prepare(query).bind(LongUrl).first();
  return result;
}

async function createDbRecord(env, LongUrl) {
  const shortCode = await generateShortCode(env);
  await env.database
    .prepare("INSERT INTO links (ShortCode, LongUrl) VALUES (?1, ?2)")
    .bind(shortCode, LongUrl)
    .run();
  return JSON.stringify({ ShortUrl: `nin.sh/${shortCode}` });
}

async function generateShortCode(env) {
  let attempt = 1;
  let strLen = 5;
  let ShortCode;
  do {
    ShortCode = Math.random().toString(36).substr(2, strLen);
    if (attempt % 10 === 0) strLen++;
    if (attempt++ >= 20) throw new Error(`unable to create short code`);
  } while (
    await env.database
      .prepare(`SELECT * FROM links WHERE ShortCode = '${ShortCode}'`)
      .first()
  );
  return ShortCode;
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
