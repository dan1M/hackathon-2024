import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'; // Week/Day view
import dayGridPlugin from '@fullcalendar/daygrid'; // Month view
import interactionPlugin from '@fullcalendar/interaction'; // For interactions
import multiMonthPlugin from '@fullcalendar/multimonth'; // For multi-month view
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import getDayjs from '../utils/getDayjs';
import { supabase } from '../utils/supabaseClient';
import { Box, Center, Heading } from '@chakra-ui/react';

const CustomCalendar = ({
  initialView,
  availableViews,
  setCurrentView,
  setCalendarViewDates,
  isDisabled,
  disabledText,
  initialSchoolYear,
  backgroundEvents = [],
  events = [],
  aiEvents = [],
  handleEventClick,
}) => {
  const d = getDayjs();

  const [slots, setSlots] = useState([
    { start: '09:00', end: '12:30' },
    { start: '13:30', end: '17:00' },
    { start: '17:15', end: '19:00' },
  ]); // Default school slots

  const prevDatesRef = useRef({ start: null, end: null });

  const handleDatesSet = (arg) => {
    if (
      setCalendarViewDates &&
      (prevDatesRef.current.start !== arg.startStr ||
        prevDatesRef.current.end !== arg.endStr)
    ) {
      setCalendarViewDates({
        start: arg.start,
        end: arg.end,
      });
      prevDatesRef.current = { start: arg.startStr, end: arg.endStr };
    }
    setCurrentView && setCurrentView(arg.view.type);
  };

  const fetchSlots = async () => {
    const { data: fetchedSlots, error } = await supabase
      .from('time_slots')
      .select('start_time, end_time')
      .order('start_time', { ascending: true });

    if (error) return console.error('Error fetching slots:', error);

    const slots = fetchedSlots.map((slot) => ({
      start: slot.start_time,
      end: slot.end_time,
    }));

    setSlots(slots);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDateClick = (arg) => {
    if (!isDisabled) {
      calendarRef.current.getApi().changeView('timeGridWeek', arg.date);
    }
  };

  const calendarRef = useRef(null);

  const handleEventDrop = (info) => {
    const eventStart = info.event.start;
    const eventEnd = info.event.end;

    const isWithinSlot = slots.some((slot) => {
      const slotStart = d(eventStart)
        .set('hour', slot.start.split(':')[0])
        .set('minute', slot.start.split(':')[1]);
      const slotEnd = d(eventEnd)
        .set('hour', slot.end.split(':')[0])
        .set('minute', slot.end.split(':')[1]);
      return eventStart >= slotStart && eventEnd <= slotEnd;
    });

    if (!isWithinSlot) {
      info.revert();
    }
  };

  return (
    <Box style={{ position: 'relative' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          timeGridPlugin,
          dayGridPlugin,
          interactionPlugin,
          multiMonthPlugin,
        ]}
        initialDate={`${initialSchoolYear}-09-01`}
        initialView={initialView || 'timeGridWeek'}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: availableViews || 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        views={{
          multiMonthYear: {
            type: 'multiMonthYear',
            duration: { months: 6 },
            buttonText: 'Semestre',
          },
        }}
        buttonText={{
          today: 'Date actuelle',
          month: 'Mois',
          week: 'Semaine',
        }}
        validRange={{
          start: `${initialSchoolYear}-09-01`,
          end: `${initialSchoolYear + 1}-08-31`,
        }}
        locale="fr"
        firstDay={1}
        allDaySlot={false}
        droppable={!isDisabled}
        editable={!isDisabled}
        selectable={!isDisabled}
        hiddenDays={[0]} // Hide Sunday
        height={'auto'}
        slotMinTime={slots[0].start}
        slotMaxTime={slots[slots.length - 1].end}
        datesSet={handleDatesSet}
        events={[...backgroundEvents, ...events, ...aiEvents]}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
      />
      {isDisabled && disabledText && (
        <Center
          pos={'absolute'}
          zIndex={10}
          top={0}
          left={0}
          w={'full'}
          h={'full'}
          backdropFilter={'blur(2px)'}
          filter={'grayscale(1)'}
        >
          <Heading size={'md'}>{disabledText}</Heading>
        </Center>
      )}
    </Box>
  );
};

CustomCalendar.propTypes = {
  initialView: PropTypes.string,
  availableViews: PropTypes.string,
  setCurrentView: PropTypes.func,
  setCalendarViewDates: PropTypes.func,
  isDisabled: PropTypes.bool,
  disabledText: PropTypes.string,
  initialSchoolYear: PropTypes.number.isRequired,
  backgroundEvents: PropTypes.array,
  events: PropTypes.array,
  aiEvents: PropTypes.array,
  handleEventClick: PropTypes.func,
};

export default CustomCalendar;
