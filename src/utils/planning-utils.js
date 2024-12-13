import { supabase } from './supabaseClient';

export const findAvailableEntities = async (
  table,
  entityColumn,
  date,
  start_time,
  end_time
) => {
  try {
    const { data: occupiedEntities, error } = await supabase
      .from('lessons')
      .select(entityColumn)
      .eq('date', date)
      .lte('start_time', end_time)
      .gte('end_time', start_time);

    if (error) {
      console.error(
        `Erreur lors de la recherche des entités occupées dans ${table} :`,
        error
      );
      return [];
    }

    const occupiedEntityIds = occupiedEntities.map(
      (entity) => entity[entityColumn]
    );

    let query = supabase
      .from(table)
      .select('*')
      .not('id', 'in', `(${occupiedEntityIds.join(',')})`);

    query = entityColumn === 'teacher_id' ? query.eq('role', 'teacher') : query;

    const { data: availableEntities, error: availableError } = await query;

    let entities = availableEntities;

    if (entityColumn === 'teacher_id') {
      entities = await Promise.all(
        availableEntities.map(async (entity) => {
          const isAvailable = await checkTeacherAvailability(
            entity.id,
            date,
            start_time,
            end_time
          );
          return isAvailable ? entity : null; // Retourne l'entité si disponible, sinon null
        })
      );

      // Enlève les entités items null du tableau
      entities = entities.filter((entity) => entity !== null);
    }

    if (availableError) {
      console.error(
        `Erreur lors de la récupération des entités disponibles dans ${table} :`,
        availableError
      );
      return [];
    }

    return entities;
  } catch (error) {
    console.error('Erreur interne dans findAvailableEntities :', error);
    return [];
  }
};

const checkTeacherAvailability = async (teacherId, date) => {
  try {
    // Récupérer les périodes de disponibilité du professeur depuis la table teacher_availability
    const { data: availabilities, error } = await supabase
      .from('teacher_availabilities')
      .select()
      .eq('teacher_id', teacherId);

    if (error) {
      console.error(
        'Erreur lors de la récupération des disponibilités :',
        error
      );
      return false;
    }

    const hasAnAvailability = availabilities.some((availability) => {
      const startDate = new Date(availability.start_date);
      const endDate = new Date(availability.end_date);
      const requestedDate = new Date(date);

      // Vérifier si la date demandée est dans la période de disponibilité ou d'indisponibilité
      const isDateInRange =
        requestedDate >= startDate && requestedDate <= endDate;

      return (
        isDateInRange &&
        availability.status === 'dispo' &&
        availability.constraint_reason === null
      );
    });

    // Si pas de période de disponibilité, le professeur est disponible, ou alors on vérifie parmis les périodes de disponibilité
    return availabilities.length === 0 || hasAnAvailability;
  } catch (error) {
    console.error('Erreur dans checkTeacherAvailability :', error);
    return false;
  }
};
