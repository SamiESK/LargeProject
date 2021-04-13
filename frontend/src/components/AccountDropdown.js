import React from "react";
import { DropdownControl, DropdownItem, DropdownDivider } from "reacthalfmoon";
import { Img, DropdownMenu, Dropdown } from "reacthalfmoon";
import { useState } from "react";
import accountIcon from "../images/account.png";

function AccountDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    const doLogout = async (event) => {
        window.location.href = "/";
    };

    return (
        <div>
            <div id="dropdown">
                <Dropdown
                    isOpen={isOpen}
                    toggle={() => {
                        setIsOpen(!isOpen);
                    }}
                >
                    <DropdownControl>
                        <Img
                            style={{ cursor: "pointer" }}
                            rounded="circle"
                            src={accountIcon}
                            alt="dropdown-image"
                            classNames="w-50 h-50"
                        />
                    </DropdownControl>
                    <DropdownMenu align="right">
                        <DropdownItem
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                window.location = "/AccountPage";
                            }}
                        >
                            View Account
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                            style={{ cursor: "pointer" }}
                            block
                            onClick={doLogout}
                        >
                            Sign Out
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}
export default AccountDropdown;
