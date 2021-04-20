import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
import Dropdown from './AccountDropdown';
import { PageWrapper } from 'reacthalfmoon';

function HomeNavBar()
{
    return(
        <PageWrapper withNavbar>
        <Navbar  id="nav">
        <NavbarContent>
        <Img rounded src={require("../images/Logo.png").default} height="40px"/>
        <a href="/HomePage">
            <NavbarBrand id="brand">
                Eventree
            </NavbarBrand>
        </a>
            <NavbarNav>
                <NavItem active to={"../pages/HomePage"}>About Us</NavItem>
                <NavItem active>Mobile App</NavItem>
               <Dropdown />
            </NavbarNav>
        </NavbarContent>
    </Navbar>
    </PageWrapper>
    );
};
export default HomeNavBar;