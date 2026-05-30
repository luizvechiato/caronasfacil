/**
 * Netlify Function: create-payment
 * Cria uma preferência de pagamento no Mercado Pago e retorna a URL de checkout.
 *
 * Variáveis de ambiente necessárias (configurar no painel do Netlify):
 *   MP_ACCESS_TOKEN  — chave de acesso do MP (começa com TEST- em sandbox, APP_USR- em produção)
 *   URL              — URL base do site (ex: https://caronasfacil.com.br) — preenchida automaticamente pelo Netlify
 */

const https = require('https');

exports.handler = async function (event) {
  // Apenas POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  // CORS para desenvolvimento local
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount, description, eventId, tripId, carId, paxName } = body;

    if (!amount || amount <= 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valor inválido' }) };
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'MP_ACCESS_TOKEN não configurado' }) };
    }

    const isSandbox = accessToken.startsWith('TEST-');
    const siteUrl   = process.env.URL || process.env.DEPLOY_URL || 'https://caronasfacil.com.br';

    // Montar preferência de pagamento
    const preference = {
      items: [{
        title:      description || 'Carona Fácil',
        quantity:   1,
        currency_id: 'BRL',
        unit_price: parseFloat(amount),
      }],
      payer: {
        name: paxName || 'Passageiro',
      },
      back_urls: {
        success: `${siteUrl}/event.html?id=${eventId}&payment=success&tripId=${tripId}&carId=${carId}`,
        failure: `${siteUrl}/event.html?id=${eventId}&payment=failure`,
        pending: `${siteUrl}/event.html?id=${eventId}&payment=pending`,
      },
      auto_return:          'approved',
      statement_descriptor: 'CARONAS FACIL',
      metadata:             { eventId, tripId, carId, paxName },
      // Taxa de parcelamento — passageiro vê o custo do cartão
      payment_methods: {
        installments: 1,       // sem parcelamento por padrão (muda para 12 quando quiser)
        default_installments: 1,
      },
    };

    // Chamar API do Mercado Pago
    const mpResponse = await callMPApi('/checkout/preferences', 'POST', preference, accessToken);

    if (mpResponse.statusCode !== 201) {
      console.error('MP API error:', mpResponse.body);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Erro ao criar pagamento', details: mpResponse.body }),
      };
    }

    const checkoutUrl = isSandbox
      ? mpResponse.body.sandbox_init_point
      : mpResponse.body.init_point;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkoutUrl,
        preferenceId: mpResponse.body.id,
        sandbox: isSandbox,
      }),
    };

  } catch (err) {
    console.error('create-payment error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

/** Fazer chamada HTTPS para a API do Mercado Pago */
function callMPApi(path, method, data, accessToken) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method,
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(payload),
        'X-Idempotency-Key': `cf-${Date.now()}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ statusCode: res.statusCode, body }); }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
