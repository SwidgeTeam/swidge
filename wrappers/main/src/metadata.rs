use std::collections::BTreeMap;
use crate::imported::rango_module;
use crate::imported::lifi_module;
use crate::wrap::*;

pub fn get_metadata(args: ArgsGetMetadata) -> Metadata {
    let rango_metadata = RangoModule::get_metadata(&rango_module::serialization::ArgsGetMetadata {});
    let lifi_metadata = LifiModule::get_metadata(&lifi_module::serialization::ArgsGetMetadata {});

    let ran = rango_metadata.unwrap().chains;
    let lifi = lifi_metadata.unwrap().chains;

    return Metadata {
        chains: vec![],
        tokens: BTreeMap::new(),
    };
}
