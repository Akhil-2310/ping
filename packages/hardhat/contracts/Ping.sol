// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISemaphore } from "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract Ping {
    ISemaphore public immutable semaphore;

    struct GroupMeta {
        uint256 groupId;
        address creator;
        string  name;
        string  description;
        uint64  createdAt;
        bool    exists;
    }

    uint256 public nextGroupIndex;
    mapping(uint256 => GroupMeta) public groups;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(address => uint256[]) private userGroups;
    mapping(uint256 => mapping(uint256 => bool)) public nullifierUsed;

    event GroupCreated(uint256 indexed registryId, uint256 indexed groupId, address indexed creator, string name, string description);
    event MemberJoined(uint256 indexed registryId, address indexed member, uint256 commitment);

    /// @notice Emitted after a valid anonymous signal.
    /// @dev `signalHash` = hash(message) proven in-circuit; `scopeHash` = hash(scope) proven in-circuit.
    ///      neither reveals the wallet or original plaintext; bind your off-chain content to `signalHash`.
    event SignalSent(
        uint256 indexed registryId,
        uint256 indexed groupId,
        uint256 signalHash,
        uint256 scopeHash,
        uint256 nullifier // included for dedup/UX; still anonymous
    );

    constructor(address semaphore_) {
        semaphore = ISemaphore(semaphore_);
    }

    function createGroup(string calldata name, string calldata description) external returns (uint256 registryId) {
        uint256 groupId = semaphore.createGroup();
        registryId = nextGroupIndex++;
        groups[registryId] = GroupMeta({
            groupId: groupId,
            creator: msg.sender,
            name: name,
            description: description,
            createdAt: uint64(block.timestamp),
            exists: true
        });
        emit GroupCreated(registryId, groupId, msg.sender, name, description);
    }

    function joinGroup(uint256 registryId, uint256 identityCommitment) external {
        GroupMeta memory g = groups[registryId];
        require(g.exists, "Group not found");
        require(!hasJoined[registryId][msg.sender], "Already joined");
        semaphore.addMember(g.groupId, identityCommitment);
        hasJoined[registryId][msg.sender] = true;
        userGroups[msg.sender].push(registryId);
        emit MemberJoined(registryId, msg.sender, identityCommitment);
    }

    function getUserGroups(address user) external view returns (GroupMeta[] memory out) {
        uint256[] memory ids = userGroups[user];
        out = new GroupMeta[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) out[i] = groups[ids[i]];
    }

    /// @notice Validate a Semaphore proof (post/vote/etc) and emit an anonymous signal event.
    /// @dev Frontend generates proof with `generateProof(identity, group, message, scope)`.
    ///      The contract emits `signalHash = hash(message)` and `scopeHash = hash(scope)` (field elements).
    function validateSignal(uint256 registryId, ISemaphore.SemaphoreProof calldata proof) external {
        GroupMeta memory g = groups[registryId];
        require(g.exists, "Group not found");
        if (nullifierUsed[registryId][proof.nullifier]) revert("Nullifier already used");

        // This performs:
        // - member presence & non-empty tree checks
        // - current/old-root-within-duration checks
        // - verifier.verifyProof(...) with [hash(message), hash(scope)]
        semaphore.validateProof(g.groupId, proof);

        nullifierUsed[registryId][proof.nullifier] = true;

        // Recompute the field-hashes exactly like Semaphore does so your UI sees what was proven:
        uint256 signalHash = uint256(keccak256(abi.encodePacked(proof.message))) >> 8;
        uint256 scopeHash  = uint256(keccak256(abi.encodePacked(proof.scope)))   >> 8;

        emit SignalSent(registryId, g.groupId, signalHash, scopeHash, proof.nullifier);
    }
}