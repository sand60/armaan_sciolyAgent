// The team's full 2026–2027 competition calendar. Invitationals are optional
// practice; regionals are mandatory and state requires qualification.
export const TEAM_SEASON = [
  {
    id: "battle-of-states",
    name: "Battle of States",
    host: "Virtual — run remotely",
    date: "2026-12-01",
    date_label: "December 2026 – January 2027",
    kind: "Virtual",
    note: "Satellite invitational spread across December and January.",
  },
  {
    id: "sylvania",
    name: "Sylvania Invitational",
    host: "Southview High School",
    date: "2026-12-12",
    kind: "Invitational",
  },
  {
    id: "cobra",
    name: "Cobra Invitational",
    host: "Birmingham Covington School",
    date: "2027-01-23",
    kind: "Invitational",
  },
  {
    id: "umso",
    name: "UMSO Invitational",
    host: "Central Campus",
    date: "2027-02-27",
    kind: "Invitational",
  },
  {
    id: "regionals",
    name: "Regional Tournament",
    host: "North Campus",
    date: "2027-03-20",
    kind: "Regionals",
    mandatory: true,
    note: "Mandatory — regional placement decides state qualification.",
  },
  {
    id: "states",
    name: "State Tournament",
    host: "MSU",
    date: "2027-04-24",
    kind: "State",
    qualified: true,
    note: "Attended only if the team qualifies at regionals.",
  },
];

export const SEASON_NOTE =
  "This is the complete schedule — these tournaments are the only ones the team attends this season.";