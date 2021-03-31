import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'
import {Button, Modal, ModalContent, ModalDialog, ModalTitle, } from 'reacthalfmoon';
import { useState} from 'react'

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
  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
          return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
          return "http://localhost:5000/" + route;
    }
      
  }
  const EventInfo = (e) =>
  {
    setIsOpen(true);
    eTitle = e.title;
    eDescription = e.description;
    eLocation = e.location;
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
                    <ModalTitle>{eTitle}</ModalTitle>
                    <p>Location: {eLocation}</p>
                    <p>Description: {eDescription}</p>
                    <p>Start Date: {eStartTime}</p>
                    <p>End Date: {eEndTime}</p>
                    <Button onClick={()=>{setIsOpen(!isOpen)}}>Close</Button>
                    <Button color="danger" id="delButton" onClick={Delete}>Delete</Button>
                </ModalContent>
            </ModalDialog>
        </Modal>
        
        </div>
      </div>
    );
};
export default CalendarDisplay;