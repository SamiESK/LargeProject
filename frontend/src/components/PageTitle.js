import React from 'react';
import { Button } from 'reacthalfmoon'
import { CardTitle } from 'reacthalfmoon'
import { Col} from 'reacthalfmoon'
import { Modal } from 'reacthalfmoon';
import { ModalDialog } from 'reacthalfmoon';
import { ModalTitle} from 'reacthalfmoon';
import { ModalContent } from 'reacthalfmoon';
import { FormGroup } from 'reacthalfmoon';
import { Form, Alert, AlertHeading } from 'reacthalfmoon';
import { useState } from 'react';

function PageTitle()
{
    const app_name = "eventure-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    var firstName;
    var lastName;
    var email;
    var password;
    var repeatPassword;

    const doSignup = async (event) => {
        event.preventDefault();

        var obj = { firstName: firstName.value, lastName: lastName.value, email: email.value, password: password.value, repeat_password: repeatPassword.value };
        var js = JSON.stringify(obj);
        try {
            const response = await fetch(buildPath('api/user/register'), {
                method: "POST",
                body: js,
                headers: { "Content-Type": "application/json" },
            });
            
            var res = JSON.parse(await response.text());

               var user = {
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email,
                    password: res.password,
                };
               
                console.log(res);
                
                

        } catch (e) {
            alert(e.toString());
            return;
        }
    };
	const [isOpen, setIsOpen] = useState(false)
	return(
		<div>
        <Col id="pageTitle" className="text-center" >
        <h1 id="title">Organize Your Calendar</h1>
            <div id="subtitles">
                <CardTitle id="card">Plan, Schedule, Socialize, all of your events with Eventra </CardTitle>
                <br></br>
                <Button id="getStartedButton" onClick={()=>{setIsOpen(true)}} color="primary">Get Started</Button>
            </div>
        </Col>

        <div style={{height: "400px"}}>
        <Modal isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle>Create an account</ModalTitle>
                    <Form>
                        <FormGroup>
                            <label className="required">First Name</label><br></br>
                            <input style={{width: "100%"}} id="firstName" type="text" placeholder="First Name" ref={(c) => (firstName = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Last Name</label><br></br>
                            <input style={{width: "100%"}}  id="lastName" type="text" placeholder="Last Name" ref={(c) => (lastName = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Email</label><br></br>
                            <input style={{width: "100%"}}  id="email" type="text" placeholder="Email" ref={(c) => (email = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Password</label><br></br>
                            <input style={{width: "100%"}}  id="password" type="password" placeholder="Password" ref={(c) => (password = c)}/>
                        </FormGroup>
                        <FormGroup>
                        <FormGroup>
                            <label className="required">Confirm Password</label><br></br>
                            <input style={{width: "100%"}}  id="repeatPassword" type="password" placeholder="Password" ref={(c) => (repeatPassword = c)}/>
                        </FormGroup>
                        <Button color="primary" onClick={doSignup} block type="submit">Sign Up!</Button>
                        </FormGroup>
                    </Form>
                    <Button block color="danger" onClick={()=>{setIsOpen(false)}}>Cancel</Button>
                </ModalContent>
            </ModalDialog>
        </Modal>
        
        </div>
        
    </div>
	);
};

export default PageTitle;

