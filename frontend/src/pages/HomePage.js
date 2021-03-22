import React from 'react';
import Calendar from '../components/Calendar';
import HomeNavBar from '../components/HomeNavBar';

const HomePage = () =>
{
    return(
    <div>
        <HomeNavBar />
        <div id ="moveCalendar">
        <Calendar/>
        </div>
    </div>
    );
};

export default HomePage;