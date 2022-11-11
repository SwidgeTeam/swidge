use polywrap_wasm_rs::BigNumber;
use serde::{Deserialize, Serialize};
use crate::Token;

#[derive(Serialize, Deserialize)]
pub struct Price {
    pub usd: BigNumber,
}

impl Token {
    pub fn build(address: &str, name: &str, symbol: &str, decimals: i32, logo: Option<String>) -> Token {
        Token {
            address: address.to_string(),
            name: name.to_string(),
            symbol: symbol.to_string(),
            decimals,
            logo,
            price: None,
        }
    }
}