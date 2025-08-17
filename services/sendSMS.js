const plivo = require('plivo');

// Zamijeni svojim plivo podacima
const authId = 'YOUR_PLIVO_AUTH_ID';
const authToken = 'YOUR_PLIVO_AUTH_TOKEN';
const client = new plivo.Client(authId, authToken);


const API_KEY = 'c1f85a11-962f-4176-849f-20c7af42fe0b';
const DEVICE_ID = '689c5fe527e637fe5940b3e6';
const BASE_URL = 'https://api.textbee.dev/api/v1';

async function sendSMS(to, message) {
  const response = await fetch(`${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      recipients: [formatPhoneNumber(to)], // Zamijeni s stvarnim brojem
      message: message,
      sender: 'Gricko' // alfanumerički ID
    }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Poruka poslana:', data);
  } else {
    const errorData = await response.json();
    console.error('❌ Greška:', errorData);
  }
}

function formatPhoneNumber(rawNumber) {
  const number = rawNumber.replace(/\s+/g, ''); // makni razmake

  if (number.startsWith('+')) {
    return number; // već u E.164
  }

  if (number.startsWith('00')) {
    return '+' + number.slice(2); // pretvori 00 u +
  }

  if (number.startsWith('0')) {
    const cleaned = number.slice(1);
    // HR brojevi su 9 znamenki nakon nule, npr. 958138612
    if (/^\d{8,9}$/.test(cleaned)) {
      return '+385' + cleaned;
    } else {
      throw new Error('Neispravan lokalni broj. Ne možemo pretpostaviti državu.');
    }
  }

  throw new Error('Neispravan broj: očekivan +, 00, ili lokalni broj s 0.');
}


// Primjer:
// sendSMS(formatPhoneNumber('0958138612'), 'Vaša narudžba je prihvaćena!');

module.exports = { sendSMS };