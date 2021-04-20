import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'
import {Button, Modal, ModalContent, ModalDialog, ModalTitle, } from 'reacthalfmoon';
import { useState} from 'react'
import { Form, FormGroup, Input, TextArea, Container } from 'reacthalfmoon';
import DateTimePicker from 'react-datetime-picker';
import EdiText from 'react-editext';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

var title;
var location;
var description;
var ID;
var loadEvents;
var newEndEdit;

function CalendarDisplay()
{

  const [myEventsList, setevent] = useState([])
  const temp=[];
  const [isOpen, setIsOpen] = useState(false)
  const [isOpen2, setIsOpen2] = useState(false)
  const [eLocation, SeteLocation] = useState('');
  const [eDescription, SeteDescription] = useState('');
  const [eTitle, SeteTitle] = useState('');

  const app_name = "eventree-calendar";
  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
          return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
          return "http://localhost:5000/" + route;
    }

  }

  const [startDate, onChange] = useState(new Date());
  const [endDate, onChange2] = useState(new Date());

  const [EditStart, onChange3] = useState(new Date());
  const [EditEnd, onChange4] = useState(new Date());

  const EventInfo = (e) =>
  {
    setIsOpen(true);
    SeteDescription(e.description)
    SeteLocation(e.location);
    SeteTitle(e.title);
    onChange3(e.start);
    onChange4(e.end);
    ID = e.id;
  };


  const Delete = async(event) =>
  {
    event.preventDefault();

        try {
            const response = await fetch(buildPath('api/events/remove/'+String(ID)), {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
            });

            loadEvents();
            setIsOpen(false);
        } catch (e) {
            alert(e.toString());
            return;

        }
  };

  const addEvent = async (event) => {
    var defaultendDate;
    event.preventDefault();
    title = document.getElementById("eventtitle").value
    location = document.getElementById("location").value
    description = document.getElementById("description").value
    if(!endDate)
        defaultendDate = startDate;
    else
        defaultendDate = endDate;

    var obj = {title: title, description: description, location: location, startTime: startDate, endTime: defaultendDate};

    var js = JSON.stringify(obj);
    try {
        const response = await fetch(buildPath('api/events/create'), {
            method: "POST",
            body: js,
            headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
        });

        var res = JSON.parse(await response.text());

        if(res.error)
        {
            document.getElementById("addEventError").innerHTML = "Error : " + res.error;
        }
        else{
            loadEvents();
            setIsOpen2(false);
        }

    } catch (e) {
        alert(e.toString());
        return;
    }
  };

  const editEvent = async (event) => {
    event.preventDefault();
    if(!EditEnd)
        newEndEdit = EditStart;
    else
      newEndEdit = EditEnd;
    var obj = {title: eTitle, description: eDescription, location: eLocation, startTime: EditStart, endTime: newEndEdit};
    console.log(obj);
    var js = JSON.stringify(obj);
    try {
        const response = await fetch(buildPath('api/events/update/'+String(ID)), {
            method: "PATCH",
            body: js,
            headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
        });

        var res = JSON.parse(await response.text());
        console.log(res);
        if(res.error)
        {
            alert(res.error);
        }
        loadEvents();
        setIsOpen(false);

    } catch (e) {
        alert(e.toString());
        return;
    }
  };
  const detour = async() =>
  {
    document.getElementById("addEventError").innerHTML = "";
    setIsOpen2(true);

  }
  window.onload = loadEvents = async() =>
   {
        //console.log(obj);

        try {
            const response = await fetch(buildPath('api/events/'), {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
            });
            var Event;
            myEventsList.length = 0;
            temp.length = 0;
            var res = JSON.parse(await response.text());
            for(var i=0;i<res.length;i++)
            {
              Event = {
                "title" : res[i].title,
                "description" : res[i].description,
                "location" : res[i].location,
                "start" : new Date(res[i].startTime),
                "end" :  new Date(res[i].endTime),
                "allDay" : false,
                "id" : res[i]._id,
                }
              temp.push(Event);
             }
             setevent(temp);
        } catch (e) {
            alert(e.toString());
            return;

        }
    };
    const saveLocation = (val) => {
      SeteLocation(val)
    }
    const saveDescription = (val) => {
      SeteDescription(val)
    }
    const saveTitle = (val) => {
      SeteTitle(val)
    }
    return(
      <div >
        <div id="indexFooter">
          <h1 id="homeTitle">My Calendar</h1>
          <Container className="border p-10" id="homeBack">
            <Container className="border p-10" id="callyContainer">
            <Button id="addEvent" onClick={detour} size="lg" className="btn btn-square rounded-circle" >+</Button>
              <div id="cally">
              <Calendar
                localizer={localizer}
                events={myEventsList}
                startAccessor="start"
                endAccessor="end"
                style={{ height:1000}}
                views={['month', 'week']}
                onSelectEvent = {event => {EventInfo(event)}}
              />
              </div>
          </Container>
        </Container>
        </div>



      <div style={{height: "400px"}}>
        <Modal withCloseButton isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle><h2><b><EdiText type='text' value={eTitle} onSave={saveTitle}/></b></h2></ModalTitle>
                    <h5><b>Location:</b></h5><EdiText type='text' value={eLocation} onSave={saveLocation}/>
                    <h5><b>Description:</b></h5><EdiText type='text' value={eDescription} onSave={saveDescription}/>
                    <h5><b>Start Time:</b></h5>
                    <DateTimePicker disableClock = {true}
                            value={EditStart}
                            onChange ={onChange3}
                        />

                    <h5><b>End Time:</b></h5>
                    <DateTimePicker disableClock = {true}
                            value={EditEnd}
                            onChange ={onChange4}
                        />
                    <p><b>*Leave End Time blank to default to start time</b></p>
                    <br></br>
                    <Button onClick={()=>{setIsOpen(!isOpen)}}>Close</Button>
                    <Button color="primary" id="editButton" onClick={editEvent}>Save Changes</Button>
                    <Button color="danger" id="delButton" onClick={Delete}>Delete</Button>
                </ModalContent>
            </ModalDialog>
        </Modal>
        </div>

        <div style={{height: "116px"}}>
        <Modal isOpen={isOpen2} toggle={()=>{setIsOpen2(!isOpen2)}}>
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
                        <p><b>*Leave End Time blank to default to start time</b></p>
                    </FormGroup>
                    <FormGroup>
                        <label>Location</label>
                        <Input id="location"></Input>
                    </FormGroup>
                    <FormGroup>
                        <label>Description</label>
                        <TextArea id="description" placeholder="Write a short description about your Event." />
                    </FormGroup>
                    <span style={{color: "red"}}id="addEventError"></span>
                    </Form>

                    <Button color="danger" onClick={()=>{setIsOpen2(!isOpen2)}}>Cancel</Button>
                    <Button id="addEventButton" color="primary" onClick={addEvent}>Add</Button>
                </ModalContent>
            </ModalDialog>
        </Modal>
        </div>

      </div>
    );
};
export default CalendarDisplay;