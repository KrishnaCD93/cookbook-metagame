// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/forge-std/src/Script.sol";
import "../src/CookbookGoals.sol";

contract CookbookGoalsScript is Script {
    CookbookGoals cookbookGoals;
    string[] goalNames;
    string[] goalTypes;
    string[] goalImageURIs;
    uint256[] goalTotals;
    uint256[] goalRewards;

    function run() external {
        vm.startBroadcast();
        goalNames = ["Share 10 meals", "Learn 3 tricks", "Cook 5 recipes"];
        goalTypes = ["EATING", "LEARNING", "COOKING"];
        goalImageURIs = ["https://imgur.com/i2FyfRP.png", "https://imgur.com/Bfd653K.png", "https://imgur.com/DxONkjH.png"];
        goalTotals = [10, 3, 5];
        goalRewards = [1000, 300, 500];

        cookbookGoals = new CookbookGoals(
            goalNames,
            goalTypes,
            goalImageURIs,
            goalTotals,
            goalRewards
        );

        cookbookGoals.mintGoalNFT(0);
        cookbookGoals.mintGoalNFT(1);
        cookbookGoals.mintGoalNFT(2);
        vm.stopBroadcast();
    }
}
