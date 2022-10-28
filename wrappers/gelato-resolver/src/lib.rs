pub mod wrap;
pub mod utils;

use std::ops::Add;
use polywrap_wasm_rs::JSON;
use serde_json::Value;
use serde_json::Map;
use serde::{Deserialize, Serialize};

pub use wrap::*;

use crate::imported::{ethereum_module, http_module};
use crate::utils::PENDING_JOBS_ABI;

#[derive(Serialize, Deserialize)]
struct Order {
    id: String,
    sender: String,
    receiver: String,
    inputAsset: String,
    dstAsset: String,
    srcChain: String,
    dstChain: String,
    amountIn: String,
    minAmountOut: String,
}

#[derive(Serialize, Deserialize)]
struct Job {
    jobId: String,
    providerInfo: String,
    handler: String,
    data: String,
}

#[derive(Serialize, Deserialize)]
struct ApiJobResponse {
    providerDetails: String,
    handler: String,
    data: String,
}

pub fn checker(args: ArgsChecker) -> CheckerResult {
    let user_args = UserArgs::from_buffer(&args.user_args_buffer).unwrap();

    let method: Value = serde_json::from_str(PENDING_JOBS_ABI).unwrap();

    let result = EthereumModule::call_contract_view(&ethereum_module::ArgsCallContractView {
        address: user_args.queue_address,
        method: method.to_string(),
        args: None,
        connection: args.connection,
    }).unwrap();

    let orders: Vec<Order> = serde_json::from_str(&result).unwrap();

    if orders.len() == 0 {
        return no_results();
    }


    let mut method_params: Vec<&str> = vec![];
    let mut jobs: Vec<Job> = vec![];

    for order in orders {
        let http_response = HttpModule::get(&http_module::ArgsGet {
            url: "https://api.swidge.xyz/quote?".to_owned() +
                "srcChain=" + &order.srcChain +
                "&dstChain=" + &order.dstChain +
                "&srcAsset=" + &order.inputAsset +
                "&dstAsset=" + &order.dstAsset +
                "&sender=" + &order.sender +
                "&receiver=" + &order.receiver +
                "&amountIn=" + &order.amountIn +
                "&minAmountOut=" + &order.minAmountOut,
            request: None,
        })
            .expect("Received an error as HTTP Response")
            .expect("Received an empty HTTP Response");

        let response_body = http_response
            .body
            .expect("Received an empty body as HTTP Response");

        let content = JSON::from_str::<ApiJobResponse>(&response_body).unwrap();

        jobs.push(Job {
            jobId: order.id,
            providerInfo: content.providerDetails,
            handler: content.handler,
            data: content.data,
        });

        method_params.push("tuple(bytes16 jobId,bytes17 providerInfo,address handler,bytes data)")
    }

    let mut method = String::new();
    method.push_str("function executeJobs (tuple(");
    method.push_str(&method_params.join(","));
    method.push_str("))");

    let encoded_data = EthereumModule::encode_function(&ethereum_module::ArgsEncodeFunction {
        method: method.to_string(),
        args: Some(vec![serde_json::to_string(&jobs).unwrap()]),
    }).unwrap();

    return with_results(encoded_data);
}

fn with_results(encoded_data: String) -> CheckerResult {
    return CheckerResult {
        can_exec: true,
        exec_data: encoded_data.to_string(),
    };
}

fn no_results() -> CheckerResult {
    return CheckerResult {
        can_exec: false,
        exec_data: "".to_string(),
    };
}