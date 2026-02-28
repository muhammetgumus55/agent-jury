// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentJury} from "../src/AgentJury.sol";

/// @notice Deployment script for AgentJury.
///
/// Usage (Monad testnet example):
///   forge script script/Deploy.s.sol \
///     --rpc-url https://testnet-rpc.monad.xyz \
///     --broadcast \
///     --private-key $PRIVATE_KEY \
///     -vvvv
///
/// Set PRIVATE_KEY in your environment (never commit it).
/// For CREATE2 deterministic deployment pass --salt <bytes32>.
contract DeployAgentJury is Script {
    function run() external returns (AgentJury jury) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("Deployer :", deployer);
        console.log("Chain ID :", block.chainid);

        vm.startBroadcast(deployerKey);

        jury = new AgentJury();

        vm.stopBroadcast();

        console.log("AgentJury deployed at:", address(jury));
        console.log("Verdict count (sanity):", jury.getVerdictCount());
    }
}
