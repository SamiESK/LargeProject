import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
//import { useState } from 'react';
import { Button } from 'reacthalfmoon';
import { PageWrapper } from 'reacthalfmoon';


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

    const doLogOut = async (event) => {
        window.location.href = "/LoginPage";
        
    };

    return(
   
    <PageWrapper withNavbar>
        <Navbar  id="nav">
        <NavbarContent> 
        <Img rounded src={require("../images/Logo.png").default} height="40px"/>
            <NavbarBrand id="brand">
                Eventree
            </NavbarBrand>
            <NavbarNav>
                <NavItem active to={"../pages/HomePage"}>About Us</NavItem>
                <NavItem active>Mobile App</NavItem>
                <Button color="primary" id="LoginButton" onClick={doLogOut}>Sign Out</Button>
            </NavbarNav>
        </NavbarContent>
    </Navbar>
    </PageWrapper>

    );
};
export default HomeNavBar;