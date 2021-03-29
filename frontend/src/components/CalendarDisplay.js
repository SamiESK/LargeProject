import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'
import {Button, Modal, ModalContent, ModalDialog, ModalTitle, } from 'reacthalfmoon';
import { Component, isOpen, setIsOpen, useState, state, setState } from 'react'
import MyCalendar from './BigCalendar';
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


function CalendarDisplay()
{
  const [myEventsList, setevent] = useState([])
  const temp=[]

  const app_name = "eventure-calendar";
  function buildPath(route) {
    if (process.env.NODE_ENV === "production") {
          return "https://" + app_name + ".herokuapp.com/" + route;
    } else {
          return "http://localhost:5000/" + route;
    }
      
  }

  window.onload = async(event) => 
   {
        event.preventDefault();
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
                }
                temp.push(Event);
             }
             setevent(temp);
             console.log(myEventsList);
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
        />
      </div>
      </div>
    );
};
export default CalendarDisplay;