import fs = require('fs');
import 'dotenv/config';
import axios from 'axios';

async function run() {
  const chainId = '';
  const apiUrl = process.env.API_URL;
  const data = fs.readFileSync('./scripts/tokens.json', 'utf8');
  const rawTokens = JSON.parse(data);
  const secret = '';

  if (!chainId) {
    throw new Error('Need to input chain ID');
  }

  if (rawTokens.length === 0) {
    throw new Error('Empty array');
  }

  const tokens = rawTokens.map((token) => {
    if (!token.id) {
      throw new Error('Empty address');
    }

    return {
      chainId: chainId,
      address: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logo: token.logo,
    };
  });

  return axios
    .post(
      `${apiUrl}/add-tokens`,
      {
        list: tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      },
    )
    .then((response) => {
      return response.data;
    });
}

run()
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
