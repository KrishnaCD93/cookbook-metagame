// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Counters.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import "../lib/Base64.sol";

contract CookbookGoals is ERC721 {
    enum GoalType { EATING, COOKING, LEARNING }
    struct GoalAttributes {
        uint id;
        string name;
        GoalType goalType;
        string imageURI;
        uint goalTotal;
        uint progress;
        uint rewardXP;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    GoalAttributes[] defaultGoals;

    mapping(uint => GoalAttributes) public userGoalAttributes;

    mapping(address => uint256) public usersWithGoals;

    event GoalNFTMinted(address sender, uint256 tokenId, uint256 goalId);
    event ProgressMade(address sender, uint newProgressNumber);

    constructor(
        string[] memory goalNames,
        string[] memory goalTypes,
        string[] memory goalImageURIs,
        uint[] memory goalTotals,
        uint[] memory goalRewards
    )
        ERC721("CookbookGoals", "CSGOALS")
    {
        for (uint i = 0; i < goalNames.length; i++) {
            GoalType goalType;
            if (keccak256(abi.encodePacked(goalTypes[i])) == keccak256(abi.encodePacked("EATING"))) {
                goalType = GoalType.EATING;
            } else if (keccak256(abi.encodePacked(goalTypes[i])) == keccak256(abi.encodePacked("COOKING"))) {
                goalType = GoalType.COOKING;
            } else if (keccak256(abi.encodePacked(goalTypes[i])) == keccak256(abi.encodePacked("LEARNING"))) {
                goalType = GoalType.LEARNING;
            }
            defaultGoals.push(GoalAttributes({
                id: i,
                name: goalNames[i],
                goalType: goalType,
                imageURI: goalImageURIs[i],
                goalTotal: goalTotals[i],
                progress: 0,
                rewardXP: goalRewards[i]
            }));
        }
        _tokenIds.increment();
    }

    function mintGoalNFT(uint _id) external {
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);

        userGoalAttributes[newItemId] = GoalAttributes({
            id: _id,
            name: defaultGoals[_id].name,
            goalType: defaultGoals[_id].goalType,
            imageURI: defaultGoals[_id].imageURI,
            goalTotal: defaultGoals[_id].goalTotal,
            progress: 0,
            rewardXP: defaultGoals[_id].rewardXP
        });

        usersWithGoals[msg.sender] = newItemId;

        _tokenIds.increment();
        
        emit GoalNFTMinted(msg.sender, newItemId, _id);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        GoalAttributes memory goal = userGoalAttributes[_tokenId];
        string memory strGoalTotal = Strings.toString(goal.goalTotal);
        string memory strProgress = Strings.toString(goal.progress);
        string memory strRewardXP = Strings.toString(goal.rewardXP);
        string memory strGoalType;
        if (goal.goalType == GoalType.EATING) {
            strGoalType = "EATING";
        } else if (goal.goalType == GoalType.COOKING) {
            strGoalType = "COOKING";
        } else if (goal.goalType == GoalType.LEARNING) {
            strGoalType = "LEARNING";
        }
        string memory json = Base64.encode(
            abi.encodePacked(
            '{"name": "',
            goal.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": This is a Cookbook Social goal NFT", "image": "',
            goal.imageURI,
            '", "attributes": [ { "trait_type": "Goal Progress", "value": ', strProgress,', "max_value": ',
            strGoalTotal,'}, { "trait_type": "Reward XP", "value": ',
            strRewardXP,'}, {"trait_type": "Goal Type", "value": ', strGoalType,'} ]}'
            )
        );
        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    function makeProgress() public {
        // Only the owner of the NFT can make progress
        // Make sure goal isn't already completed
        // Make progress towards goal
        uint256 nftTokenIdOfPlayer = usersWithGoals[msg.sender];
        GoalAttributes storage goal = userGoalAttributes[nftTokenIdOfPlayer];
        require(goal.progress < goal.goalTotal, "Goal is already completed");
        goal.progress = goal.progress + 1;

        emit ProgressMade(msg.sender, goal.progress);
    }

    function checkIfUserHasNFT() public view returns (GoalAttributes memory) {
        // Get the tokenId of the user's goal NFT
        // If user has a tokenId in the map, return the goal attributes else return an empty goal
        uint256 nftTokenIdOfPlayer = usersWithGoals[msg.sender];
        if (nftTokenIdOfPlayer > 0) {
            return userGoalAttributes[nftTokenIdOfPlayer];
        }
        else {
            GoalAttributes memory emptyGoal;
            return emptyGoal;
        }
    }

    function getAllGoals() public view returns (GoalAttributes[] memory) {
        return defaultGoals;
    }
}
