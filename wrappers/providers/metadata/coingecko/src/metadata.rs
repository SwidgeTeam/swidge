use std::fmt::format;
use crate::utils::http_get;
use polywrap_wasm_rs::{BigNumber, Map, JSON};
use crate::constants::TOKENS;


pub fn get_tokens() -> Tokens {
    for (chain_id, addresses) in &TOKENS {
        get_tokens_of_chain(chain_id, addresses);
    }
}


fn get_list() {
    let url_params: Map<String, String> = Map::from([
        ("include_platform".to_string(), "true".to_string())
    ]);
    let response_body = http_get("coins/list", Some(url_params));

}

fn get_tokens_of_chain(chain_id: &str, addresses: &Vec<&str>) {
    let mut url_params: Map<String, String> = Map::new();
    url_params.add("contract_addresses", addresses.join(","));
    url_params.add("vs_currencies", "usd");

    let url = format!("simple/token_price/{}", chain_id);

    let response_body = http_get(&url, Some(url_params));

    let data = JSON::from_str(&response_body);
}