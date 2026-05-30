/**
 * Netlify Function: payment-webhook
 * Recebe notificações do Mercado Pago e marca o passageiro como pago no Firebase.
 *
 * Variáveis de ambiente:
 *   MP_ACCESS_TOKEN      — chave de acesso do MP
 *   FIREBASE_DB_URL      — ex: https://caronas-lhpv-default-rtdb.firebaseio.com
 *   FIREBASE_WEB_API_KEY — chave da web app do Firebase (para autenticar via REST)
 */

const https = require('https');

exports.handler = async function (event) {
  // MP envia GET para validar a URL e POST para notificações
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, body: 'OK' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const notification = JSON.parse(event.body || '{}');
    console.log('Webhook recebido:', JSON.stringify(notification));

    // MP envia dois formatos: IPN (type+data.id) e Webhooks (action+data.id)
    const paymentId = notification?.data?.id;
    if (!paymentId) return { statusCode: 200, body: 'sem id' };

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return { statusCode: 500, body: 'sem token' };

    // Buscar detalhes do pagamento na API do MP
    const paymentRes = await callMPGet(`/v1/payments/${paymentId}`, accessToken);
    if (paymentRes.statusCode !== 200) {
      console.error('Erro ao buscar pagamento:', paymentRes.body);
      return { statusCode: 200, body: 'erro ao buscar' }; // 200 para MP não retentar
    }

    const payment = paymentRes.body;
    console.log('Pagamento status:', payment.status, payment.metadata);

    // Só processar pagamentos aprovados
    if (payment.status !== 'approved') {
      return { statusCode: 200, body: `status: ${payment.status}` };
    }

    // Recuperar metadados que enviamos na preferência
    const { event_id: eventId, trip_id: tripId, car_id: carId, pax_name: paxName }
      = payment.metadata || {};

    if (!eventId || !tripId || !carId) {
      console.warn('Metadados incompletos no pagamento:', payment.metadata);
      return { statusCode: 200, body: 'metadados incompletos' };
    }

    // Atualizar Firebase via REST (sem SDK)
    const dbUrl = process.env.FIREBASE_DB_URL;
    if (!dbUrl) return { statusCode: 200, body: 'FIREBASE_DB_URL não configurado' };

    // Buscar passageiros do carro para encontrar o paxId pelo nome
    const carsPath = `/events/${eventId}/cars/${tripId}/${carId}/passengers.json`;
    const paxRes   = await firebaseGet(dbUrl, carsPath);

    if (paxRes.statusCode === 200 && paxRes.body) {
      const passengers = paxRes.body;
      const paxEntry   = Object.entries(passengers)
        .find(([, p]) => p.name === paxName);

      if (paxEntry) {
        const [paxId] = paxEntry;
        const paidPath = `/events/${eventId}/cars/${tripId}/${carId}/passengers/${paxId}/paid.json`;
        await firebasePut(dbUrl, paidPath, true);
        // Salvar referência do pagamento MP
        const mpRefPath = `/events/${eventId}/cars/${tripId}/${carId}/passengers/${paxId}/mpPaymentId.json`;
        await firebasePut(dbUrl, mpRefPath, String(paymentId));
        console.log(`✅ Passageiro ${paxName} (${paxId}) marcado como pago`);
      } else {
        console.warn('Passageiro não encontrado pelo nome:', paxName);
      }
    }

    return { statusCode: 200, body: 'ok' };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 200, body: 'erro interno' }; // 200 para não retentar
  }
};

function callMPGet(path, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ statusCode: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function firebaseGet(dbUrl, path) {
  return new Promise((resolve, reject) => {
    const url   = new URL(dbUrl + path);
    const options = { hostname: url.hostname, path: url.pathname + url.search, method: 'GET' };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ statusCode: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function firebasePut(dbUrl, path, value) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(value);
    const url     = new URL(dbUrl + path);
    const options = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'PUT',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ statusCode: res.statusCode }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
