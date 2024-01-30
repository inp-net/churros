import { writable } from 'svelte/store';

export const colorNames = writable([] as string[]);

export const MODULES_COLORS: Record<string, string> = {
	'bar-weeks': 'pink',
	announcements: 'red',
	changelogs: 'orange',
	comments: 'blue',
	documents: 'blue',
	events: 'cyan',
	gitlab: 'magenta',
	groups: 'orange',
	'health-checks': 'green',
	links: 'orange',
	logs: 'magenta',
	notifications: 'yellow',
	oauth: 'magenta',
	posts: 'green',
	reactions: 'cyan',
	schools: 'red',
	curriculum: 'orange',
	services: 'green',
	'student-associations': 'yellow',
	ticketing: 'pink',
	users: 'blue',
	payments: 'yellow'
};
