import React from 'react';
import Calendar from '../components/Calendar';
import navBar from '../components/navBar';

const HomePage = () =>
{
    return(
    <div>
        <navBar/>
        <div id ="moveCalendar">
        <Calendar/>
        </div>
    </div>
    );
};

export default HomePage;