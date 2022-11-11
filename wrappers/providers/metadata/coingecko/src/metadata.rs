use std::collections::BTreeMap;
use std::fmt::format;
use crate::utils::http_get;
use polywrap_wasm_rs::{BigNumber, Map, JSON};
use crate::{ArgsGetTokens, Token};
use crate::constants::{Chain, tokens};
use crate::types::Price;


pub fn get_tokens(args: ArgsGetTokens) -> BTreeMap<String, Vec<Token>> {
    let mut result = BTreeMap::new();

    for (chain_id, tokens) in tokens().iter_mut() {
        get_tokens_of_chain(chain_id, tokens);
        result.insert(chain_id.to_string(), tokens.clone());
    }

    result
}

fn get_tokens_of_chain(chain_id: &Chain, tokens: &mut Vec<Token>) {
    let mut url_params: Map<String, String> = Map::new();

    let addresses: Vec<String> = tokens
        .iter()
        .map(|t| t.address.clone())
        .collect();

    url_params.insert("contract_addresses".to_string(), addresses.join(","));
    url_params.insert("vs_currencies".to_string(), "usd".to_string());

    let url = format!("simple/token_price/{}", get_cg_chain_id(chain_id));

    let response_body = http_get(&url, Some(url_params));

    let data = JSON::from_str::<BTreeMap<String, Price>>(&response_body).unwrap();

    tokens
        .iter_mut()
        .for_each(|t| {
            let price = data.get(&t.address);
            t.price = match price {
                Some(p) => Some(p.usd.clone()),
                None => None
            };
        });
}

fn get_cg_chain_id(chain_id: &Chain) -> &str {
    return match chain_id {
        Chain::Ethereum => "ethereum",
        Chain::Polygon => "polygon-pos",
        Chain::Fantom => "fantom",
    };
}