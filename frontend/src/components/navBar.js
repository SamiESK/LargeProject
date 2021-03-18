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
import { Login } from './Login';
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
    return(
    <div>
    <PageWrapper withNavbar>
        <Navbar id="nav">
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
                            <label className="required">Username</label>
                            <Input type="text" placeholder="Username" />
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Password</label>
                            <Input type="password" placeholder="Password" />
                        </FormGroup>
                        <FormGroup>
                        <Button color="primary" block type="submit">Sign in</Button>
                        </FormGroup>
                    </Form>
                    <Button block color="danger" onClick={()=>{setIsOpen(false)}}>Cancel</Button>
                    <FormGroup>
                        <Button className="SignIn" color="link" block type="submit">Sign up here!</Button>
                    </FormGroup>
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