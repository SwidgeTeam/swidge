use std::error::Error;
use crate::wrap::{
    HttpModule,
    HttpHttpRequest,
    HttpHttpResponseType,
};
use crate::imported::http_module;
use polywrap_wasm_rs::{BigNumber, Map, JSON};

pub fn get_chain_id(code: &str) -> Result<&'static str, Box<dyn Error>> {
    return match code {
        "ETH" => Ok("1"),
        "OPTIMISM" => Ok("10"),
        "BSC" => Ok("56"),
        "POLYGON" => Ok("137"),
        "FANTOM" => Ok("250"),
        "AVAX_CCHAIN" => Ok("43114"),
        "MOONRIVER" => Ok("1285"),
        "BOBA" => Ok("288"),
        "HECO" => Ok("128"),
        _ => Ok("128"),
    };
}

pub fn http_get(url: &str, params: Option<Map<String, String>>) -> String {
    let mut params = match params {
        Some(params) => params,
        None => Map::new()
    };
    params.insert("apiKey".to_string(), crate::constants::API_KEY.to_string());

    let http_response = HttpModule::get(&http_module::ArgsGet {
        url: crate::constants::API_BASE_URL.to_owned() + url,
        request: Some(HttpHttpRequest {
            headers: None,
            url_params: Some(params),
            response_type: HttpHttpResponseType::TEXT,
            body: None,
        }),
    })
        .expect("Received an error as HTTP Response")
        .expect("Received an empty HTTP Response");

    http_response
        .body
        .expect("Received an empty body as HTTP Response")
}