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

let myEventsList=[
  {
    id: 11,
    title: 'wedding',
    start: new Date('Thu Mar 18 2021 00:00:00'),
    end: new Date('Thu Mar 18 2021 10:00:00'),
    allDay : false,
    description : "I like big butts",
  },
  {
    title: 'bobs Birthday',
    start: '03/25/2021',
    end: '03/27/2021',
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