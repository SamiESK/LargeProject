import React from 'react';
import Calendar from '../components/CalendarDisplay';
import HomeNavBar from '../components/HomeNavBar';
import { Component } from 'react';


const HomePage = () =>
{
    return(
        <div >
        <Calendar />
        <HomeNavBar />     
    </div>
        
    );
};

export default HomePage;