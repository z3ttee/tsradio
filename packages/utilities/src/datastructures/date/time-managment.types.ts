import { NGSDayType } from "./enums/day.enum";
import { NGSStandardEventType } from "./enums/event.enum";
import { NGSEventState } from "./enums/eventState.enum";
import { NGSMonthName } from "./enums/months.enum";

export type NGSYear = {
  // 	January
  // 	February
  // March
  // April
  // May
  // June
  // July
  // August
  // September
  // October
  // November
  // December
  months: NGSMonth[];
  year: number;
};
export type NGSMonth = {
  days: NGSDay[];
  name: NGSMonthName | undefined;
  daysBefore: number;
  daysAfter: number;
};

export type NGSDay = {
  events: NGSDayEvent[];
  date?: Date;
  dayType: NGSDayType;
};

export type NGSDayEvent = {
  event: NGSStandardEventType; //oder db entity
  name?: string;
  description?: string;
  customColor?: string;
  eventState?: NGSEventState;
};
