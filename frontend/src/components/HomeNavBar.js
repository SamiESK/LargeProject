import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
<<<<<<< HEAD
import { DarkmodeSwitch } from 'reacthalfmoon';
import { useState } from 'react';
import Dropdown from './AccountDropdown';
=======
//import { useState } from 'react';
import { Button } from 'reacthalfmoon';
import { PageWrapper } from 'reacthalfmoon';

>>>>>>> cdd48fd3a6b2341d4bbf16d6646d14eb2c1709e8

function HomeNavBar()
{
    const app_name = "eventree-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    //const [message, setMessage] = useState("");


    return(
        <div>
        <nav  id="nav">
        <NavbarContent> 
        <Img id="logo" rounded src={require("../images/Logo.png").default} height="40px"/>
            <NavbarBrand id="brand">
                Eventree
            </NavbarBrand>
            <NavbarNav>
                <NavItem active to={"../pages/HomePage"}>About Us</NavItem>
                <NavItem active>Mobile App</NavItem>
<<<<<<< HEAD
            
                <DarkmodeSwitch checked={darkmode} toggle={()=>{setDarkmode(!darkmode)}} />
=======
                <Button color="primary" id="LoginButton" onClick={doLogOut}>Sign Out</Button>
>>>>>>> cdd48fd3a6b2341d4bbf16d6646d14eb2c1709e8
            </NavbarNav>
        </NavbarContent>
    </nav>
    <Dropdown />
    </div>
    );
};
export default HomeNavBar;