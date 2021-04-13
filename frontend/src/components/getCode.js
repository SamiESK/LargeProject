import React from "react";
import { Form, FormGroup, CardTitle } from "reacthalfmoon";
import { Button, Card } from "reacthalfmoon";
function getCode() {
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
        if (email.value === null) {
            document.getElementById("loginError").innerHTML =
                "Please put your email in";
            return;
        }
        var obj = { email: email.value };

        var js = JSON.stringify(obj);
        try {
            const response = await fetch(
                buildPath("api/user/password-reset/get-code"),
                {
                    method: "POST",
                    body: js,
                    headers: { "Content-Type": "application/json" },
                }
            );

            var res = JSON.parse(await response.text());
            if (!res.success) {
                document.getElementById(
                    "getCodeError"
                ).innerHTML = res.errors.pop().msg;
            } else if (res.success) {
                document.getElementById("getCodeError").innerHTML = "";
                window.location.href = "/ResetPage";
            }
        } catch (e) {
            alert(e.toString());
            return;
        }
    };

    return (
        <div>
            <Form className="banner">
                <Card className="border p-10" id="getCode">
                    <Form id="getCodeInsides">
                        <CardTitle>Reset your password</CardTitle>
                        <hr />
                        <FormGroup>
                            <label className="required">Email</label>
                            <br></br>
                            <input
                                style={{ width: "100%" }}
                                id="resetEmail"
                                type="text"
                                placeholder="Email"
                                ref={(c) => (email = c)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Button
                                color="primary"
                                onClick={resetCode}
                                block
                                type="submit"
                                id="getCodeButton"
                            >
                                Send Code
                            </Button>
                        </FormGroup>
                        <FormGroup>
                            <span
                                id="getCodeError"
                                style={{ color: "red" }}
                            ></span>
                        </FormGroup>
                        <a href="/ResetPage" id="codeToReset">
                            Already have a code?
                        </a>
                    </Form>
                </Card>
            </Form>
        </div>
    );
}
export default getCode;
