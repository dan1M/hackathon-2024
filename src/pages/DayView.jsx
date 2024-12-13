import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

const DayView = () => {
  return (
    <FullCalendar
      plugins={[timeGridPlugin]}
      initialView="timeGridDay"
      events={[
        { title: 'Conférence', start: '2024-12-11T08:00:00', end: '2024-12-11T10:00:00' },
      ]}
    />
  );
};

export default DayView;
