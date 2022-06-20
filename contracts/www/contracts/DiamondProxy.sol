//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/LibDiamond.sol";
import "./interfaces/IDiamondCutter.sol";

contract DiamondProxy {

    constructor(address _diamondCutterFacet) {
        LibDiamond.setContractOwner(msg.sender);

        // Add the diamondCut external function from the diamondCutFacet
        IDiamondCutter.FacetCut[] memory cut = new IDiamondCutter.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCutter.diamondCut.selector;

        cut[0] = IDiamondCutter.FacetCut({
            facetAddress : _diamondCutterFacet,
            action : IDiamondCutter.FacetCutAction.Add,
            functionSelectors : functionSelectors
        });

        LibDiamond.diamondCut(cut);
    }



    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        // get facet from function selector
        address facet = ds.facets[msg.sig].facetAddress;
        require(facet != address(0), "Signature can't be Zero");
        // Execute external function from facet using delegatecall and return any value.
        assembly {
        // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
        // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
        // get any return value
            returndatacopy(0, 0, returndatasize())
        // return any return value or error back to the caller
            switch result
            case 0 {revert(0, returndatasize())}
            default {return (0, returndatasize())}
        }
    }

    receive() external payable {}

}
