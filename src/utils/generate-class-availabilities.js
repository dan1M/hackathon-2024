import { supabase } from './supabaseClient';

const alternanceCycle = 3;

export const generateClassAvailabilities = async () => {
  const { data: classes, error } = await supabase.from('classes').select();
  if (error) console.error('error', error);

  classes.forEach(async ({ id, name }, index) => {
    let availableWeeks = [];

    for (let i = 1; i <= 52; i++) {
      if ((i + index) % alternanceCycle === 0) {
        availableWeeks.push(i);
      }
    }
    console.log('index', index, 'name', name, 'availableWeeks', availableWeeks);

    const { data, error } = await supabase
      .from('class_availabilities')
      .upsert({ class_id: id, available_weeks: availableWeeks });
    if (error) console.error('error', error);
  });
};
