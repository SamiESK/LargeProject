import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'
import {Button} from 'reacthalfmoon';
import { Component } from 'react'

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}
let myEventsList = [];

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})
const MyCalendar = props => (
  <div id="cally">
    <Calendar
      localizer={localizer}
      events={myEventsList}
      selectable={true}
      startAccessor="start"
      endAccessor="end"
      style={{ height:1000}}
      onSelectEvent={event => alert(event.description)}
      views={['month', 'week']}
    />
    
  </div>
) 

function CalendarDisplay()
{
    
    const app_name = "eventure-calendar";
    function buildPath(route) {
        if (process.env.NODE_ENV === "production") {
            return "https://" + app_name + ".herokuapp.com/" + route;
        } else {
            return "http://localhost:5000/" + route;
        }
      
    }

   const displayEvents = async (event) => {
        
        event.preventDefault();
        var obj;// = {title: title, description: description, location: location, startTime: startDate, endTime: endDate};
        
        //console.log(obj);
        var js = JSON.stringify(obj);
        try {
            const response = await fetch(buildPath('api/events/'), {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + localStorage.getItem('token')},
            });
            let temp;
            var res = JSON.parse(await response.text());
            for(var i=0;i<res.length;i++)
            {
              temp = {
                "title" : res[i].title,
                "description" : res[i].description,
                "location" : res[i].location,
                "start" : res[i].startTime,
                "end" : res[i].endTime,
                }
                  myEventsList.push(temp);
             }
          
        } catch (e) {
            alert(e.toString());
            return;
        }
        
        
    };
  
    
    return(
      
      <div>
        <Button onClick={displayEvents}>Display Events</Button>
      <MyCalendar />
      
      </div>
    );
  };

export default CalendarDisplay;