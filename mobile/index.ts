import "expo-router/entry";
import "./config/Unistyles";
import { Buffer } from "buffer";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/id";
import "dayjs/locale/en";

dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

global.Buffer = global.Buffer || Buffer;
