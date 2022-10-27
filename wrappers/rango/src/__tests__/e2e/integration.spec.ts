import { PolywrapClient } from "@polywrap/client-js";
import * as App from "../types/wrap";
import path from "path";

jest.setTimeout(60000);

describe("Template Wrapper End to End Tests", () => {

  const client: PolywrapClient = new PolywrapClient();
  let wrapperUri: string;

  beforeAll(() => {
    const dirname: string = path.resolve(__dirname);
    const wrapperPath: string = path.join(dirname, "..", "..", "..");
    wrapperUri = `fs/${wrapperPath}/build`;
  })

  it("calls sampleMethod", async () => {
    const expected: string = "polywrap";

    const result = await client.invoke<App.Template_Metadata>({
      uri: wrapperUri,
      method: "getMetadata",
      args: {}
    });

    console.log(result);

    expect(result.ok).toBeTruthy();
    if (!result.ok) return;
    expect(result.value.tokens.get("1")).toEqual(expected);
  });
});
