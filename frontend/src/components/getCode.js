import React from 'react';
import { Form, FormGroup, PageWrapper, ModalDialog, ModalContent, ModalTitle } from 'reacthalfmoon';
import { Button, Row, Col } from 'reacthalfmoon';
function getCode()
{
    var email;

    const app_name = "eventree-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }
    
    const resetCode = async (event) => {

        event.preventDefault();
        if (email.value === null)
        {
            document.getElementById("loginError").innerHTML = "Please put your email in"
            return;
        }
        var obj = { email: email.value};
        
        var js = JSON.stringify(obj);
        try {
            const response = await fetch(buildPath('api/user/password-reset/get-code'), {
                method: "POST",
                body: js,
                headers: { "Content-Type": "application/json" },
            });

            var res = JSON.parse(await response.text());
            if (!res.success) {
                document.getElementById("getCodeError").innerHTML = res.errors.pop().msg;
            }
            else if(res.success) {
                document.getElementById("getCodeError").innerHTML = "";
                window.location.href = "/ResetPage";
            }
            
        } catch (e) {
            alert(e.toString());
            return;
        }
        
    };

    const redirect = async (event) => {
        event.preventDefault();
        window.location.href = "/ResetPage";
    };
    return(
        <div>
            <Form id="banner"><FormGroup id="bannerText">Reset your password</FormGroup></Form>
            <Form id="getCode">
                
                <FormGroup>
                    <label className="required" >Email</label><br></br>
                    <input style={{width: "100%"}} id="resetEmail" type="text" placeholder="Email" ref={(c) => (email = c)}/>
                </FormGroup>
                <FormGroup>
                <Button color="primary" onClick={resetCode} block type="submit">Get Code</Button>
                </FormGroup>
                <FormGroup>
                <span id="getCodeError" style={{color: "red"}}></span>
                </FormGroup>
                <Button className="SignIn" color="link" block type="submit" onClick={redirect}>Already have a code?</Button>
            </Form>
        </div>
    );
};
export default getCode;