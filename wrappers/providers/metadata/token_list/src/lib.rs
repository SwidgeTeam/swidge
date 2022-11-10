pub mod wrap;
mod constants;

use polywrap_wasm_rs::Map;
pub use wrap::*;
use crate::constants::*;

pub fn get_token_list(args: ArgsGetTokenList) -> Map<String, Vec<Token>> {
    let mut map: Map<String, Vec<Token>> = Map::new();

    map.insert(ETHEREUM.to_string(), Vec::from(
        [
            Token {
                address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".to_string(),
                name: "".to_string(),
                symbol: "USDC".to_string(),
                decimals: 6,
                logo: Some("lalala".to_string()),
            },
            Token {
                address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".to_string(),
                name: "".to_string(),
                symbol: "USDC".to_string(),
                decimals: 6,
                logo: Some("lalala".to_string()),
            }
        ]
    ));

    map.insert(POLYGON.to_string(), Vec::from(
        [
            Token {
                address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174".to_string(),
                name: "".to_string(),
                symbol: "USDC".to_string(),
                decimals: 6,
                logo: Some("lalala".to_string()),
            }
        ]
    ));

    map.insert(FANTOM.to_string(), Vec::from(
        [
            Token {
                address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75".to_string(),
                name: "".to_string(),
                symbol: "USDC".to_string(),
                decimals: 6,
                logo: Some("lalala".to_string()),
            }
        ]
    ));

    map
}

