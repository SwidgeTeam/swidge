use polywrap_wasm_rs::Map;

pub const API_URL: &str = "https://api.coingecko.com/api/v3/";

pub const ETHEREUM: &str = "ethereum";
pub const POLYGON: &str = "polygon-pos";
pub const FANTOM: &str = "fantom";

pub const TOKENS: Map<&str, Vec<&str>> = Map::from([
    (ETHEREUM, Vec::from([
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC
    ])),
    (POLYGON, Vec::from([
        "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" // USDC
    ])),
    (POLYGON, Vec::from([
        "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75" // USDC
    ])),
]);