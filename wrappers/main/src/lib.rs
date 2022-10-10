pub mod wrap;
pub mod utils;

use serde_json::Value;
use serde_json::Map;
use serde::{Deserialize, Serialize};

pub use wrap::*;

use crate::imported::ethereum_module;
use crate::utils::PENDING_JOBS_ABI;

#[derive(Serialize, Deserialize)]
struct Job {
    id: String,
    sender: String,
    receiver: String,
    input_asset: String,
    dst_asset: String,
    src_chain: String,
    dst_chain: String,
    amount_in: String,
    min_amount_out: String,
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

    let jobs: Vec<Job> = serde_json::from_str(&result).unwrap();

    if jobs.len() == 0 {
        return no_results();
    }

    return CheckerResult {
        can_exec: false,
        exec_data: result.to_string(),
    };
}

fn no_results() -> CheckerResult {
    return CheckerResult {
        can_exec: false,
        exec_data: "".to_string(),
    };
}