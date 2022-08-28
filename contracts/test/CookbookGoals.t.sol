// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/forge-std/src/Test.sol";
import "../src/CookbookGoals.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import "../lib/forge-std/src/console2.sol";

contract CookbookGoalsTest is Test, ERC721Holder {
    CookbookGoals public cookbookGoals;
    string[] goalNames;
    string[] goalTypes;
    string[] goalImageURIs;
    uint256[] goalTotals;
    uint256[] goalRewards;

    function setUp() public {
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
    }

    function testMintGoalNFT() public {
        cookbookGoals.mintGoalNFT(1);
        console2.log("Token URI: ", cookbookGoals.tokenURI(1));
        assertEq(cookbookGoals.balanceOf(address(this)), 1);
    }

    function testMakeProgressFiveTimes() public {
        cookbookGoals.mintGoalNFT(2);
        cookbookGoals.makeProgress();
        cookbookGoals.makeProgress();
        cookbookGoals.makeProgress();
        cookbookGoals.makeProgress();
        cookbookGoals.makeProgress();
        console2.log("Token URI: ", cookbookGoals.tokenURI(1));
        assertEq(cookbookGoals.balanceOf(address(this)), 1);
    }

    function testGetAllGoals() public {
        assertEq(cookbookGoals.getAllGoals().length, 3);
    }
}
