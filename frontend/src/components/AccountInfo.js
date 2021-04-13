import React from "react";
import { Container, Row, Col } from "reacthalfmoon";
import { Button, Table, Content } from "reacthalfmoon";

function AccountInfo() {
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const email = localStorage.getItem("email");

    const app_name = "eventure-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }
    var DELpassword;
    const deleteAccount = async (event) => {
        event.preventDefault();
        DELpassword = document.getElementById("deletepassword");
        var obj = { password: DELpassword.value };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath("api/user/delete-account"), {
                method: "POST",
                body: js,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            var res = JSON.parse(await response.text());
            console.log(res);
            if (!res.success) {
                document.getElementById("deleteError").innerHTML = res.error;
            } else if (res.success) {
                document.getElementById("deleteError").innerHTML = "";
                window.location.href = "/";
            }
        } catch (e) {
            alert(e.toString());
            return;
        }
    };
    var newpassword;
    var newpassword2;

    const updatePassword = async (event) => {
        event.preventDefault();

        newpassword = document.getElementById("newpassword");
        newpassword2 = document.getElementById("newpassword2");

        var obj = {
            password: newpassword.value,
            repeat_password: newpassword2.value,
        };
        var js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath("api/user/update"), {
                method: "PATCH",
                body: js,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });

            var res = JSON.parse(await response.text());
            console.log(res);
            if (res.error) {
                document.getElementById("passwordError").innerHTML =
                    "Error : " + res.error;
            }
        } catch (e) {
            alert(e.toString());
            return;
        }
    };
    return (
        <div id="account">
            <Row className="accountHeaders">
                <h3 align="left">Account Information</h3>
            </Row>
            <Container breakpoint="fluid" className="border p-10">
                <Table noOuterPadding id="accountTable">
                    <tbody>
                        <tr>
                            <th>First Name</th>
                            <td>{firstName}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Last Name</th>
                            <td>{lastName}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>{email}</td>
                        </tr>
                    </tbody>
                </Table>
            </Container>
            <br></br>
            <Row className="accountHeaders">
                <h3 align="left">Change Password</h3>
            </Row>
            <Container
                breakpoint="fluid"
                className="border p-10"
                id="accountPassword"
            >
                <Content>
                    <br></br>
                    <Row>
                        <Col>
                            <label>New Password</label>
                        </Col>
                        <Col>
                            <input
                                id="newpassword"
                                placeholder="New Password"
                            ></input>
                        </Col>
                        <br></br>
                    </Row>
                    <br></br>
                    <Row>
                        <Col>
                            <label>Confirm New Password</label>
                        </Col>
                        <Col>
                            <input
                                id="newpassword2"
                                placeholder="Confirm New Password"
                            ></input>
                        </Col>
                        <br></br>
                    </Row>
                    <br></br>
                    <Row>
                        <Col></Col>

                        <Col>
                            {" "}
                            <Button onClick={updatePassword} color="primary">
                                Submit
                            </Button>
                        </Col>
                    </Row>
                    <br></br>
                    <span style={{ color: "red" }} id="passwordError"></span>
                </Content>
            </Container>
            <Row className="accountHeaders">
                <h3 align="left">Delete Account</h3>
            </Row>
            <Container
                breakpoint="fluid"
                className="border p-10"
                id="accountPassword"
            >
                <Content>
                    <br></br>
                    <Row>
                        <Col>
                            <label>Enter Password</label>
                        </Col>
                        <Col>
                            <input
                                id="deletepassword"
                                placeholder="Enter Password"
                            ></input>
                        </Col>
                        <br></br>
                    </Row>

                    <br></br>
                    <Row>
                        <Col></Col>

                        <Col>
                            {" "}
                            <Button onClick={deleteAccount} color="danger">
                                Delete
                            </Button>
                        </Col>
                    </Row>
                    <br></br>
                    <span style={{ color: "red" }} id="deleteError"></span>
                </Content>
            </Container>
            <br></br>
        </div>
    );
}
export default AccountInfo;
