// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {Deploy} from "../script/Deploy.s.sol";

contract DeployTest is Test {
    Deploy internal deploy;

    function setUp() public {
        deploy = new Deploy();
    }

    function testRejectsZeroDeployerBeforeBroadcast() public {
        vm.expectRevert(Deploy.ZeroDeployer.selector);
        deploy.validate(address(0), 1, 2, 3);
    }

    function testZRejectsScheduleOutsideUint64BeforeBroadcast() public {
        vm.expectRevert(Deploy.ScheduleOutOfRange.selector);
        deploy.validate(address(this), uint256(type(uint64).max) + 1, 2, 3);
    }

    function testRejectsUnorderedScheduleBeforeBroadcast() public {
        vm.expectRevert(Deploy.InvalidSchedule.selector);
        deploy.validate(address(this), 100, 100, 101);
    }
}
