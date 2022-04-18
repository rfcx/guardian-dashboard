# Guardian Dashboard Release Notes

## 0.0.10 (2022-04-18)

* **bug:** Use investigated time in response labels
* **bug:** Fixed an issue with displaying coordinates of one point
* **bug:** Fixed an issue with a width of the player row
* **bug:** UX of language switcher is improved ([#140](https://github.com/rfcx/guardian-dashboard/issues/140))

## 0.0.9 (2022-03-28)

* **feature:** Support Indonesian language ([#121](https://github.com/rfcx/guardian-dashboard/issues/121))
* **bug:** Fixed text in the events summary lable ([#127](https://github.com/rfcx/guardian-dashboard/issues/127))

## 0.0.8 (2022-03-06)

* **feature:** Timezone abbreviation is displayed ([#110](https://github.com/rfcx/guardian-dashboard/issues/110))
* **bug:** Do not include closed incidents on the load more incidents if the checkbox is not selected ([#110](https://github.com/rfcx/guardian-dashboard/issues/110))
* **bug:** Return the audio player to the initial state once the audio is ended

## 0.0.7 (2022-02-21)

* **feature:** Guardian type is displayed 
* **feature:** The ability to see more than 3 incidents is added ([#97](https://github.com/rfcx/guardian-dashboard/issues/97))
* **bug:** Fixed the issue for the RFCx icon in the Safari browser ([#50](https://github.com/rfcx/guardian-dashboard/issues/50))

## 0.0.6 (2022-02-04)

* **feature:** The UI logic is updated on the Incident page ([#71](https://github.com/rfcx/guardian-dashboard/issues/71))

## 0.0.5 (2022-01-13)

* **feature:** Display a list of all accessible guardians grouped by guardian on the Home page ([#54](https://github.com/rfcx/guardian-dashboard/issues/54))
* **feature:** Include closed incidents logic is separated ([#47](https://github.com/rfcx/guardian-dashboard/issues/47))
* **feature:** Display a list grouped by guardian on the Incidents page ([#47](https://github.com/rfcx/guardian-dashboard/issues/47))
* **feature:** There are new filters on the Icidents page ([#39](https://github.com/rfcx/guardian-dashboard/issues/39))
* **bug:** Fixed favicon issue on the Guardian Dashboard ([#44](https://github.com/rfcx/guardian-dashboard/issues/44))
* **bug:** Use a new guardians with incidents endpoint ([#53](https://github.com/rfcx/guardian-dashboard/issues/53))

## 0.0.4 (2021-12-23)

* **bug:** Fixed the issue with the mobile menu ([#43](https://github.com/rfcx/guardian-dashboard/issues/43))
* **bug:** Do not display the navbar menu icon on the left for not logged in users ([#43](https://github.com/rfcx/guardian-dashboard/issues/43))
* **bug:** Pages' margins are updated for the mobile/tablet sizes ([#43](https://github.com/rfcx/guardian-dashboard/issues/43))

## 0.0.4 (2021-12-?)

* **feature:** Labels are added to response time ([#32](https://github.com/rfcx/guardian-dashboard/issues/32))
* **bug:** Pagination shows all pages while there are 5 pages ([#37](https://github.com/rfcx/guardian-dashboard/issues/37))

## 0.0.3 (2021-12-??)

* **bug:** Fixed the playing audio functionality in Safari ([CE-1553](https://jira.rfcx.org/browse/CE-1553))
* **feature:** Display the `immediate` label if the difference of calculation time to receive less than 60s ([#25](https://github.com/rfcx/guardian-dashboard/issues/25))
* **bug:** Show email when firstname and lastname are not defined ([#28](https://github.com/rfcx/guardian-dashboard/issues/28))

## 0.0.2 (2021-11-30)

* **feature:** Pagination is added to the homepage ([CE-1569](https://jira.rfcx.org/browse/CE-1569))
* **feature:** Resolution time is added to closed reports ([CE-1572](https://jira.rfcx.org/browse/CE-1572))
* **feature:** The response time calculation logic is updated ([CE-1570](https://jira.rfcx.org/browse/CE-1570))
* **bug:** The response time is calculated using the first event start time ([CE-1571](https://jira.rfcx.org/browse/CE-1571))
* **bug:** Display message if the user has not the access to the page ([CE-1551](https://jira.rfcx.org/browse/CE-1551))
* **bug:** Display spinner in the stream name area ([CE-1551](https://jira.rfcx.org/browse/CE-1551))

## 0.0.1 (2021-10-24)

* **bug:** Response assets are loaded only when user opens them ([CE-1515](https://jira.rfcx.org/browse/CE-1515))
* **bug:** Fixed the datetime format on the incident page for event start/end time ([CE-1516](https://jira.rfcx.org/browse/CE-1516))
* **feature:** The title is added to homepage for non-authenticated state ([CE-1501](https://jira.rfcx.org/browse/CE-1501))
* **feature:** Pagination is added to the Incidents page ([CE-1499](https://jira.rfcx.org/browse/CE-1499))
* **feature:** Homepage updates ([CE-1477](https://jira.rfcx.org/browse/CE-1477))
* **setup:** Setup search and scroll functionality to the Projects list ([CE-1474](https://jira.rfcx.org/browse/CE-1474))
* **feature:** User is able to download Response assets ([CE-1489](https://jira.rfcx.org/browse/CE-1489))
* **setup:** Fixed the player title label. Fixed the alignment of the navbar items ([CE-1480](https://jira.rfcx.org/browse/CE-1480))
* **feature:** User is able to close the incident ([CE-1482](https://jira.rfcx.org/browse/CE-1482))
* **bug:** Fixed the player title label. Fixed the alignment of the navbar items ([CE-1480](https://jira.rfcx.org/browse/CE-1480))
* **setup:** Updated the logic to return the dates difference into the dates util ([CE-1475](https://jira.rfcx.org/browse/CE-1475))
* **setup:** Interfaces are added to all responses types ([CE-1476](https://jira.rfcx.org/browse/CE-1476))
* **setup:** Display three events in the list of incidents([CE-1448](https://jira.rfcx.org/browse/CE-1448))
* **setup:** The Ranger Track modal window is created ([CE-1446](https://jira.rfcx.org/browse/CE-1446))
* **setup:** Implement UI for incidents and incident detail pages ([CE-1429](https://jira.rfcx.org/browse/CE-1429))
* **setup:** Create mockup of Incident Center homepage in HTML/WindiCSS ([CE-1363](https://jira.rfcx.org/browse/CE-1261))
