import CalendarEvent = GoogleAppsScript.Calendar.CalendarEvent;

const CALENDARS = [
  {
    name: "Allstars United SC - Brian Duff - 2023-24",
    alias: "Michael",
    warmupDurationMins: 45,
    guests: [
      "nikkiylin@gmail.com",
      "duffm2014@gmail.com"
    ]
  },
  {
    name: "Los Gatos United - Brian Duff - 2023-2024 Season",
    alias: "Caitlin",
    warmupDurationMins: 45,
    guests: [
      "nikkiylin@gmail.com",
      "duffc2012@gmail.com"
    ]
  }
]

// Update these to specify the date range in which to scan for events.
const START_DATE = new Date("2023-08-01T00:00:00");
const END_DATE = new Date("2024-06-01T00:00:00");

/**
 * Determines if a given event is a soccer match. Used to filter out
 * other events (e.g. practices).
 */
function isSoccerGame(event: CalendarEvent) {
  return !event.isAllDayEvent() &&
    !event.getTitle().startsWith("Practice") &&
    event.getDescription().includes("gotsport");
}

function syncEvents() {
  let myCalendar = CalendarApp.getDefaultCalendar();
  let calendars = CalendarApp.getAllCalendars();
  let soccerCalendars = calendars.filter(c => CALENDARS.map(c => c.name).includes(c.getName()));

  // Go through all the events in each soccer calendar, and make sure we have
  // scheduled warmup time prior to all the games.
  let autoEvents = myCalendar.getEvents(START_DATE, END_DATE).filter(e => e.getTag("autoSoccer") !== null);
  console.log("Found myevents: " + autoEvents);

  let autoEventsByEventId = new Map<string, CalendarEvent>();
  for (let event of autoEvents) {
    autoEventsByEventId.set(event.getTag("autoSoccer"), event);
  }

  for (let cn = 0; cn < soccerCalendars.length; cn++) {
    let c = soccerCalendars[cn];

    let calendarConfig = CALENDARS.find(config => config.name == c.getName());

    if (calendarConfig === undefined) {
      console.log("Calendar config not found: " + c.getName());
      continue;
    }

    let events = c.getEvents(START_DATE, END_DATE).filter(e => isSoccerGame(e));

    for (let i = 0; i < events.length; i++) {
      let e = events[i];
      let id = e.getId();
      let startTime = e.getStartTime();
      let endTime = e.getEndTime();
      let expectedWarmupStart = new Date(startTime.getTime() - calendarConfig.warmupDurationMins * 60000);
      let expectedLocation = e.getLocation();
      let expectedGuestList = calendarConfig.guests.join(",");

      let expectedTitle = generateWarmupTitle(calendarConfig.alias, e);
      // Do we already have an autoevent for this? If so, check if it needs to be updated.
      let event = autoEventsByEventId.get(id);
      if (event === undefined) {
        let newEvent = myCalendar.createEvent(expectedTitle, expectedWarmupStart, startTime);
        newEvent.setTag("autoSoccer", e.getId()).setLocation(expectedLocation);
        for (var guest of calendarConfig.guests) {
          newEvent.addGuest(guest);
        }
        console.log("Created new warmup event: " + expectedTitle + " at " + expectedWarmupStart);
      } else {
        // Delete it from the map to indicate that we've processed it.
        autoEventsByEventId.delete(id);
        if (event.getTitle() !== expectedTitle) {
          event.setTitle(expectedTitle);
          console.log("Updated title for event: " + expectedTitle);
        }
        if (event.getStartTime().getTime() !== expectedWarmupStart.getTime()) {
          event.setTime(expectedWarmupStart, startTime);
          console.log("Updated time for event: " + expectedTitle + " on " + event.getStartTime());
        }
        if (event.getLocation() !== expectedLocation) {
          event.setLocation(expectedLocation);
          console.log("Updated location for event: " + expectedTitle + " at " + expectedLocation);
        }
        let guestList = event.getGuestList().map(g => g.getEmail()).join(",");
        if (guestList !== expectedGuestList) {
          for (var g of event.getGuestList()) {
            event.removeGuest(g.getEmail());
          }
          for (var guest of calendarConfig.guests) {
            event.addGuest(guest);
          }
          console.log("Update guest list for event: " + expectedTitle);
        }
      }

      // If we have any items left in autoEventsByEventId, they're zombies that no longer correspond to
      // a game. Delete them.
      for (let [id, event] of autoEventsByEventId) {
        // Sanity check. ONLY delete events that have the autoSoccer tag. We should never encounter
        // this, but let's be extra careful about deleting things on calendars.
        if (event.getTag("autoSoccer") !== null) {
          console.log("WARNING: skipped deleting untagged event: " + event.getTitle());
        } else {
          event.deleteEvent();
          console.log("Deleted event " + event.getTitle() + " because its game no longer exists");
        }
      }
    }
  }

  function generateWarmupTitle(calendarName: string, event: CalendarEvent) {
    return `${calendarName}: Warmup for ${event.getTitle()}`
  }
}


