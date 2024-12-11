import { supabase } from '../../supabaseClient';

export const findAvailableEntities = async (table, entityColumn, date, start_time, end_time) => {
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

    if (availableError) {
      console.error(`Erreur lors de la récupération des entités disponibles dans ${table} :`, availableError);
      return [];
    }

    return availableEntities;
  } catch (error) {
    console.error('Erreur interne dans findAvailableEntities :', error);
    return [];
  }
};
