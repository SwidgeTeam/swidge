import 'dotenv/config';
import axios from 'axios';
import { Avalanche, BSC, Fantom, Optimism, Polygon } from '../src/shared/enums/ChainIds';

async function run() {
  const apiUrl = process.env.API_URL;
  const secret = '';
  let tokens;

  try {
    const response = await axios.get(
      'https://api.rango.exchange/meta/compact?apiKey=4a624ab5-16ff-4f96-90b7-ab00ddfc342c',
    );
    tokens = response.data.tokens;
  } catch (e) {
    console.log(e);
    return;
  }

  do {
    const list = [];
    for (const token of tokens.splice(0, 100)) {
      let chainId;
      try {
        chainId = getBlockchainCode(token.b);
      } catch (e) {
        continue;
      }
      if (!token.a || !token.d) {
        continue;
      }
      list.push({
        chainId: chainId,
        address: token.a.toLowerCase(),
        name: token.n ? cleanString(token.n) : token.s,
        symbol: token.s,
        decimals: token.d,
        logo: token.i,
      });
    }

    await axios
      .post(
        `${apiUrl}/add-tokens`,
        {
          list: list,
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

    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (tokens.length > 0);
}

run()
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });

function getBlockchainCode(chainId: string): string {
  switch (chainId) {
    case 'OPTIMISM':
      return Optimism;
    case 'BSC':
      return BSC;
    case 'POLYGON':
      return Polygon;
    case 'FANTOM':
      return Fantom;
    case 'AVAX_CCHAIN':
      return Avalanche;
    default:
      throw new Error('blockchain not supported');
  }
}

function cleanString(input) {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}
