use std::error::Error;

pub const API_BASE_URL: &str = "https://api.rango.exchange";
pub const API_KEY: &str = "7b3d45e1-fdc1-4642-be95-3b8a8c6aebcf";

const ETHEREUM_CODE: &str = "ETH";
const ETHEREUM_ID: &str = "1";
const OPTIMISM_CODE: &str = "OPTIMISM";
const OPTIMISM_ID: &str = "10";
const BSC_CODE: &str = "BSC";
const BSC_ID: &str = "56";
const POLYGON_CODE: &str = "POLYGON";
const POLYGON_ID: &str = "137";
const FANTOM_CODE: &str = "FANTOM";
const FANTOM_ID: &str = "250";
const AVAX_CCHAIN_CODE: &str = "AVAX_CCHAIN";
const AVAX_CCHAIN_ID: &str = "43114";
const MOONRIVER_CODE: &str = "MOONRIVER";
const MOONRIVER_ID: &str = "1285";
const BOBA_CODE: &str = "BOBA";
const BOBA_ID: &str = "288";
const HECO_CODE: &str = "HECO";
const HECO_ID: &str = "128";
const MOONBEAM_CODE: &str = "MOONBEAM";
const MOONBEAM_ID: &str = "1284";
const CRONOS_CODE: &str = "CRONOS";
const CRONOS_ID: &str = "25";
const AURORA_CODE: &str = "AURORA";
const AURORA_ID: &str = "1313161554";
const GNOSIS_CODE: &str = "GNOSIS";
const GNOSIS_ID: &str = "100";
const HARMONY_CODE: &str = "HARMONY";
const HARMONY_ID: &str = "1666600000";
const ARBITRUM_CODE: &str = "ARBITRUM";
const ARBITRUM_ID: &str = "42161";
const EVMOS_CODE: &str = "EVMOS";
const EVMOS_ID: &str = "9001";
const FUSE_CODE: &str = "FUSE";
const FUSE_ID: &str = "122";
const OKC_CODE: &str = "OKC";
const OKC_ID: &str = "66";


pub fn get_chain_id(code: &str) -> Result<&'static str, Box<dyn Error>> {
    return match code {
        ETHEREUM_CODE => Ok(ETHEREUM_ID),
        OPTIMISM_CODE => Ok(OPTIMISM_ID),
        BSC_CODE => Ok(BSC_ID),
        POLYGON_CODE => Ok(POLYGON_ID),
        FANTOM_CODE => Ok(FANTOM_ID),
        AVAX_CCHAIN_CODE => Ok(AVAX_CCHAIN_ID),
        MOONRIVER_CODE => Ok(MOONRIVER_ID),
        BOBA_CODE => Ok(BOBA_ID),
        HECO_CODE => Ok(HECO_ID),
        MOONBEAM_CODE => Ok(MOONBEAM_ID),
        CRONOS_CODE => Ok(CRONOS_ID),
        AURORA_CODE => Ok(AURORA_ID),
        GNOSIS_CODE => Ok(GNOSIS_ID),
        HARMONY_CODE => Ok(HARMONY_ID),
        ARBITRUM_CODE => Ok(ARBITRUM_ID),
        EVMOS_CODE => Ok(EVMOS_ID),
        FUSE_CODE => Ok(FUSE_ID),
        OKC_CODE => Ok(OKC_ID),
        _ => Err(Box::new("Wrong chain")),
    };
}