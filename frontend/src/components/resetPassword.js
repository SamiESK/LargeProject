import React from 'react';
import { Form, FormGroup, Button, Card, CardTitle } from 'reacthalfmoon';

function resetPassword()
{
    var resetEmail;
    var resetPassword;
    var confirmResetPassword;
    var resetCode;

    const app_name = "eventree-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }
    
    const passwordReset = async (event) => {
        
        event.preventDefault();
       
        var obj = { email: resetEmail.value, password: resetPassword.value, repeat_password: confirmResetPassword.value, code: resetCode.value};
        
        var js = JSON.stringify(obj);
        console.log(js);
        try {
            const response = await fetch(buildPath('api/user/password-reset/verify'), {
                method: "POST",
                body: js,
                headers: { "Content-Type": "application/json" },
            });

            var res = JSON.parse(await response.text());
            if (!res.success) {
                document.getElementById("changePasswordError").innerHTML = res.errors.pop().msg;
            }
            else if(res.success) {
                document.getElementById("changePasswordError").innerHTML = "";
            }
            
        } catch (e) {
            alert(e.toString());
            return;
        }
        
    };
    return(
        <div >
            <Form className="banner">
                <Card className="border p-10" id="resetCard">
                    <CardTitle>
                            Create New Password
                    </CardTitle>
                    <hr/>
                    <Form id="changePassword">
                        <FormGroup>
                            <label className="required" >Email</label><br></br>
                            <input style={{width: "100%"}} id="resetEmail" type="text" placeholder="Email" ref={(c) => (resetEmail = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">New Password</label><br></br>
                            <input style={{width: "100%"}}id="resetPassword" type="password" placeholder="New Password" ref={(c) => (resetPassword = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Confirm New Password</label><br></br>
                            <input style={{width: "100%"}}id="confirmResetPassword" type="password" placeholder="Confirm New Password" ref={(c) => (confirmResetPassword = c)}/>
                        </FormGroup>
                        <FormGroup>
                            <label className="required">Code</label><br></br>
                            <input style={{width: "100%"}}id="resetCode" type="code" placeholder="Code" ref={(c) => (resetCode = c)}/>
                        </FormGroup>
                        <FormGroup>
                        <Button color="primary" onClick={passwordReset} block type="submit">Change Password</Button>
                        </FormGroup>
                        <span id="changePasswordError" style={{color: "red"}}></span>
                    </Form>
                </Card>
            </Form>
          
        </div>
       
    );
};
export default resetPassword;