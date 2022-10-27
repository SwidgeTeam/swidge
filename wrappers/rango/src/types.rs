use polywrap_wasm_rs::BigNumber;
use serde::{Deserialize, Serialize};
use crate::wrap::{ChainInfo, ChainNativeCurrency};

#[derive(Serialize, Deserialize)]
pub struct MetadataJson {
    pub blockchains: Vec<BlockchainJson>,
    pub tokens: Vec<TokenJson>
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlockchainJson {
    pub name: String,
    pub display_name: String,
    pub chain_id: Option<String>,
    pub default_decimals: i8,
    #[serde(rename = "type")]
    pub chain_type: Option<String>,
    pub logo: String,
    pub info: Option<ChainInfoJson>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainInfoJson {
    pub chain_name: String,
    pub native_currency: Option<ChainNativeCurrencyJson>,
    pub block_explorer_urls: Option<Vec<String>>,
    pub rpc_urls: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize)]
pub struct ChainNativeCurrencyJson {
    pub name: String,
    pub symbol: String,
    pub decimals: i32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenJson {
    pub blockchain: String,
    pub address: Option<String>,
    pub symbol: String,
    pub decimals: i32,
    pub image: Option<String>,
    pub usd_price: Option<BigNumber>,
}

impl ChainInfo {
    pub fn build(info: ChainInfoJson) -> ChainInfo {
        ChainInfo {
            chain_name: info.chain_name,
            native_currency: ChainNativeCurrency::build(info.native_currency.unwrap()),
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
