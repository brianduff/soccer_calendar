let SOCCER_CALENDARS = [
  "Allstars United SC - Brian Duff - 2023-24",
  "Los Gatos United - Brian Duff - 2023-2024 Season"
];

let START_DATE = new Date("2023-08-01T00:00:00");
let END_DATE = new Date("2024-06-01T00:00:00");

function myFunction() {
  let myCalendar = CalendarApp.getDefaultCalendar();
  let calendars = CalendarApp.getAllCalendars();
  let soccerCalendars = calendars.filter(c => SOCCER_CALENDARS.includes(c.getName()));

  // Go through all the events in each soccer calendar, and make sure we have
  // scheduled warmup time prior to all the games.

  let myEvents = myCalendar.getEvents(START_DATE, END_DATE).filter(e => e.getTag("autoSoccer") === "true");

  console.log("Found myevents: " + myEvents);



  for (let c of soccerCalendars) {
    let events = c.getEvents(START_DATE, END_DATE).filter(e =>
      !e.isAllDayEvent() && !e.getTitle().startsWith("Practice") && e.getDescription().includes("gotsport"));

    for (let e of events) {
      let startTime = e.getStartTime();
      let endTime = e.getEndTime();

      console.log(c.getName() + ": " + e.getTitle() + " at " + startTime + " until " + endTime);
      console.log(e.getDescription());
    }
  }

}


