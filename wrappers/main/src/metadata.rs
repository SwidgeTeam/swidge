use std::collections::BTreeMap;
use crate::imported::rango_module;
use crate::wrap::*;

pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let metadata = RangoModule::get_metadata(&rango_module::serialization::ArgsGetMetadata {});

    let ran = metadata.unwrap().chains;
    return Metadata {
        chains: vec![],
        tokens: BTreeMap::new(),
    };
}
