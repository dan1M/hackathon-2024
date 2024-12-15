import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Select,
  Spinner,
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
import { generatePlanning } from '../utils/generate-planning';
import { BsStars } from 'react-icons/bs';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { Modal, Button as BsButton, Form } from 'react-bootstrap';
import AiSuggestions from '../components/ai-suggestions';

const initialSchoolYear = 2024;

const PlanningsPage = () => {
  const t = useToast();
  const d = getDayjs();
  const [schoolRooms, setSchoolRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState();
  const [currentView, setCurrentView] = useState('multiMonthYear');
  const [calendarViewDates, setCalendarViewDates] = useState({
    start: d().toDate(),
    end: d().toDate(),
  });
  const [classCoursesToPlace, setClassCoursesToPlace] = useState([]);
  const [classSchoolWeeks, setClassSchoolWeeks] = useState([]);
  const [classExistingLessons, setClassExistingLessons] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLessonsList, setAiLessonsList] = useState([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    start: '',
    date: '',
    end: '',
    description: '',
    courseId: null,
    teacherId: null,
    classroomId: null,
    color: '#007bff', // Default to blue
  });

  const firstWeekOfSchool = d(`${initialSchoolYear}-09-01`).week();

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

  const fetchClassrooms = async () => {
    try {
      const { data: fetchedClassrooms, error } = await supabase
        .from('classroom')
        .select('*');
      if (error) throw error;
      setSchoolRooms(fetchedClassrooms);
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data: fetchedTeachers, error } = await supabase
        .from('users_hackathon')
        .select('*')
        .eq('role', 'teacher');
      if (error) throw error;
      setTeachers(fetchedTeachers);
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
    }
  };

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

  const getAIclassLessons = async () => {
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

    const availableWeeks = classes
      .find((classe) => classe.id == selectedClass)
      .available_weeks.filter((week) => {
        const realWeek = (week + firstWeekOfSchool - 1) % 52;
        const year =
          initialSchoolYear + Math.floor((week + firstWeekOfSchool - 1) / 52);
        const weekStart = d().year(year).week(realWeek).startOf('week');
        const weekEnd = d().year(year).week(realWeek).endOf('week');
        return (
          d(calendarViewDates.start).isBefore(weekEnd) &&
          d(calendarViewDates.end).isAfter(weekStart)
        );
      });

    let aiLessons = [];
    setIsLoading(true);
    // Call to generatePlanningWithAI for each week
    for (const week of availableWeeks) {
      const weekLessons = await generatePlanning({
        class_id: selectedClass,
        week: week,
        dontCreate: true,
      });
      aiLessons.push(...weekLessons);
    }
    setAiLessonsList(aiLessons);
    setIsLoading(false);
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
    const availableWeeks = classes
      .find((classe) => classe.id == selectedClass)
      .available_weeks.filter((week) => {
        const realWeek = (week + firstWeekOfSchool - 1) % 52;
        const year =
          initialSchoolYear + Math.floor((week + firstWeekOfSchool - 1) / 52);
        const weekStart = d().year(year).week(realWeek).startOf('week');
        const weekEnd = d().year(year).week(realWeek).endOf('week');
        return (
          d(calendarViewDates.start).isBefore(weekEnd) &&
          d(calendarViewDates.end).isAfter(weekStart)
        );
      });

    setIsLoading(true);
    for (const week of availableWeeks) {
      await generatePlanning({
        class_id: selectedClass,
        week: week,
      });
      getClassExistingLessons();
    }
    setIsLoading(false);

    t({
      title: 'Cours placés',
      description: `Les cours de la classe ${
        classes.find((classe) => classe.id == selectedClass).name
      } ont été placés`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
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

  const handleSaveEvent = async () => {
    const { start, end, courseId, teacherId, classroomId, date, color } =
      eventForm;

    const normalizeTime = (time) => time.slice(0, 5).trim();

    // Ensure required fields are filled
    if (
      !start ||
      !end ||
      !courseId ||
      !teacherId ||
      !classroomId ||
      !selectedClass ||
      !date
    ) {
      alert(
        'Veuillez remplir tous les champs obligatoires avant de sauvegarder.'
      );
      return;
    }

    const lessonData = {
      date,
      start_time: normalizeTime(start),
      end_time: normalizeTime(end),
      course_id: courseId,
      teacher_id: teacherId,
      classroom_id: classroomId,
      class_id: selectedClass,
      color,
    };

    try {
      if (eventForm.id) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', eventForm.id);

        if (error) throw error;

        getClassExistingLessons();
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('lessons')
          .insert(lessonData)
          .select();

        if (error) throw error;

        getClassExistingLessons();
      }

      setShowEventModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cours :', error);
      alert('Échec de la sauvegarde du cours. Veuillez réessayer.');
    }
  };

  const handleDeleteEvent = async () => {
    const { id } = eventForm;
    if (id) {
      try {
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;

        setShowEventModal(false);
        getClassExistingLessons();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchClassrooms();
    fetchTeachers();
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
        return JSON.parse(event.getAttribute('data-event'));
      },
    });
    return () => {
      draggable.destroy();
    };
  });

  console.log(eventForm);
  return (
    <Box>
      <AiSuggestions />
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
                  data-event={JSON.stringify({
                    title: course.name,
                    duration: '03:30',
                    color: course.color,
                    create: true,
                  })}
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
          hidden={
            !selectedClass ||
            classCoursesToPlace.length === 0 ||
            (currentView === 'timeGridWeek' &&
              !classSchoolWeeks.includes(
                d(calendarViewDates.start).week() - firstWeekOfSchool + 1
              ))
          }
        >
          <Button
            bgColor={'blue.100'}
            onClick={generateClassPlanning}
            isDisabled={isLoading}
          >
            <FaRegCalendarPlus style={{ marginRight: '.5rem' }} />
            Placement automatique
          </Button>
          {isLoading && <Spinner />}
          <Flex flexDir={'column'} gap={4}>
            <Button
              bgColor={'blue.100'}
              onClick={getAIclassLessons}
              isDisabled={isLoading}
            >
              <BsStars style={{ marginRight: '.5rem' }} />
              Placement optimisé par IA
            </Button>
            <Flex justify={'space-around'} hidden={aiLessonsList.length === 0}>
              <Button
                bgColor={'green.200'}
                onClick={() => setAiLessonsList([])}
              >
                Accepter
              </Button>
              <Button bgColor={'red.200'} onClick={() => setAiLessonsList([])}>
                Refuser
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <CustomCalendar
          initialSchoolYear={initialSchoolYear}
          initialView={'multiMonthYear'}
          availableViews={'multiMonthYear,dayGridMonth,timeGridWeek'}
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
            title: classCoursesToPlace.find((cc) => cc.id == lesson.course_id)
              ?.name,
            start: `${lesson.date}T${lesson.start_time}`,
            end: `${lesson.date}T${lesson.end_time}`,
            color: classCoursesToPlace.find((cc) => cc.id == lesson.course_id)
              ?.color,
            teacher_id: lesson.teacher_id,
            classroom_id: lesson.classroom_id,
            class_id: lesson.class_id,
          }))}
          aiEvents={aiLessonsList.map((lesson) => ({
            title: classCoursesToPlace.find((cc) => cc.id == lesson.course_id)
              ?.name,
            start: `${lesson.date}T${lesson.start_time}`,
            end: `${lesson.date}T${lesson.end_time}`,
            color: classCoursesToPlace.find((cc) => cc.id == lesson.course_id)
              ?.color,
          }))}
          setCurrentView={setCurrentView}
          setCalendarViewDates={setCalendarViewDates}
          isDisabled={!selectedClass}
          disabledText={
            selectedClass
              ? undefined
              : 'Sélectionnez une classe pour affecter les cours'
          }
          handleEventClick={(arg) => {
            const event = arg.event;
            setEventForm({
              id: event.id,
              title: event.title,
              start: event.startStr.slice(11, 16),
              end: event.endStr.slice(11, 16),
              description: event.extendedProps.description || '',
              courseId: classCoursesToPlace.find(
                (course) => course.name === event.title
              )?.id,
              teacherId: event.extendedProps.teacher_id,
              classroomId: event.extendedProps.classroom_id,
              color: event.backgroundColor,
              date: event.startStr.split('T')[0],
            });
            setShowEventModal(true);
          }}
        />
      </Flex>

      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {eventForm.id ? 'Modifier le cours' : 'Ajouter un cours'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="eventTitle" className="mb-3">
              <Form.Label>Nom du Cours</Form.Label>
              <Form.Select
                name="courseId"
                value={eventForm.courseId || ''}
                onChange={(e) => {
                  const selectedCourse = classCoursesToPlace.find(
                    (course) => course.id === parseInt(e.target.value)
                  );
                  setEventForm({
                    ...eventForm,
                    courseId: selectedCourse?.id,
                    title: selectedCourse?.name,
                    description: selectedCourse?.description || '',
                  });
                }}
              >
                <option value="">-- Sélectionner un cours --</option>
                {classCoursesToPlace.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="teacherSelect" className="mb-3">
              <Form.Label>Sélectionner un professeur</Form.Label>
              <Form.Select
                name="teacherId"
                value={eventForm.teacherId || ''}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    teacherId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">-- Aucun professeur assigné --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="classroomSelect" className="mb-3">
              <Form.Label>Sélectionner une salle</Form.Label>
              <Form.Select
                name="classroomId"
                value={eventForm.classroomId || ''}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    classroomId: parseInt(e.target.value),
                  })
                }
              >
                <option value="">-- Aucune salle assignée --</option>
                {schoolRooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {eventForm.id && (
            <BsButton variant="danger" onClick={handleDeleteEvent}>
              Supprimer
            </BsButton>
          )}
          <BsButton
            variant="secondary"
            onClick={() => setShowEventModal(false)}
          >
            Fermer
          </BsButton>
          <BsButton variant="primary" onClick={handleSaveEvent}>
            Enregistrer les modifications
          </BsButton>
        </Modal.Footer>
      </Modal>
    </Box>
  );
};

export default PlanningsPage;
