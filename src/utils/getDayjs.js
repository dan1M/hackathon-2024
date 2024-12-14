import dayjs from 'dayjs';
import Weekday from 'dayjs/plugin/weekday';
import UTC from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

import 'dayjs/locale/fr';

const getDayjs = () => {
  dayjs.locale('fr');
  dayjs.extend(Weekday);
  dayjs.extend(UTC);
  dayjs.extend(weekOfYear);
  dayjs.extend(isoWeek);

  return dayjs;
};

export default getDayjs;
