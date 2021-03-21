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


function NavBar()
{
    const [isOpen, setIsOpen] = useState(false)
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

    const doLogin = async (event) => {
        event.preventDefault();

        var obj = { email: email.value, password: password.value };
        var js = JSON.stringify(obj);
        console.log(js);
        try {
            const response = await fetch(buildPath('api/user/login'), {
                method: "POST",
                body: js,
                headers: { "Content-Type": "application/json" },
            });

            var res = JSON.parse(await response.text());
            console.log(res);
            if (res.error === "incorrect pass") {
                document.getElementById("loginError").innerHTML = res.error;
            }
            else if (res.error === "Email/Password combination is incorrect") {
                document.getElementById("loginError").innerHTML = res.error;
            } else {
                document.getElementById("loginError").innerHTML = "";

                var user = {
                    firstName: res.firstName,
                    lastName: res.lastName,
                };
                localStorage.setItem("user_data", JSON.stringify(user));
                window.location.href = "/HomePage";
                
                
            }
            
            
        } catch (e) {
            alert(e.toString());
            return;
        }
        
    };

    return(
    <div>
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
                
                <Button color="primary" id="LoginButton" onClick={()=>{setIsOpen(true)}}>Sign in</Button>
            </NavbarNav>
        </NavbarContent>
    </Navbar>
    </PageWrapper>

  <PageWrapper withNavbar>
  <div style={{height: "400px"}}>
        <Modal isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle>Sign in to your account</ModalTitle>
                    <Form>
                        <FormGroup>
                            <label className="required" >Email</label><br></br>
                            <input style={{width: "100%"}} id="email" type="text" placeholder="Email" ref={(c) => (email = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Password</label><br></br>
                            <input style={{width: "100%"}}id="password" type="password" placeholder="Password" ref={(c) => (password = c)}/>
                            <span id="loginError" style={{color: "red"}}></span>
                        </FormGroup>
                        <FormGroup>
                        <Button color="primary" onClick={doLogin} block type="submit">Sign in</Button>
                        </FormGroup>
                    </Form>
                    <Button block color="danger" onClick={()=>{setIsOpen(false)}}>Cancel</Button>
                    <FormGroup>
                        <Button className="SignIn" color="link" block type="submit">Forgot Password?</Button>
                    </FormGroup>
                </ModalContent>
            </ModalDialog>
        </Modal>
    
        </div>
    
</PageWrapper>
</div>
    );
};
export default NavBar;