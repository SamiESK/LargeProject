import React from 'react';
import Calendar from '../components/Calendar';
import HomeNavBar from '../components/HomeNavBar';

const HomePage = () =>
{
    return(
    <div>
        
        <div id ="moveCalendar">
        <Calendar/>
        </div>
        <HomeNavBar />
    </div>
    );
};

export default HomePage;