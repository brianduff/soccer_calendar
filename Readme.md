# Soccer warmup event creator

This is an Apps Script script that generates Google Calendar events automatically for warmups prior to soccer games.

My kids' soccer teams use gotsport to schedule games, and through byga they already provide a way to sync team event calendars. However, our coaches require us to show up 45 minutes early to games for warmups. In the past, I'd manually create these events in calendar, but games move around a lot, and so I was constantly manually updating them.

Instead, this script looks for calendar events representing soccer games, and then automatically syncs warmup events for each game.

I use the clasp tool from google to upload this script to apps script:
https://developers.google.com/apps-script/guides/clasp
