import React from 'react'
import { Navbar } from 'reacthalfmoon';
import { NavbarContent } from 'reacthalfmoon';
import { NavbarBrand } from 'reacthalfmoon';
import { NavItem } from 'reacthalfmoon';
import { NavbarNav } from 'reacthalfmoon';
import { Img } from 'reacthalfmoon';
import Dropdown from './AccountDropdown';
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
            </NavbarNav>
        </NavbarContent>
    </nav>
    <Dropdown />
    </div>
    );
};
export default HomeNavBar;