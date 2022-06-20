// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*************************************************************\
Forked from https://github.com/mudgen/diamond
/*************************************************************/

import "../interfaces/IDiamondCutter.sol";
import "../libraries/LibDiamond.sol";

contract DiamondCutterFacet is IDiamondCutter {
    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    function diamondCut(
        FacetCut[] calldata _diamondCut
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.diamondCut(_diamondCut);
    }
}
