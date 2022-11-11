use std::borrow::Borrow;
use std::collections::BTreeMap;
use polywrap_wasm_rs::{BigNumber, JSON};
use crate::wrap::{
    ProviderMetadata as Metadata,
    ProviderChain as Chain,
    ProviderChainInfo as ChainInfo,
    ArgsGetMetadata,
};
use crate::types::*;
use crate::utils::{http_get};

pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let chains_response_body = http_get("/chains", None);
    let tokens_response_body = http_get("/tokens", None);

    let chains_response = JSON::from_str::<ChainsJson>(&chains_response_body).unwrap();
    let tokens_response = JSON::from_str::<TokensJson>(&tokens_response_body).unwrap();

    let chains = chains_response.chains
        .into_iter()
        .map(|c| {
            Chain {
                chain_type: c.chain_type,
                chain_id: c.id.to_string(),
                name: c.name.to_string(),
                logo: c.logo_uri.to_string(),
                metamask: ChainInfo::build(c.metamask),
            }
        })
        .collect();

    let mut tokens: BTreeMap<String, Vec<String>> = BTreeMap::new();

    for (chain_id, list_json) in tokens_response.tokens {
        tokens.insert(chain_id.clone(), Vec::new());
        let list = tokens.get_mut(&chain_id).unwrap();
        list_json
            .into_iter()
            .for_each(|t| {
                list.push(t.address)
            })
    }

    return Metadata {
        chains,
        tokens,
    };
}
