import { Grid, GridItem, Text, Heading, VStack } from '@chakra-ui/react';
import getDayjs from '../utils/getDayjs';
import PropTypes from 'prop-types';

// const initialSchoolYear = 2024;

const YearWeeksGrid = ({
  selectedWeeks,
  setSelectedWeeks,
  initialSchoolYear,
}) => {
  const dayjs = getDayjs();

  // Générer les semaines de septembre (année actuelle) à septembre (année suivante)
  const generateWeeks = (startYear) => {
    let weeks = [];
    const startDate = dayjs(`${startYear}-09-01`).startOf('isoWeek'); // Début de l'année scolaire
    const endDate = dayjs(`${startYear + 1}-08-31`).endOf('isoWeek'); // Fin de l'année scolaire

    let currentWeekStart = startDate;

    while (
      currentWeekStart.isBefore(endDate) ||
      currentWeekStart.isSame(endDate)
    ) {
      const weekEnd = currentWeekStart.endOf('isoWeek');
      weeks.push({
        start: currentWeekStart.format('YYYY-MM-DD'),
        end: weekEnd.format('YYYY-MM-DD'),
      });
      currentWeekStart = currentWeekStart.add(1, 'week'); // Passer à la semaine suivante
    }

    return weeks;
  };

  const weeks = generateWeeks(initialSchoolYear);

  // Gestion de la sélection/déselection
  const toggleWeekSelection = (week) => {
    setSelectedWeeks((prev) => {
      const newSelectedWeeks = prev.includes(week)
        ? prev.filter((w) => w !== week)
        : [...prev, week];
      return newSelectedWeeks.sort((a, b) => a - b);
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Grid
        templateColumns="repeat(6, 1fr)"
        gap={4}
        maxH={'20rem'}
        overflowY={'auto'}
      >
        {weeks.map((week, index) => {
          const isSelected = selectedWeeks.includes(index + 1);
          return (
            <GridItem
              key={index}
              p={4}
              border="1px solid"
              borderColor={isSelected ? 'blue.400' : 'gray.200'}
              borderRadius="md"
              bg={isSelected ? 'blue.100' : 'white'}
              textAlign="center"
              cursor="pointer"
              _hover={{ bg: isSelected ? 'blue.200' : 'gray.50' }}
              onClick={() => toggleWeekSelection(index + 1)}
            >
              <Text fontWeight="bold" m={0}>
                Semaine {index + 1}
              </Text>
              <Text fontSize="sm" m={0}>
                {dayjs(week.start).format('DD-MM')} -{' '}
                {dayjs(week.end).weekday(4).format('DD-MM')}
              </Text>
              <Text fontSize="sm" color={'gray'} m={0}>
                {dayjs(week.start).format('YYYY')}
              </Text>
            </GridItem>
          );
        })}
      </Grid>
    </VStack>
  );
};

YearWeeksGrid.propTypes = {
  selectedWeeks: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  setSelectedWeeks: PropTypes.func.isRequired,
  initialSchoolYear: PropTypes.number.isRequired,
};

export default YearWeeksGrid;
