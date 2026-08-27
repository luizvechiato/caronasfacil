/**
 * Netlify Function: notify-push
 * Envia notificações push reais via Firebase Cloud Messaging (API HTTP v1),
 * mesmo com o app fechado no celular do usuário.
 *
 * Não usa nenhuma dependência npm — apenas módulos nativos do Node
 * (https, crypto), no mesmo padrão de create-payment.js.
 *
 * Variáveis de ambiente necessárias (configurar no painel do Netlify,
 * em Site settings → Environment variables):
 *   FCM_PROJECT_ID    — o project id do Firebase (ex: caronas-lhpv)
 *   FCM_CLIENT_EMAIL  — campo "client_email" do JSON da conta de serviço
 *   FCM_PRIVATE_KEY   — campo "private_key" do JSON da conta de serviço
 *                       (cole exatamente como veio no JSON, com os \n)
 *
 * Como gerar essas 3 variáveis (feito 1x pelo dono do projeto, nunca por mim):
 *   1. Firebase Console → ⚙️ Configurações do projeto → Contas de serviço
 *   2. "Gerar nova chave privada" → baixa um arquivo .json
 *   3. Abra o .json e copie: project_id → FCM_PROJECT_ID,
 *      client_email → FCM_CLIENT_EMAIL, private_key → FCM_PRIVATE_KEY
 *   4. Cole as 3 no Netlify (Site settings → Environment variables) e
 *      dispare um novo deploy.
 *   5. Delete o arquivo .json baixado depois de configurar — não deixe
 *      salvo em nenhum lugar público.
 */

const https = require('https');
const crypto = require('crypto');

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Cria e assina um JWT (RS256) para o fluxo "service account" do Google OAuth2,
// depois troca esse JWT por um access_token via endpoint padrão do Google.
async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header  = { alg: 'RS256', typ: 'JWT' };
  const claims  = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey.replace(/\\n/g, '\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const jwt = `${unsigned}.${signature}`;

  const postData = `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(jwt)}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error('Falha ao obter access_token: ' + data));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sendOne(projectId, accessToken, token, title, body, url) {
  const message = {
    message: {
      token,
      notification: { title, body },
      webpush: {
        notification: { icon: '/icon-192.png' },
        fcm_options: { link: url || '/index.html' }
      },
      data: { title, body, url: url || '/index.html' }
    }
  };
  const payload = JSON.stringify(message);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'fcm.googleapis.com',
      path: `/v1/projects/${projectId}/messages:send`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ token, ok: res.statusCode < 300, status: res.statusCode, data }));
    });
    req.on('error', (e) => resolve({ token, ok: false, error: String(e) }));
    req.write(payload);
    req.end();
  });
}

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  const projectId  = process.env.FCM_PROJECT_ID;
  const clientEmail= process.env.FCM_CLIENT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    // Ainda não configurado — falha silenciosamente do ponto de vista do app
    // (a experiência principal não deve quebrar por falta de push).
    return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, skipped: true, reason: 'FCM não configurado' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const tokens = Array.isArray(body.tokens) ? body.tokens.filter(Boolean) : [];
    const title  = String(body.title || 'Caronas Fácil').slice(0, 120);
    const msg    = String(body.body  || '').slice(0, 500);
    const url    = body.url ? String(body.url) : undefined;

    if (!tokens.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ sent: 0 }) };
    }

    const accessToken = await getAccessToken(clientEmail, privateKey);
    const results = await Promise.all(tokens.map(t => sendOne(projectId, accessToken, t, title, msg, url)));
    const sent = results.filter(r => r.ok).length;
    return { statusCode: 200, headers, body: JSON.stringify({ sent, results }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, error: String(e) }) };
  }
};
