// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../lib/forge-std/src/console.sol";

contract CookingGoals {
    struct GoalAttributes {
        uint id;
        string name;
        string description;
        string imageURI;
        uint goalTotal;
        uint progress;
        uint rewardXP;
    }

    GoalAttributes[] defaultGoals;

    constructor(
        string[] memory goalNames,
        string[] memory goalDescriptions,
        string[] memory goalImageURIs,
        uint[] memory goalTotals,
        uint[] memory goalRewards
    )
    {
        for (uint i = 0; i < goalNames.length; i++) {
            defaultGoals.push(GoalAttributes({
                id: i,
                name: goalNames[i],
                description: goalDescriptions[i],
                imageURI: goalImageURIs[i],
                goalTotal: goalTotals[i],
                progress: 0,
                rewardXP: goalRewards[i]
            }));

            GoalAttributes memory g = defaultGoals[i];
            console.log("Done adding goal %s, with goal as %s, image: %s", g.name, g.goalTotal, g.imageURI);
        }
    }
}
