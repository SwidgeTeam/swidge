use std::collections::BTreeMap;
use crate::wrap::*;
use crate::imported::provider_module::ArgsGetMetadata as ProviderArgsGetMetadata;

pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let implementations = Provider::get_implementations();

    if implementations.len() == 0 {
        panic!("No provider implementations");
    }

    let mut all_chains: Vec<Chain> = Vec::new();
    let mut all_tokens: BTreeMap<String, Vec<Token>> = BTreeMap::new();

    for implementation in implementations.iter() {
        let provider = ProviderModule::new(implementation);
        let metadata = provider
            .get_metadata(&ProviderArgsGetMetadata {})
            .expect("Provider should return valid metadata");

        metadata.chains
            .iter()
            .for_each(|chain| {
                let exists = all_chains
                    .iter()
                    .find(|c| c.chain_id == chain.chain_id)
                    .is_some();

                if !exists {
                    all_chains.push(Chain {
                        chain_type: chain.chain_type.to_string(),
                        chain_id: chain.chain_id.to_string(),
                        name: chain.name.to_string(),
                        logo: chain.logo.to_string(),
                    });
                }
            });

        metadata.tokens
            .iter()
            .for_each(|(chain_id, tokens)| {
                if !all_tokens.contains_key(chain_id) {
                    all_tokens.insert(chain_id.clone(), Vec::new());
                }

                let all_tokens_chain = all_tokens
                    .get_mut(chain_id)
                    .expect("Should exists chain, it was checked just above");

                tokens
                    .iter()
                    .for_each(|token| {
                        let exists = all_tokens_chain
                            .iter()
                            .find(|t| t.address.eq(token))
                            .is_some();

                        if !exists {
                            all_tokens_chain.push(Token {
                                chain_id: "".to_string(),
                                address: token.to_string(),
                                name: "".to_string(),
                                symbol: "".to_string(),
                                decimals: 0,
                                logo: None,
                                price: None,
                            });
                        }
                    })
            })
    }

    return Metadata {
        chains: all_chains,
        tokens: all_tokens,
    };
}

