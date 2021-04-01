import React from 'react';
import Calendar from '../components/CalendarDisplay';
import HomeNavBar from '../components/HomeNavBar';
import AddEvent from '../components/AddEvent';
import { Component } from 'react';
import { PageWrapper } from 'reacthalfmoon';


const HomePage = () =>
{

    return(
    <div>
        <HomeNavBar />
        <AddEvent />
        <Calendar/>     
    </div>
    );
};

export default HomePage;