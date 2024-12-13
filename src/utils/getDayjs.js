import dayjs from 'dayjs';
import Weekday from 'dayjs/plugin/weekday';
import UTC from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import 'dayjs/locale/fr';

const getDayjs = () => {
  dayjs.locale('fr');
  dayjs.extend(Weekday);
  dayjs.extend(UTC);
  dayjs.extend(weekOfYear);

  return dayjs;
};

export default getDayjs;
