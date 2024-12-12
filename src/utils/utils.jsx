import { supabase } from '../../supabaseClient';

export const findAvailableEntities = async (table, entityColumn, date, start_time, end_time, value) => {
  try {
  
    const { data: occupiedEntities, error } = await supabase
      .from('lessons')
      .select(entityColumn)
      .eq('date', date)
      .filter('start_time', 'lt', end_time)
      .filter('end_time', 'gt', start_time);

    if (error) {
      console.error(`Erreur lors de la recherche des entités occupées dans ${table} :`, error);
      return [];
    }

    const occupiedEntityIds = occupiedEntities.map((entity) => entity[entityColumn]);

    const { data: availableEntities, error: availableError } = await supabase
      .from(table)
      .select('*')
      .not('id', 'in', `(${occupiedEntityIds.join(',')})`);
    
      let entities = availableEntities;

      if (entityColumn === 'teacher_id') {
        entities = await Promise.all(
          availableEntities.map(async (entity) => {
            const isAvailable = await checkTeacherAvailability(entity.id, date, start_time, end_time);
            return isAvailable ? entity : null; // Retourne l'entité si disponible, sinon null
          })
        );

        entities = entities.filter((entity) => entity !== null);
  
      }

    console.log(entities)

    if (availableError) {
      console.error(`Erreur lors de la récupération des entités disponibles dans ${table} :`, availableError);
      return [];
    }

    return entities;
  } catch (error) {
    console.error('Erreur interne dans findAvailableEntities :', error);
    return [];
  }
};



  const checkTeacherAvailability = async (teacherId, date, start_time, end_time) => {
    try {
      // Récupérer les périodes de disponibilité du professeur depuis la table teacher_availability
      const { data: availabilities, error } = await supabase
        .from('teacher_availabilities')
        .select()
        .eq('teacher_id', teacherId)
      
      console.log(availabilities)
      if (error) {
        console.error('Erreur lors de la récupération des disponibilités :', error);
        return false;
      }
  
      // Vérifier si la période demandée est couverte par une disponibilité
      const isAvailable = availabilities.filter((i) => i.status ==='dispo').some((availability) => {
        const startDate = new Date(availability.start_date);
        const endDate = new Date(availability.end_date);
        const requestedDate = new Date(date);
  
        // Vérifier si la date demandée est dans la période de disponibilité
        const isDateInRange = requestedDate >= startDate && requestedDate <= endDate;
  
        // Vérifier si l'heure demandée est dans la plage horaire
        const isTimeInRange =
          start_time >= availability.start_date.split('T')[1] && // Heure de début de disponibilité
          end_time <= availability.end_date.split('T')[1]; // Heure de fin de disponibilité
  
        return isDateInRange && isTimeInRange;
      });
      // Vérifier s'il y a des périodes d'indisponibilité
      const isUnavailable = availabilities.filter((i) => i.status !== 'dispo' && i.constraint_reason === null).some((availability) => {
        const startDate = new Date(availability.start_date);
        const endDate = new Date(availability.end_date);
        const requestedDate = new Date(date);

        // Vérifier si la date demandée est dans la période d'indisponibilité
        const isDateInRange = requestedDate >= startDate && requestedDate <= endDate;

        // Vérifier si l'heure demandée est dans la plage horaire d'indisponibilité
        const isTimeInRange =
            start_time >= availability.start_date.split('T')[1] && // Heure de début d'indisponibilité
            end_time <= availability.end_date.split('T')[1]; // Heure de fin d'indisponibilité

        return isDateInRange && isTimeInRange;
      });

      console.log(isAvailable)
      console.log(isUnavailable)
  
      return availabilities.length === 0 || (isAvailable && !isUnavailable);
    } catch (error) {
      console.error('Erreur dans checkTeacherAvailability :', error);
      return false;
    }
  
}