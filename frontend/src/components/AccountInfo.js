import React from 'react';
import {Modal, ModalDialog, ModalContent, Container, Row, Col, ModalTitle } from 'reacthalfmoon';
import { DropdownDivider, Button, Table, Content} from 'reacthalfmoon';

function AccountInfo()
{
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const email = localStorage.getItem('email');

    const app_name = "eventure-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }

    const deleteAccount = async (event) =>
    {
        var password = prompt('Please enter your password');
        if (password)
        {
            event.preventDefault();
            var obj = { password: password};
            var js = JSON.stringify(obj);
        
            try {
                const response = await fetch(buildPath('api/user/delete-account'), {
                    method: "DELETE",
                    body: js,
                    headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
                });

                var res = JSON.parse(await response.text());

                if (!res.success) {
                    document.getElementById("deleteError").innerHTML = res.error;
                }
                else if(res.success) {
                    document.getElementById("deleteError").innerHTML = "";
                    window.location.href = "/"; 
                }
                
                
            } catch (e) {
                alert(e.toString());
                return;
                }
        }
    };

    return(

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
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
                <tr>
                    <th>Last Name</th>
                    <td >{lastName}</td>
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
    <Container breakpoint="fluid" className="border p-10" id="accountPassword">
        <Content>
            <Row>
                <Col>
                    <label>Old Password</label>
                </Col>
                <Col>
                    <input placeholder="Old Password"></input>
                </Col>
                <br></br>
            </Row>
            <br></br>
            <Row>
                <Col>
                    <label>New Password</label>
                </Col>
                <Col>
                    <input placeholder="New Password"></input>
                </Col>
                <br></br>
            </Row>
            <br></br>
            <Row>
                <Col>
                    <label>Confirm New Password</label>
                </Col>
                <Col>
                    <input placeholder="Confirm New Password"></input>
                </Col>
                <br></br>
            </Row>
        </Content>
    </Container>
    <br></br>
    <Container breakpoint="fluid" className="border p-10">
    <Col offset={4} size={4}>
                    <Button color="danger" block type="submit" onClick={deleteAccount}>Delete Account</Button>
                    <span id="deleteError"></span>
    </Col>
    </Container>
    
    </div>

    );
};
export default AccountInfo;