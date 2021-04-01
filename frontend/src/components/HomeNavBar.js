import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
import { DarkmodeSwitch } from 'reacthalfmoon';
import { useState } from 'react';
import Dropdown from './AccountDropdown';

function HomeNavBar()
{
    const [isOpen, setIsOpen] = useState(false);
    const [darkmode, setDarkmode] = useState(false);

    const app_name = "LargeProject";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    var email;
    var password;

    const [message, setMessage] = useState("");


    return(
        <div>
        <nav  id="nav">
        <NavbarContent> 
        <Img id="logo" rounded src={require("../images/Logo.png").default} height="40px"/>
            <NavbarBrand id="brand">
                Eventra
            </NavbarBrand>
            <NavbarNav>
                <NavItem active to={"../pages/HomePage"}>About Us</NavItem>
                <NavItem active>Mobile App</NavItem>
            
                <DarkmodeSwitch checked={darkmode} toggle={()=>{setDarkmode(!darkmode)}} />
            </NavbarNav>
        </NavbarContent>
    </nav>
    <Dropdown />
    </div>
    );
};
export default HomeNavBar;