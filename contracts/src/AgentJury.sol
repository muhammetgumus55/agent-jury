// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title  AgentJury
/// @notice On-chain registry for AI agent evaluation verdicts.
///         Stores feasibility, innovation, risk scores + a final weighted score
///         and a human-readable short verdict string.
///         Compatible with any EVM chain (including Monad testnet).
contract AgentJury {
    /* ─── Structs ───────────────────────────────────────────────────── */

    struct Verdict {
        /// @dev keccak256 hash of the original case text submitted by the user
        bytes32 caseHash;
        /// @dev Feasibility score (0–100)
        uint8 feasibility;
        /// @dev Innovation score (0–100)
        uint8 innovation;
        /// @dev Risk score (0–100, higher = riskier)
        uint8 risk;
        /// @dev Weighted final score: feasibility*45% + innovation*35% + (100-risk)*20%
        uint8 finalScore;
        /// @dev Human-readable verdict: "Ship MVP", "Iterate First", or "Reject - Major Issues"
        string shortVerdict;
        /// @dev Wallet that submitted the verdict
        address submitter;
        /// @dev Block timestamp at submission
        uint256 timestamp;
    }

    /* ─── Storage ───────────────────────────────────────────────────── */

    /// @dev Array of all stored verdicts (0-indexed)
    Verdict[] private _verdicts;

    /* ─── Events ────────────────────────────────────────────────────── */

    /// @notice Emitted when a new verdict is stored.
    /// @param id          Index into the verdicts array
    /// @param finalScore  Weighted final score (0–100)
    event VerdictSaved(uint256 indexed id, uint8 finalScore);

    /* ─── Errors ────────────────────────────────────────────────────── */

    error InvalidScore(string field, uint8 value);
    error EmptyVerdict();
    error IndexOutOfBounds(uint256 id, uint256 length);

    /* ─── Write ─────────────────────────────────────────────────────── */

    /// @notice Store a new evaluation verdict on-chain.
    /// @param caseHash      keccak256 of the original case text
    /// @param feasibility   Feasibility agent score (0–100)
    /// @param innovation    Innovation agent score (0–100)
    /// @param risk          Risk agent score (0–100)
    /// @param finalScore    Pre-calculated weighted final score (0–100)
    /// @param shortVerdict  Human-readable verdict string
    /// @return id           Index of the newly stored verdict
    function saveVerdict(
        bytes32 caseHash,
        uint8   feasibility,
        uint8   innovation,
        uint8   risk,
        uint8   finalScore,
        string  calldata shortVerdict
    ) external returns (uint256 id) {
        if (feasibility > 100) revert InvalidScore("feasibility", feasibility);
        if (innovation  > 100) revert InvalidScore("innovation",  innovation);
        if (risk        > 100) revert InvalidScore("risk",        risk);
        if (finalScore  > 100) revert InvalidScore("finalScore",  finalScore);
        if (bytes(shortVerdict).length == 0) revert EmptyVerdict();

        id = _verdicts.length;

        _verdicts.push(Verdict({
            caseHash:     caseHash,
            feasibility:  feasibility,
            innovation:   innovation,
            risk:         risk,
            finalScore:   finalScore,
            shortVerdict: shortVerdict,
            submitter:    msg.sender,
            timestamp:    block.timestamp
        }));

        emit VerdictSaved(id, finalScore);
    }

    /* ─── Read ──────────────────────────────────────────────────────── */

    /// @notice Returns the total number of verdicts stored.
    function getVerdictCount() external view returns (uint256) {
        return _verdicts.length;
    }

    /// @notice Returns the verdict at the given index.
    /// @param id  Zero-based index into the verdicts array
    function getVerdict(uint256 id) external view returns (Verdict memory) {
        if (id >= _verdicts.length) revert IndexOutOfBounds(id, _verdicts.length);
        return _verdicts[id];
    }
}
