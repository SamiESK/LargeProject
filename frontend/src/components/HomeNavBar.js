import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
import { DarkmodeSwitch } from 'reacthalfmoon';
import { useState } from 'react';
import { setDarkmode } from 'react';
import { setIsOpen } from 'react';
import { Button } from 'reacthalfmoon';
import { darkmode } from 'react';
import { PageWrapper } from 'reacthalfmoon';
import { Form } from 'reacthalfmoon';
import { FormGroup } from 'reacthalfmoon';
import { Input } from 'reacthalfmoon';
import { Container } from 'reacthalfmoon';
import { Modal } from 'reacthalfmoon';
import { ModalDialog } from 'reacthalfmoon';
import { ModalTitle} from 'reacthalfmoon';
import { ModalContent } from 'reacthalfmoon';
import { NavLink } from 'react-router-dom'
import { Router } from 'react-router-dom'

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

    const doLogOut = async (event) => {
        window.location.href = "/LoginPage";
        
    };

    return(
   
    <PageWrapper withNavbar>
        <Navbar  id="nav">
        <NavbarContent> 
        <Img rounded src={require("../images/Logo.png").default} height="40px"/>
            <NavbarBrand id="brand">
                Eventra
            </NavbarBrand>
            <NavbarNav>
                <NavItem active to={"../pages/HomePage"}>About Us</NavItem>
                <NavItem active>Mobile App</NavItem>
            
                <DarkmodeSwitch checked={darkmode} toggle={()=>{setDarkmode(!darkmode)}} />
                
                <Button color="primary" id="LoginButton" onClick={doLogOut}>Sign Out</Button>
            </NavbarNav>
        </NavbarContent>
    </Navbar>
    </PageWrapper>

    );
};
export default HomeNavBar;