// Cloudflare Worker — GitHub proxy for autobiography-saurav
//
// Environment secrets (set in Cloudflare dashboard):
//   GITHUB_TOKEN  — your fine-grained PAT with Contents: read/write
//   GITHUB_REPO   — "dhiyanshiai/autobiography-saurav"

const ALLOWED_ORIGIN = 'https://dhiyanshiai.github.io';

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

async function handleRequest(request, env) {
  var origin = request.headers.get('Origin') || '';

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  // Only allow POST from the app
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Parse body
  var body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400, headers: cors(origin) });
  }

  var path    = body.path;
  var message = body.message;
  var content = body.content;

  if (!path || !message || !content) {
    return new Response('Missing fields: path, message, content', {
      status: 400,
      headers: cors(origin)
    });
  }

  // Use token + repo from Worker environment secrets
  var token = env.GITHUB_TOKEN;
  var repo  = env.GITHUB_REPO || 'dhiyanshiai/autobiography-saurav';

  var githubUrl = 'https://api.github.com/repos/' + repo + '/contents/' + path;

  var githubRes = await fetch(githubUrl, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type':  'application/json',
      'User-Agent':    'autobiography-saurav-worker'
    },
    body: JSON.stringify({ message: message, content: content })
  });

  var data = await githubRes.text();

  return new Response(data, {
    status: githubRes.status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors(origin))
  });
}

export default {
  fetch: handleRequest
};
