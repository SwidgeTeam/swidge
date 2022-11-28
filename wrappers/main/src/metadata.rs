use std::collections::BTreeMap;
use crate::wrap::*;
use crate::imported::provider_module::ArgsGetTokens as ProviderArgsGetTokens;

pub fn get_tokens(args: ArgsGetTokens) -> BTreeMap<String, Vec<Token>> {
    let implementations = Provider::get_implementations();

    if implementations.len() == 0 {
        panic!("No provider implementations");
    }

    let mut all_tokens: BTreeMap<String, Vec<Token>> = BTreeMap::new();

    for implementation in implementations.iter() {
        let provider = ProviderModule::new(implementation);

        let tokens = provider
            .get_tokens(&ProviderArgsGetTokens {})
            .expect("Provider should return valid tokens list");

        tokens
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
                            .find(|t| t.address.eq(&token.address))
                            .is_some();

                        if !exists {
                            all_tokens_chain.push(Token {
                                chain_id: token.chain_id.to_string(),
                                address: token.address.to_string(),
                                name: token.name.to_string(),
                                symbol: token.symbol.to_string(),
                                decimals: token.decimals,
                                logo: token.logo.clone(),
                                price: token.price.clone(),
                            });
                        }
                    })
            })
    }

    return all_tokens;
}

