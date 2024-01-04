import { readFileSync, writeFileSync } from "fs";
import ical, { ICalEventBusyStatus, ICalEventRepeatingFreq } from "ical-generator";

// Aggregated output from facebook graphql BirthdayCometMonthlyBirthdaysRefetchQuery
const file = readFileSync("tmp/data.json", "utf-8");

const parsed = JSON.parse(file);

var users = [];
extractByKey(users, parsed, "__typename", "User");

var birthdates = new Map();

for(const user of users){
    if (!!user.birthdate){
        birthdates.set(user.id, { name: user.name, birthdate: user.birthdate, url: user.profile_url });
    }
}

function extractByKey(out, obj, searchKey, searchVal) {
  for (const key in obj) {
    const val = obj[key];
    if (key.match(searchKey) && (val?.match(searchVal) || false)) {
      out.push(obj);
    } else if (typeof(val) === 'object' && typeof(val?.length) === 'number'){
        for(const iter of val){
            extractByKey(out, iter, searchKey, searchVal)
        }
    }
    else if (typeof(val) === 'object') {
        extractByKey(out, val, searchKey, searchVal)
    }
  }
}

console.log('Birthdates caught: ', birthdates.length);

const tzid = "Europe/Stockholm";

const calendar = ical({ name: "Facebook birthdays", timezone: tzid });

const events = Array.from(birthdates.entries()).map(([userId, bd]) => {
    const month = bd.birthdate.month - 1;
    const day = bd.birthdate.day;

    const ev = ical().createEvent({
        start: new Date(Date.UTC(bd.birthdate.year || new Date().getUTCFullYear(), month, day)),
        allDay: true,
        id: `facebook-userid-${userId}`,
        summary: `🎂 ${bd.name}`,
        busystatus: ICalEventBusyStatus.FREE,
        repeating: {
            freq: ICalEventRepeatingFreq.YEARLY
        },
        url: bd.url,
    })

    return ev;
});

calendar.events(events);

writeFileSync("tmp/out.ical", calendar.toString());