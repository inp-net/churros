import { Capacitor } from '@capacitor/core';

/** Get the enum value for a native built-in icon of the current platform. Returns undefined on web. */
export function nativeIcon<Name extends IsomorphicallyValidIconName>(
  name: Name,
):
  | (typeof NATIVE_ICONS)[Name]['android']['value']
  | (typeof NATIVE_ICONS)[Name]['ios']['value']
  | undefined {
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  if (platform === 'web') return undefined;
  return NATIVE_ICONS[name][platform].value;
}

// Type for icon names that have a non-null android variant
type IsomorphicallyValidIconName = {
  [K in keyof typeof NATIVE_ICONS]: (typeof NATIVE_ICONS)[K]['android'] extends null ? never : K;
}[keyof typeof NATIVE_ICONS];

/** Maps a friendly icon name to its constant names & values on iOS and Android
 *
 * @see https://stuff.mit.edu/afs/sipb/project/android/docs///reference/android/R.drawable.html#ic_menu_search
 * @see https://developer.android.com/reference/android/R.drawable#alert_dark_frame
 * @see https://developer.apple.com/documentation/uikit/uiapplicationshortcuticon/icontype
 */
export const NATIVE_ICONS = {
  /** An icon for a quick action that lets a user compose new content. */
  compose: {
    ios: {
      name: 'compose',
      value: 0,
    },
    android: null, //TODO
  },
  /** An icon for a quick action that plays media. */
  play: {
    ios: {
      name: 'play',
      value: 1,
    },
    android: {
      name: 'ic_media_play',
      value: 17_301_540,
    },
  },
  /** An icon for a quick action that pauses media playback. */
  pause: {
    ios: {
      name: 'pause',
      value: 2,
    },
    android: {
      name: 'ic_media_pause',
      value: 17_301_539,
    },
  },
  /** An icon for a quick action that adds an item. */
  add: {
    ios: {
      name: 'add',
      value: 3,
    },
    android: {
      name: 'ic_menu_add',
      value: 17_301_555,
    },
  },
  /** An icon for a quick action that accesses the user’s current location. */
  location: {
    ios: {
      name: 'location',
      value: 4,
    },
    android: {
      name: 'ic_menu_mylocation',
      value: 17_301_575,
    },
  },
  /** An icon a quick action that offers search. */
  search: {
    ios: {
      name: 'search',
      value: 5,
    },
    android: {
      name: 'ic_menu_search',
      value: 17_301_583,
    },
  },
  /** An icon for a quick action that offers content sharing. */
  share: {
    ios: {
      name: 'share',
      value: 6,
    },
    android: {
      name: 'ic_menu_share',
      value: 17_301_586,
    },
  },
  /** An icon for a quick action that disallows something. */
  prohibit: {
    ios: {
      name: 'prohibit',
      value: 7,
    },
    android: {
      name: 'ic_menu_close_clear_cancel',
      value: 17_301_560,
    },
  },
  /** An icon for a quick action that chooses a generic contact. */
  contact: {
    ios: {
      name: 'contact',
      value: 8,
    },
    android: {
      name: 'sym_contact_card',
      value: 17_301_652,
    },
  },
  /** An icon for a quick action that indicates home. */
  home: {
    ios: {
      name: 'home',
      value: 9,
    },
    android: null,
  },
  /** An icon for a quick action that lets a user mark a location. */
  markLocation: {
    ios: {
      name: 'markLocation',
      value: 10,
    },
    android: {
      name: 'ic_menu_mapmode',
      value: 17_301_571,
    },
  },
  /** An icon for a quick action that lets a user designate a favorite item. */
  favorite: {
    ios: {
      name: 'favorite',
      value: 11,
    },
    android: {
      name: 'star_off',
      value: 17_301_621,
    },
  },
  /** An icon for a quick action that lets a user designate a loved item. */
  love: {
    ios: {
      name: 'love',
      value: 12,
    },
    android: null,
  },
  /** An icon for a quick action that offers cloud access. */
  cloud: {
    ios: {
      name: 'cloud',
      value: 13,
    },
    android: null,
  },
  /** An icon for a quick action that indicates an invitation. */
  invitation: {
    ios: {
      name: 'invitation',
      value: 14,
    },
    android: null,
  },
  /** An icon for a quick action that indicates confirmation. */
  confirmation: {
    ios: {
      name: 'confirmation',
      value: 15,
    },
    android: null,
  },
  /** An icon for a quick action that offers use of mail. */
  mail: {
    ios: {
      name: 'mail',
      value: 16,
    },
    android: {
      name: 'ic_dialog_email',
      value: 17_301_545,
    },
  },
  /** An icon for a quick action that offers use of messaging. */
  message: {
    ios: {
      name: 'message',
      value: 17,
    },
    android: {
      name: 'ic_menu_send',
      value: 17_301_584,
    },
  },
  /** An icon for a quick action that offers use of a calendar. */
  date: {
    ios: {
      name: 'date',
      value: 18,
    },
    android: {
      name: 'ic_menu_month',
      value: 17_301_573,
    },
  },
  /** An icon for a quick action that offers use of a clock or timer. */
  time: {
    ios: {
      name: 'time',
      value: 19,
    },
    android: {
      name: 'ic_menu_recent_history',
      value: 17_301_578,
    },
  },
  /** An icon for a quick action that offers photo capture. */
  capturePhoto: {
    ios: {
      name: 'capturePhoto',
      value: 20,
    },
    android: {
      name: 'ic_menu_camera',
      value: 17_301_559,
    },
  },
  /** An icon for a quick action that offers video capture. */
  captureVideo: {
    ios: {
      name: 'captureVideo',
      value: 21,
    },
    android: {
      name: 'ic_menu_camera',
      value: 17_301_559,
    },
  },
  /** An icon for a quick action that offers task creation. */
  task: {
    ios: {
      name: 'task',
      value: 22,
    },
    android: {
      name: 'ic_menu_mycalendar',
      value: 17_301_574,
    },
  },
  /** An icon for a quick action that offers task completion. */
  taskCompleted: {
    ios: {
      name: 'taskCompleted',
      value: 23,
    },
    android: null,
  },
  /** An icon for a quick action that offers creation of an alarm. */
  alarm: {
    ios: {
      name: 'alarm',
      value: 24,
    },
    android: {
      name: 'ic_menu_lock_idle_alarm',
      value: 17_301_550,
    },
  },
  /** An icon for a quick action that offers creation of a bookmark. */
  bookmark: {
    ios: {
      name: 'bookmark',
      value: 25,
    },
    android: null,
  },
  /** An icon for a quick action that offers shuffle mode. */
  shuffle: {
    ios: {
      name: 'shuffle',
      value: 26,
    },
    android: null,
  },
  /** An icon for a quick action that offers use of audio. */
  audio: {
    ios: {
      name: 'audio',
      value: 27,
    },
    android: null,
  },
  /** An icon for a quick action that offers updating. */
  update: {
    ios: {
      name: 'update',
      value: 28,
    },
    android: null,
  },
} as const;
