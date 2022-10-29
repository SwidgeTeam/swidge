import { PolywrapClient } from "@polywrap/client-js";
import path from "path";

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {

  const client: PolywrapClient = new PolywrapClient({
    interfaces: [
      {
        interface: "wrap://ipfs/QmbaTvgNrDafcChhFZw83aSKMq57iyWwdvWzuMhWKmgj55",
        implementations: [
          "wrap://ipfs/QmNfgGbY8s1TRr8mRahE6RxDzsBkj1o7a6VJs2ne6mGFgB",
          "wrap://ipfs/QmVZptPRpj4KyER6Ry1wzm4HNKBxRPS4Gs6Xhoy2tmg4kp"
        ]
      }
    ]
  });
  let wrapperUri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;
  })

  it("calls sampleMethod", async () => {
    const result = await client.invoke<{
      ok: boolean,
      value: any
    }>({
      uri: wrapperUri,
      method: "getMetadata",
      args: {}
    });

    console.log(result.value);

    expect(result.ok).toBeTruthy();
    if (!result.ok) return;
  });
});
