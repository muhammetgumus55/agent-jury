// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {AgentJury} from "../src/AgentJury.sol";

contract AgentJuryTest is Test {
    AgentJury public jury;

    // Sample test data
    bytes32 constant CASE_HASH    = keccak256("A decentralised habit tracker using zero-knowledge proofs");
    uint8   constant FEASIBILITY  = 78;
    uint8   constant INNOVATION   = 65;
    uint8   constant RISK         = 25;
    uint8   constant FINAL_SCORE  = 73;
    string  constant SHORT_VERDICT = "Ship MVP";

    event VerdictSaved(uint256 indexed id, uint8 finalScore);

    /* ─── Setup ─────────────────────────────────────────────────────── */

    function setUp() public {
        jury = new AgentJury();
    }

    /* ─── saveVerdict ───────────────────────────────────────────────── */

    function test_saveVerdict_stores_correctly() public {
        uint256 id = jury.saveVerdict(
            CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT
        );

        assertEq(id, 0, "first verdict should have id=0");

        AgentJury.Verdict memory v = jury.getVerdict(0);
        assertEq(v.caseHash,     CASE_HASH);
        assertEq(v.feasibility,  FEASIBILITY);
        assertEq(v.innovation,   INNOVATION);
        assertEq(v.risk,         RISK);
        assertEq(v.finalScore,   FINAL_SCORE);
        assertEq(v.shortVerdict, SHORT_VERDICT);
        assertEq(v.submitter,    address(this));
        assertEq(v.timestamp,    block.timestamp);
    }

    function test_saveVerdict_emits_event() public {
        vm.expectEmit(true, false, false, true);
        emit VerdictSaved(0, FINAL_SCORE);

        jury.saveVerdict(
            CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT
        );
    }

    function test_saveVerdict_increments_id() public {
        uint256 id0 = jury.saveVerdict(CASE_HASH, 80, 70, 20, 75, "Ship MVP");
        uint256 id1 = jury.saveVerdict(CASE_HASH, 60, 50, 40, 56, "Iterate First");
        uint256 id2 = jury.saveVerdict(CASE_HASH, 30, 20, 80, 20, "Reject - Major Issues");

        assertEq(id0, 0);
        assertEq(id1, 1);
        assertEq(id2, 2);
    }

    function test_saveVerdict_records_submitter() public {
        address alice = address(0xA11CE);
        vm.prank(alice);
        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT);

        AgentJury.Verdict memory v = jury.getVerdict(0);
        assertEq(v.submitter, alice);
    }

    /* ─── Validation ────────────────────────────────────────────────── */

    function test_saveVerdict_reverts_on_score_over_100() public {
        vm.expectRevert(abi.encodeWithSelector(AgentJury.InvalidScore.selector, "feasibility", 101));
        jury.saveVerdict(CASE_HASH, 101, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT);

        vm.expectRevert(abi.encodeWithSelector(AgentJury.InvalidScore.selector, "innovation", 101));
        jury.saveVerdict(CASE_HASH, FEASIBILITY, 101, RISK, FINAL_SCORE, SHORT_VERDICT);

        vm.expectRevert(abi.encodeWithSelector(AgentJury.InvalidScore.selector, "risk", 101));
        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, 101, FINAL_SCORE, SHORT_VERDICT);

        vm.expectRevert(abi.encodeWithSelector(AgentJury.InvalidScore.selector, "finalScore", 101));
        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, RISK, 101, SHORT_VERDICT);
    }

    function test_saveVerdict_reverts_on_empty_verdict_string() public {
        vm.expectRevert(AgentJury.EmptyVerdict.selector);
        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, "");
    }

    /* ─── getVerdictCount ───────────────────────────────────────────── */

    function test_getVerdictCount_starts_at_zero() public view {
        assertEq(jury.getVerdictCount(), 0);
    }

    function test_getVerdictCount_increments() public {
        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT);
        assertEq(jury.getVerdictCount(), 1);

        jury.saveVerdict(CASE_HASH, FEASIBILITY, INNOVATION, RISK, FINAL_SCORE, SHORT_VERDICT);
        assertEq(jury.getVerdictCount(), 2);
    }

    /* ─── getVerdict ────────────────────────────────────────────────── */

    function test_getVerdict_reverts_out_of_bounds() public {
        vm.expectRevert(abi.encodeWithSelector(AgentJury.IndexOutOfBounds.selector, 0, 0));
        jury.getVerdict(0);
    }

    function test_getVerdict_returns_correct_data_for_multiple() public {
        jury.saveVerdict(CASE_HASH, 80, 70, 10, 75, "Ship MVP");
        jury.saveVerdict(CASE_HASH, 55, 58, 45, 55, "Iterate First");

        AgentJury.Verdict memory v0 = jury.getVerdict(0);
        AgentJury.Verdict memory v1 = jury.getVerdict(1);

        assertEq(v0.feasibility,  80);
        assertEq(v0.shortVerdict, "Ship MVP");
        assertEq(v1.feasibility,  55);
        assertEq(v1.shortVerdict, "Iterate First");
    }

    /* ─── Fuzz ──────────────────────────────────────────────────────── */

    function testFuzz_saveVerdict_valid_scores(
        uint8 f,
        uint8 i,
        uint8 r,
        uint8 fs
    ) public {
        vm.assume(f <= 100 && i <= 100 && r <= 100 && fs <= 100);

        uint256 id = jury.saveVerdict(CASE_HASH, f, i, r, fs, "Test");
        AgentJury.Verdict memory v = jury.getVerdict(id);

        assertEq(v.feasibility, f);
        assertEq(v.innovation,  i);
        assertEq(v.risk,        r);
        assertEq(v.finalScore,  fs);
    }
}
