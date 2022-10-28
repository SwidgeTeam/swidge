use std::error::Error;
use crate::wrap::{
    HttpModule,
    HttpHttpRequest,
    HttpHttpResponseType,
};
use crate::imported::http_module;
use polywrap_wasm_rs::{BigNumber, Map, JSON};

pub fn http_get(url: &str, params: Option<Map<String, String>>) -> String {
    let http_response = HttpModule::get(&http_module::ArgsGet {
        url: crate::constants::API_URL.to_owned() + url,
        request: Some(HttpHttpRequest {
            headers: None,
            url_params: params,
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