import React from 'react';
import {Modal, ModalDialog, ModalContent, Container, Row, Col, ModalTitle } from 'reacthalfmoon';
import { DropdownDivider, Button } from 'reacthalfmoon';

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
        <Container id="account">
            <Row>
                <Col offset={3} size={6}>
                    <h4 align="center">Account Information</h4>
                    <DropdownDivider/>
                    <Button color="danger" block type="submit" onClick={deleteAccount}>Delete Account</Button>
                    <span id="deleteError"></span>
                </Col>
            </Row>
        </Container>
    );
};
export default AccountInfo;