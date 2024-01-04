import { readFileSync } from "fs";

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

console.log(users);
console.log(birthdates);
