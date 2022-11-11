use std::fmt;
use std::fmt::{Formatter, write};
use polywrap_wasm_rs::Map;
use crate::Token;

pub const API_URL: &str = "https://api.coingecko.com/api/v3/";

#[derive(Eq, Ord, PartialOrd, PartialEq, enum_utils::FromStr)]
pub enum Chain {
    Ethereum,
    Polygon,
    Fantom,
}

impl fmt::Display for Chain {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        return match &self {
            Chain::Ethereum => write!(f, "Ethereum"),
            Chain::Polygon => write!(f, "Polygon"),
            Chain::Fantom => write!(f, "Fantom"),
        };
    }
}

pub fn tokens() -> Map<Chain, Vec<Token>> {
    Map::from([
        (Chain::Ethereum, Vec::from([
            Token::build(
                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                "USDCoin",
                "USDC",
                6,
                None,
            ),
        ])),
        (Chain::Polygon, Vec::from([
            Token::build(
                "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
                "USDCoin",
                "USDC",
                6,
                None,
            ),
        ])),
        (Chain::Fantom, Vec::from([
            Token::build(
                "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                "USDCoin",
                "USDC",
                6,
                None,
            ),
        ]))
    ])
}
