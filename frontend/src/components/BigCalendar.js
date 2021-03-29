import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import{useState} from 'react';
import{Button, Modal, ModalContent, ModalDialog, ModalTitle} from 'reacthalfmoon'
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
  /*
  const MyCalendar = props => (
    <div id="cally">
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        style={{ height:1000}}
        onSelectEvent={event => alert(event.description)}
        views={['month']}
        
      />
    </div>
    
  ) 
*/
  
export default function BigCalendar({myEventsList}){
    const [isOpen, setIsOpen] = useState(false)
    return(
        <>
        <div id="cally">
        <Calendar
          localizer={localizer}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          style={{ height:1000}}
          onSelectEvent={event => {setIsOpen(true)}}
          views={['month', 'week']}
        />
      </div>
      <div style={{height: "400px"}}>
        <Modal withCloseButton isOpen={isOpen} toggle={()=>{setIsOpen(!isOpen)}}>
            <ModalDialog>
                <ModalContent>
                    <ModalTitle>Modal Title</ModalTitle>
                    <p></p>
                    <Button onClick={()=>{setIsOpen(!isOpen)}}>Close</Button>
                </ModalContent>
            </ModalDialog>
        </Modal>
        
        </div>
        </>
    );
};
  

  
 