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

const PlanningsPage = () => {
  const t = useToast();
  const d = getDayjs();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState();
  const [currentWeek, setCurrentWeek] = useState(d().week());
  const [classCoursesToPlace, setClassCoursesToPlace] = useState([]);
  const [classSchoolWeeks, setClassSchoolWeeks] = useState([]);

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
  }, [selectedClass]);

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
              initialSchoolYear={2024}
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
          <Text mb={4}>Matières à placer</Text>
          {classCoursesToPlace.length === 0 && (
            <Text textAlign={'center'} color={'gray'}>
              Aucune matière à placer pour cette classe
            </Text>
          )}
        </Box>
        <CustomCalendar
          initialSchoolYear={2024}
          initialView={'multiMonthYear'}
          availableViews={'multiMonthYear,dayGridMonth,timeGridWeek'}
          setCurrentWeek={setCurrentWeek}
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
