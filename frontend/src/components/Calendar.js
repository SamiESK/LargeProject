import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import React from 'react'

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
var bob;
bob = "Sat Mar 06 2021 21:38:01 GMT-0500 (Eastern Standard Time)";
let myEventsList=[
  {
    id: 11,
    title: 'wedding',
    start: new Date('Mar 18 2021 01:00 AM'),
    end: new Date('Mar 18 2021 01:00 AM' ),
    allDay : false,
    description : "I like big butts",
  },
  {
    title: 'bobs Birthday',
    start: new Date(bob),
    end: new Date('Sat Mar 06 2021 22:38:01 GMT-0500 (Eastern Standard Time)'),
    allDay : false,
    description : "I like big butts",
  },
  {
    title: 'baloni Assignment 5',
    start: '04/7/2021',
    end: '04/7/2021',
    allDay : true,
    description : "I like big butts",
  }
];

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


export default MyCalendar;