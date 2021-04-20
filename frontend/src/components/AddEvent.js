import React from 'react';
import {useState} from 'react';
import { Button, TextArea, Form,FormGroup, Modal, ModalContent, ModalDialog, ModalTitle, Input} from 'reacthalfmoon'
import DateTimePicker from 'react-datetime-picker';

function AddEvent()
{

    const [isOpen, setIsOpen] = useState(false)

    const app_name = "eventure-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
    }
    const [startDate, onChange] = useState(new Date());
    const [endDate, onChange2] = useState(new Date());

    var title;
    var location;
    var description;

    const addEvent = async (event) => {
        event.preventDefault();
        title = document.getElementById("eventtitle").value
        location = document.getElementById("location").value
        description = document.getElementById("description").value

        var obj = {title: title, description: description, location: location, startTime: startDate, endTime: endDate};

        console.log(obj);
        var js = JSON.stringify(obj);
        try {
            const response = await fetch(buildPath('api/events/create'), {
                method: "POST",
                body: js,
                headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
            });

            var res = JSON.parse(await response.text());



                console.log(res);



        } catch (e) {
            alert(e.toString());
            return;
        }
    };

	return(
		<div>
            <Button id="addEvent" onClick={()=>{setIsOpen(true)}} color="primary" size="lg">Add Event</Button>

            <div style={{height: "116px"}}>
        <Modal isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle>Add Event</ModalTitle>
                    <Form>
                    <FormGroup>
                    <label>Event Title</label>
                    <Input id="eventtitle"></Input>
                    </FormGroup>
                    <FormGroup>
                        <label>Start Date</label><br></br>
                        <DateTimePicker disableClock = {true}
                            value={startDate}
                            onChange ={onChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>End Date</label><br></br>
                        <DateTimePicker disableClock = {true}
                            value={endDate}
                            onChange ={onChange2}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>Location</label>
                        <Input id="location"></Input>
                    </FormGroup>
                    <FormGroup>
                        <label>Description</label>
                        <TextArea id="description" placeholder="Write a short description about your Event." />
                    </FormGroup>
                    </Form>

                    <Button color="danger" onClick={()=>{setIsOpen(!isOpen)}}>Cancel</Button>
                    <Button id="addEventButton" color="primary" onClick={addEvent}>Add</Button>

                </ModalContent>
            </ModalDialog>
        </Modal>

        </div>
        </div>

	);


};


export default AddEvent;