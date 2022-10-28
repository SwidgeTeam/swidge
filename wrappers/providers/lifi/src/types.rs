use polywrap_wasm_rs::{BigNumber, Map};
use serde::{Deserialize, Serialize};
use crate::wrap::{ChainInfo, ChainNativeCurrency};

#[derive(Serialize, Deserialize)]
pub struct ChainsJson {
    pub chains: Vec<ChainJson>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainJson {
    pub id: i32,
    pub chain_type: String,
    pub name: String,
    #[serde(rename = "logoURI")]
    pub logo_uri: String,
    pub metamask: ChainInfoJson,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainInfoJson {
    pub chain_id: String,
    pub block_explorer_urls: Vec<String>,
    pub chain_name: String,
    pub native_currency: ChainNativeCurrencyJson,
    pub rpc_urls: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ChainNativeCurrencyJson {
    pub name: String,
    pub symbol: String,
    pub decimals: i32,
}

#[derive(Serialize, Deserialize)]
pub struct TokensJson {
    pub tokens: Map<String, Vec<TokenJson>>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenJson {
    pub address: String,
    pub symbol: String,
    pub decimals: i32,
    pub chain_id: i32,
    pub name: String,
    pub price_usd: Option<String>,
    pub logo_uri: Option<String>,
}

impl ChainInfo {
    pub fn build(info: ChainInfoJson) -> ChainInfo {
        ChainInfo {
            chain_name: info.chain_name,
            native_currency: ChainNativeCurrency::build(info.native_currency),
            block_explorer_urls: vec![],
            rpc_urls: vec![],
        }
    }
}

impl ChainNativeCurrency {
    pub fn build(currency: ChainNativeCurrencyJson) -> ChainNativeCurrency {
        ChainNativeCurrency {
            name: currency.name,
            decimals: currency.decimals,
            symbol: currency.symbol,
        }
    }
}
