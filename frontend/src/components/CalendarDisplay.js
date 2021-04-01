import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'
import {Button, Modal, ModalContent, ModalDialog, ModalTitle, } from 'reacthalfmoon';
import { useState} from 'react'
import { Form, FormGroup, Input, TextArea } from 'reacthalfmoon';
import DateTimePicker from 'react-datetime-picker';
import EditableLabel from 'react-inline-editing';

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
var eTitle;
var eDescription;
var eLocation;
var eStartTime;
var eEndTime;
var d = new Date();
var deleteID;
var loadEvents;
function CalendarDisplay()
{
  
  const [myEventsList, setevent] = useState([])
  const temp=[]
  const [isOpen, setIsOpen] = useState(false)
  const app_name = "eventree-calendar";
  const [isOpen2, setIsOpen2] = useState(false)

  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
          return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
          return "http://localhost:5000/" + route;
    }
      
  }

  const [startDate, onChange] = useState(new Date());
  const [endDate, onChange2] = useState(new Date());

  const EventInfo = (e) =>
  {
    setIsOpen(true);
    eTitle = e.title;
    eDescription = e.description;
    eLocation = e.location;
    console.log(typeof(eLocation));
    eStartTime = d.toString(e.start);
    eEndTime = d.toString(e.end);
    deleteID = e.id;
  };

  
  const Delete = async(event) =>
  {
    event.preventDefault();
    // = {title: title, description: description, location: location, startTime: startDate, endTime: endDate};
        console.log(deleteID);
        //console.log(obj);
        //var js = JSON.stringify(obj);
        try {
            const response = await fetch(buildPath('api/events/remove/'+String(deleteID)), {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
            });
            var res = JSON.parse(await response.text());
            loadEvents();
            setIsOpen(false);
        } catch (e) {
            alert(e.toString());
            return;
        
        }  
  };
  
  const addEvent = async (event) => {
    event.preventDefault();
    title = document.getElementById("eventtitle").value
    location = document.getElementById("location").value
    description = document.getElementById("description").value
   
    var obj = {title: title, description: description, location: location, startTime: startDate, endTime: endDate};
    
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
            alert(res.error);
        }
        loadEvents();
        setIsOpen2(false);

    } catch (e) {
        alert(e.toString());
        return;
    }
  };
  
  window.onload = loadEvents = async() => 
   {
        
        var obj;// = {title: title, description: description, location: location, startTime: startDate, endTime: endDate};
        
        //console.log(obj);
        var js = JSON.stringify(obj);
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

    return(
      <div>
        <Button id="addEvent" onClick={()=>{setIsOpen2(true)}} color="primary" size="lg">Add Event</Button>
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
      <div style={{height: "400px"}}>
        <Modal withCloseButton isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle><h3><b>{eTitle}</b></h3></ModalTitle>
                    <h5><b>Location:</b>{eLocation}</h5>
                    <p>Description: {eDescription}</p>
                    <p>Start Date: {eStartTime}</p>
                    <p>End Date: {eEndTime}</p>
                    <Button onClick={()=>{setIsOpen(!isOpen)}}>Close</Button>
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