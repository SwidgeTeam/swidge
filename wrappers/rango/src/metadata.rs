use std::collections::BTreeMap;
use polywrap_wasm_rs::JSON;
use crate::wrap::*;
use crate::types::*;
use crate::imported::http_module;
use crate::utils::{get_chain_id, http_get};

pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let response_body = http_get("/basic/meta", None);

    let content = JSON::from_str::<MetadataJson>(&response_body).unwrap();

    let mut accepted_chains: Vec<String> = Vec::new();

    let chains: Vec<Chain> = content.blockchains
        .into_iter()
        .filter(|b| {
            if let Some(t) = &b.chain_type {
                return t.eq("EVM");
            }
            false
        })
        .map(|b| {
            accepted_chains.push(b.name.clone());
            Chain {
                chain_type: b.chain_type.unwrap(),
                chain_id: b.chain_id.unwrap(),
                name: b.display_name,
                logo: b.logo,
                metamask: ChainInfo::build(b.info.unwrap()),
            }
        })
        .collect();

    let mut tokens: BTreeMap<String, Vec<Token>> = BTreeMap::new();

    content.tokens
        .into_iter()
        .filter(|t| {
            accepted_chains.contains(&t.blockchain)
        })
        .for_each(|t| {
            let chain_id = get_chain_id(&t.blockchain).unwrap();

            if !tokens.contains_key(chain_id) {
                tokens.insert(chain_id.to_string(), Vec::new());
            }

            tokens
                .get_mut(chain_id)
                .unwrap()
                .push(Token {
                    chain_id: chain_id.to_string(),
                    address: t.address.unwrap_or("0x00".to_string()),
                    name: t.symbol.to_string(),
                    symbol: t.symbol.to_string(),
                    decimals: t.decimals,
                    logo: t.image,
                    price: t.usd_price,
                });
        });

    return Metadata {
        chains,
        tokens,
    };
}
