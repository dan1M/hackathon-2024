import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import getDayjs from '../utils/getDayjs';
import { FormControl, FormLabel } from 'react-bootstrap';
import CustomCalendar from '../components/custom-calendar';
import { supabase } from '../utils/supabaseClient';
import YearWeeksGrid from '../components/YearWeeksGrid';
import { Draggable } from '@fullcalendar/interaction/index.js';

const initialSchoolYear = 2024;

const PlanningsPage = () => {
  const t = useToast();
  const d = getDayjs();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState();
  const [currentWeek, setCurrentWeek] = useState(d().week());
  const [currentView, setCurrentView] = useState('multiMonthYear');
  const [classCoursesToPlace, setClassCoursesToPlace] = useState([]);
  const [classSchoolWeeks, setClassSchoolWeeks] = useState([]);
  const [classExistingLessons, setClassExistingLessons] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);

  const fetchClasses = async () => {
    try {
      const { data: fetchedClasses, error } = await supabase
        .from('classes')
        .select('*');
      if (error) throw error;
      setClasses(fetchedClasses);
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
    }
  };

  const firstWeekOfSchool = d(`${initialSchoolYear}-09-01`).week();

  const updateClassAvailableWeeks = async () => {
    if (!selectedClass) return;
    const { error } = await supabase
      .from('classes')
      .update({
        available_weeks: classSchoolWeeks,
      })
      .eq('id', selectedClass);
    if (error) return console.error('Erreur lors de la mise à jour:', error);
    t({
      title: 'Semaines mises à jour',
      description: `Les semaines de la classe ${
        classes.find((classe) => classe.id == selectedClass).name
      } ont été mises à jour`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    fetchClasses();
  };

  const generateClassPlanning = async () => {
    if (!selectedClass) return;
    if (!classCoursesToPlace.length) {
      t({
        title: 'Aucune matière à placer',
        description: `Il n'y a aucune matière à placer pour la classe ${
          classes.find((classe) => classe.id == selectedClass).name
        }`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (
      !classes.find((classe) => classe.id == selectedClass).available_weeks
        .length
    ) {
      t({
        title: 'Pas de semaine de cours',
        description: `Il n'y a aucune semaine de cours pour la classe ${
          classes.find((classe) => classe.id == selectedClass).name
        }`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  };

  const getClassCoursesToPlace = async () => {
    if (!selectedClass) return;

    const { data: fetchedCourses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('semester', selectedSemester)
      .eq(
        'school_field_level_id',
        classes.find((classe) => classe.id == selectedClass)
          .school_field_level_id
      );
    if (error)
      return console.error('Erreur lors de la récupération des cours:', error);
    setClassCoursesToPlace(fetchedCourses);
  };

  const getClassExistingLessons = async () => {
    if (!selectedClass) return;
    // get lessons of the selected class where date is between the start and end of the school year
    const { data: fetchedLessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('class_id', selectedClass)
      .gte('date', `${initialSchoolYear}-09-01`)
      .lte('date', `${initialSchoolYear + 1}-08-31`);
    if (error)
      return console.error('Erreur lors de la récupération des cours:', error);
    setClassExistingLessons(fetchedLessons);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setClassCoursesToPlace([]);
      setClassSchoolWeeks([]);
      return;
    }
    setClassSchoolWeeks(
      classes.find((classe) => classe.id == selectedClass).available_weeks
    );
    getClassCoursesToPlace();
    getClassExistingLessons();
  }, [selectedClass, selectedSemester]);

  useEffect(() => {
    const draggableEl = document.getElementById('external-events');
    if (!draggableEl) return;
    const draggable = new Draggable(draggableEl, {
      itemSelector: '.fc-event',
      eventData: (event) => {
        return {};
      },
    });
    return () => {
      draggable.destroy();
    };
  });

  return (
    <Box>
      <Flex justify={'center'} mb={6}>
        <FormControl as={Box} w={'20rem'}>
          <FormLabel htmlFor="selected-class">Classe sélectionnée</FormLabel>
          <Select
            id="selected-class"
            name="selected-class"
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Aucune classe sélectionnée --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>

      <Flex flexDir={'column'} gap={8}>
        <Heading>Gérer les semaines de cours</Heading>

        {selectedClass ? (
          <>
            <Flex justify={'space-between'} align={'end'}>
              <Heading size="md" maxW={'75%'}>
                Semaines actuelles ({classSchoolWeeks.length})&nbsp;:&nbsp;
                {classSchoolWeeks.map((week, index) => (
                  <Text as={'span'} key={index}>
                    {week}
                    {index < classSchoolWeeks.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </Heading>
              <Button
                variant={'solid'}
                bgColor={'blue'}
                color={'white'}
                onClick={updateClassAvailableWeeks}
                isDisabled={
                  classSchoolWeeks.length ===
                  classes.find((classe) => classe.id == selectedClass)
                    .available_weeks.length
                }
              >
                Mettre à jour
              </Button>
            </Flex>

            <YearWeeksGrid
              selectedWeeks={classSchoolWeeks}
              setSelectedWeeks={setClassSchoolWeeks}
              initialSchoolYear={initialSchoolYear}
            />
          </>
        ) : (
          <Text textAlign={'center'} color={'gray'}>
            Sélectionnez une classe pour gérer les semaines de cours
          </Text>
        )}
      </Flex>

      <Divider my={16} />

      <Flex flexDir={'column'} gap={8}>
        <Heading>Affecter les cours</Heading>

        <Box
          borderWidth={1}
          p={2}
          px={4}
          rounded={'md'}
          maxH={'20rem'}
          overflow={'auto'}
          hidden={!selectedClass}
        >
          <Flex align={'center'} gap={4} mb={4}>
            <Text m={0}>Matières à placer</Text>
            <Select
              w={'10rem'}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            >
              <option value={1}>Semestre 1</option>
              <option value={2}>Semestre 2</option>
            </Select>
          </Flex>
          {classCoursesToPlace.length === 0 && (
            <Text textAlign={'center'} color={'gray'}>
              Aucune matière à placer pour cette classe
            </Text>
          )}

          <Flex id="external-events">
            {classCoursesToPlace.map((course) => {
              const consumedTime = classExistingLessons
                .filter((lesson) => lesson.course_id === course.id)
                .reduce((acc, lesson) => {
                  const start = d(lesson.date + 'T' + lesson.start_time);
                  const end = d(lesson.date + 'T' + lesson.end_time);
                  const duration = end.diff(start, 'minute') / 60;
                  return acc + duration;
                }, 0);

              return (
                <Flex
                  key={course.id}
                  className="fc-event"
                  justify={'space-between'}
                  align={'center'}
                  bg={course.color}
                  color={'white'}
                  p={2}
                  px={4}
                  rounded={'md'}
                  flexDir={'column'}
                  mr={4}
                  cursor={'grab'}
                  draggable
                >
                  <Text m={0}>{course.name}</Text>
                  <Text m={0}>
                    {consumedTime + '/' + course.hourly_volume}h
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
        <Flex
          justify={'space-between'}
          hidden={!selectedClass || classCoursesToPlace.length === 0}
        >
          <Button bgColor={'blue.100'} onClick={generateClassPlanning}>
            Placement automatique (
            {currentView === 'multiMonthYear'
              ? 'Semestre'
              : currentView === 'dayGridMonth'
              ? 'Mois'
              : 'Semaine'}
            )
          </Button>
        </Flex>
        <CustomCalendar
          initialSchoolYear={initialSchoolYear}
          initialView={'multiMonthYear'}
          availableViews={'multiMonthYear,dayGridMonth,timeGridWeek'}
          setCurrentWeek={setCurrentWeek}
          backgroundEvents={
            classes &&
            classes
              .find((classe) => classe.id == selectedClass)
              ?.available_weeks.map((week) => {
                const realWeek = (week + firstWeekOfSchool - 1) % 52;
                const year =
                  initialSchoolYear +
                  Math.floor((week + firstWeekOfSchool - 1) / 52);
                return {
                  start: d()
                    .year(year)
                    .week(realWeek)
                    .startOf('week')
                    .format('YYYY-MM-DD'),
                  end: d()
                    .year(year)
                    .week(realWeek)
                    .endOf('week')
                    .format('YYYY-MM-DD'),
                  display: 'background',
                };
              })
          }
          events={classExistingLessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.course_id,
            start: `${lesson.date}T${lesson.start_time}`,
            end: `${lesson.date}T${lesson.end_time}`,
            color: classCoursesToPlace.find((cc) => cc.id == lesson.course_id)
              ?.color,
          }))}
          setCurrentView={setCurrentView}
          isDisabled={!selectedClass}
          disabledText={
            selectedClass
              ? undefined
              : 'Sélectionnez une classe pour affecter les cours'
          }
        />
      </Flex>
    </Box>
  );
};

export default PlanningsPage;
