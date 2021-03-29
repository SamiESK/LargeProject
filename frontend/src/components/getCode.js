import React from 'react';
import { Form, FormGroup, PageWrapper, ModalDialog, ModalContent, ModalTitle } from 'reacthalfmoon';
import { Button } from 'reacthalfmoon';
function getCode()
{
    var email;

    const app_name = "eventure-calandar";
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
            }
            
        } catch (e) {
            alert(e.toString());
            return;
        }
        
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
                <Button color="primary" onClick={resetCode} block type="submit">Reset Passowrd</Button>
                </FormGroup>
                <FormGroup>
                <span id="getCodeError" style={{color: "red"}}></span>
                </FormGroup>
            </Form>
        </div>
    );
};
export default getCode;