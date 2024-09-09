import Logobehance from '~icons/logos/behance.svg';
import Logobitbucket from '~icons/logos/bitbucket.svg';
import Logoblogger from '~icons/logos/blogger.svg';
import Logocodecademy from '~icons/logos/codecademy.svg';
import Logocodepen from '~icons/logos/codepen-icon.svg';
import Logocodersrank from '~icons/logos/codersrank-icon.svg';
import Logocoderwall from '~icons/logos/coderwall.svg';
import Logodeviantart from '~icons/logos/deviantart-icon.svg';
import Logodiscord from '~icons/logos/discord-icon.svg';
import Logodisqus from '~icons/logos/disqus.svg';
import Logodribbble from '~icons/logos/dribbble-icon.svg';
import Logofacebook from '~icons/logos/facebook.svg';
import Logoflickr from '~icons/logos/flickr-icon.svg';
import Logogithub from '~icons/logos/github-icon.svg';
import Logogitlab from '~icons/logos/gitlab.svg';
import Logogradle from '~icons/logos/gradle.svg';
import Logogravatar from '~icons/logos/gravatar-icon.svg';
import Logohashnode from '~icons/logos/hashnode-icon.svg';
import Logoifttt from '~icons/logos/ifttt.svg';
import Logoinstagram from '~icons/logos/instagram-icon.svg';
import Logolastfm from '~icons/logos/lastfm.svg';
import Logolinkedin from '~icons/logos/linkedin-icon.svg';
import Logomedium from '~icons/logos/medium-icon.svg';
import Logonpm from '~icons/logos/npm-icon.svg';
import Logoopensource from '~icons/logos/opensource.svg';
import Logopatreon from '~icons/logos/patreon.svg';
import Logoperiscope from '~icons/logos/periscope.svg';
import Logoproducthunt from '~icons/logos/producthunt.svg';
import Logopypi from '~icons/logos/pypi.svg';
import Logoreddit from '~icons/logos/reddit-icon.svg';
import Logorubygems from '~icons/logos/rubygems.svg';
import Logoscribd from '~icons/logos/scribd-icon.svg';
import Logosignal from '~icons/logos/signal.svg';
import Logoslack from '~icons/logos/slack-icon.svg';
import Logoslides from '~icons/logos/slides.svg';
import Logosoundcloud from '~icons/logos/soundcloud.svg';
import Logospotify from '~icons/logos/spotify-icon.svg';
import Logotelegram from '~icons/logos/telegram.svg';
import Logotrello from '~icons/logos/trello.svg';
import Logotwitch from '~icons/logos/twitch.svg';
import Logotwitter from '~icons/logos/twitter.svg';
import Logovimeo from '~icons/logos/vimeo-icon.svg';
import Logowakatime from '~icons/logos/wakatime.svg';
import Logoweebly from '~icons/logos/weebly.svg';
import Logowix from '~icons/logos/wix.svg';
import Logowordpress from '~icons/logos/wordpress-icon.svg';
import Logoyoutube from '~icons/logos/youtube-icon.svg';

export const socials = {
  behance: {
    name: 'Behance',
    url: 'https://www.behance.net/{}',
    urlMain: 'https://www.behance.net/',
    regex: new RegExp('https://behance.net/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'behance',
    icon: Logobehance,
  },
  bitbucket: {
    name: 'BitBucket',
    url: 'https://bitbucket.org/{}/',
    urlMain: 'https://bitbucket.org/',
    regex: new RegExp('https://bitbucket.org/([a-zA-Z0-9-_]{1,30})/'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z0-9-_]{1,30}$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'bitbucket',
    icon: Logobitbucket,
  },
  blogger: {
    name: 'Blogger',
    url: 'https://{}.blogspot.com',
    urlMain: 'https://www.blogger.com/',
    regex: new RegExp('https://([a-zA-Z][a-zA-Z0-9_-]*).blogspot.com'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'blogger',
    icon: Logoblogger,
  },
  codecademy: {
    name: 'Codecademy',
    url: 'https://www.codecademy.com/profiles/{}',
    urlMain: 'https://www.codecademy.com/',
    regex: new RegExp('https://codecademy.com/profiles/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'codecademy',
    icon: Logocodecademy,
  },
  codepen: {
    name: 'Codepen',
    url: 'https://codepen.io/{}',
    urlMain: 'https://codepen.io/',
    regex: new RegExp('https://codepen.io/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'codepen-icon',
    icon: Logocodepen,
  },
  codersrank: {
    name: 'Coders Rank',
    url: 'https://profile.codersrank.io/user/{}/',
    urlMain: 'https://codersrank.io/',
    regex: new RegExp(
      'https://profile.codersrank.io/user/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/',
    ),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'codersrank-icon',
    icon: Logocodersrank,
  },
  coderwall: {
    name: 'Coderwall',
    url: 'https://coderwall.com/{}',
    urlMain: 'https://coderwall.com',
    regex: new RegExp('https://coderwall.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'coderwall',
    icon: Logocoderwall,
  },
  deviantart: {
    name: 'DeviantART',
    url: 'https://{}.deviantart.com',
    urlMain: 'https://deviantart.com',
    regex: new RegExp('https://([a-zA-Z][a-zA-Z0-9_-]*).deviantart.com'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'deviantart-icon',
    icon: Logodeviantart,
  },
  discord: {
    name: 'Discord',
    url: 'https://discord.com',
    urlMain: 'https://discord.com/',
    regex: new RegExp('https://discord.com'),
    usernameIsValid: () => true,
    iconName: 'discord-icon',
    icon: Logodiscord,
  },
  disqus: {
    name: 'Disqus',
    url: 'https://disqus.com/{}',
    urlMain: 'https://disqus.com/',
    regex: new RegExp('https://disqus.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'disqus',
    icon: Logodisqus,
  },
  dribbble: {
    name: 'Dribbble',
    url: 'https://dribbble.com/{}',
    urlMain: 'https://dribbble.com/',
    regex: new RegExp('https://dribbble.com/([a-zA-Z][a-zA-Z0-9_-]*)'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'dribbble-icon',
    icon: Logodribbble,
  },
  flickr: {
    name: 'Flickr',
    url: 'https://www.flickr.com/people/{}',
    urlMain: 'https://www.flickr.com/',
    regex: new RegExp('https://flickr.com/people/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'flickr-icon',
    icon: Logoflickr,
  },
  github: {
    name: 'GitHub',
    url: 'https://www.github.com/{}',
    urlMain: 'https://www.github.com/',
    regex: new RegExp('https://github.com/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'github-icon',
    icon: Logogithub,
  },
  gitlab: {
    name: 'GitLab',
    url: 'https://gitlab.com/{}',
    urlMain: 'https://gitlab.com/',
    regex: new RegExp('https://gitlab.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'gitlab',
    icon: Logogitlab,
  },
  gradle: {
    name: 'Gradle',
    url: 'https://plugins.gradle.org/u/{}',
    urlMain: 'https://gradle.org/',
    regex: new RegExp('https://plugins.gradle.org/u/((?!-)[a-zA-Z0-9-]{3,}(?<!-))'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^(?!-)[a-zA-Z0-9-]{3,}(?<!-)$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'gradle',
    icon: Logogradle,
  },
  gravatar: {
    name: 'Gravatar',
    url: 'http://en.gravatar.com/{}',
    urlMain: 'http://en.gravatar.com/',
    regex: new RegExp('http://en.gravatar.com/(((?!\\.).)*)'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^((?!\\.).)*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'gravatar-icon',
    icon: Logogravatar,
  },
  hashnode: {
    name: 'Hashnode',
    url: 'https://hashnode.com/@{}',
    urlMain: 'https://hashnode.com',
    regex: new RegExp('https://hashnode.com/@([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'hashnode-icon',
    icon: Logohashnode,
  },
  ifttt: {
    name: 'IFTTT',
    url: 'https://www.ifttt.com/p/{}',
    urlMain: 'https://www.ifttt.com/',
    regex: new RegExp('https://ifttt.com/p/([A-Za-z0-9]{3,35})'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[A-Za-z0-9]{3,35}$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'ifttt',
    icon: Logoifttt,
  },
  instagram: {
    name: 'Instagram',
    url: 'https://instagram.com/{}',
    urlMain: 'https://instagram.com/',
    regex: new RegExp('https://instagram.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'instagram-icon',
    icon: Logoinstagram,
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/{}',
    urlMain: 'https://linkedin.com',
    regex: new RegExp('https://linkedin.com/in/([\\w._-]+)'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[\\w._-]+$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'linkedin-icon',
    icon: Logolinkedin,
  },
  medium: {
    name: 'Medium',
    url: 'https://medium.com/@{}',
    urlMain: 'https://medium.com/',
    regex: new RegExp('https://medium.com/@([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'medium-icon',
    icon: Logomedium,
  },
  opensource: {
    name: 'Opensource',
    url: 'https://opensource.com/users/{}',
    urlMain: 'https://opensource.com/',
    regex: new RegExp('https://opensource.com/users/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'opensource',
    icon: Logoopensource,
  },
  patreon: {
    name: 'Patreon',
    url: 'https://www.patreon.com/{}',
    urlMain: 'https://www.patreon.com/',
    regex: new RegExp('https://patreon.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'patreon',
    icon: Logopatreon,
  },
  periscope: {
    name: 'Periscope',
    url: 'https://www.periscope.tv/{}/',
    urlMain: 'https://www.periscope.tv/',
    regex: new RegExp('https://periscope.tv/([\\w_.-]+)/'),
    usernameIsValid: () => true,
    iconName: 'periscope',
    icon: Logoperiscope,
  },
  producthunt: {
    name: 'ProductHunt',
    url: 'https://www.producthunt.com/@{}',
    urlMain: 'https://www.producthunt.com/',
    regex: new RegExp('https://producthunt.com/@([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'producthunt',
    icon: Logoproducthunt,
  },
  pypi: {
    name: 'PyPi',
    url: 'https://pypi.org/user/{}',
    urlMain: 'https://pypi.org',
    regex: new RegExp('https://pypi.org/user/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'pypi',
    icon: Logopypi,
  },
  reddit: {
    name: 'Reddit',
    url: 'https://www.reddit.com/user/{}',
    urlMain: 'https://www.reddit.com/',
    regex: new RegExp('https://reddit.com/user/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'reddit-icon',
    icon: Logoreddit,
  },
  rubygems: {
    name: 'RubyGems',
    url: 'https://rubygems.org/profiles/{}',
    urlMain: 'https://rubygems.org/',
    regex: new RegExp('https://rubygems.org/profiles/([a-zA-Z][a-zA-Z0-9_-]{1,40})'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]{1,40}').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'rubygems',
    icon: Logorubygems,
  },
  scribd: {
    name: 'Scribd',
    url: 'https://www.scribd.com/{}',
    urlMain: 'https://www.scribd.com/',
    regex: new RegExp('https://scribd.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'scribd-icon',
    icon: Logoscribd,
  },
  signal: {
    name: 'Signal',
    url: 'https://community.signalusers.org/u/{}',
    urlMain: 'https://community.signalusers.org',
    regex: new RegExp('https://community.signalusers.org/u/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'signal',
    icon: Logosignal,
  },
  slack: {
    name: 'Slack',
    url: 'https://{}.slack.com',
    urlMain: 'https://slack.com',
    regex: new RegExp('https://([a-zA-Z][a-zA-Z0-9_-]*).slack.com'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'slack-icon',
    icon: Logoslack,
  },
  slides: {
    name: 'Slides',
    url: 'https://slides.com/{}',
    urlMain: 'https://slides.com/',
    regex: new RegExp('https://slides.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'slides',
    icon: Logoslides,
  },
  soundcloud: {
    name: 'SoundCloud',
    url: 'https://soundcloud.com/{}',
    urlMain: 'https://soundcloud.com/',
    regex: new RegExp('https://soundcloud.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'soundcloud',
    icon: Logosoundcloud,
  },
  spotify: {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/{}',
    urlMain: 'https://open.spotify.com/',
    regex: new RegExp('https://open.spotify.com/user/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'spotify-icon',
    icon: Logospotify,
  },
  telegram: {
    name: 'Telegram',
    url: 'https://t.me/{}',
    urlMain: 'https://t.me/',
    regex: new RegExp('https://t.me/(\\w{3,32}[^_])'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^\\w{3,32}[^_]$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'telegram',
    icon: Logotelegram,
  },
  trello: {
    name: 'Trello',
    url: 'https://trello.com/{}',
    urlMain: 'https://trello.com/',
    regex: new RegExp('https://trello.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'trello',
    icon: Logotrello,
  },
  twitch: {
    name: 'Twitch',
    url: 'https://www.twitch.tv/{}',
    urlMain: 'https://www.twitch.tv/',
    regex: new RegExp('https://twitch.tv/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'twitch',
    icon: Logotwitch,
  },
  twitter: {
    name: 'Twitter',
    url: 'https://twitter.com/{}',
    urlMain: 'https://twitter.com/',
    regex: new RegExp('https://twitter.com/(\\w{1,15})'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^\\w{1,15}$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'twitter',
    icon: Logotwitter,
  },
  vimeo: {
    name: 'Vimeo',
    url: 'https://vimeo.com/{}',
    urlMain: 'https://vimeo.com/',
    regex: new RegExp('https://vimeo.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'vimeo-icon',
    icon: Logovimeo,
  },
  weebly: {
    name: 'Weebly',
    url: 'https://{}.weebly.com/',
    urlMain: 'https://weebly.com/',
    regex: new RegExp('https://([\\w_.-]+).weebly.com/'),
    usernameIsValid: () => true,
    iconName: 'weebly',
    icon: Logoweebly,
  },
  wix: {
    name: 'Wix',
    url: 'https://{}.wix.com',
    urlMain: 'https://wix.com/',
    regex: new RegExp('https://([a-zA-Z0-9@_-]).wix.com'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z0-9@_-]$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'wix',
    icon: Logowix,
  },
  wordpress: {
    name: 'WordPress',
    url: 'https://{}.wordpress.com/',
    urlMain: 'https://wordpress.com',
    regex: new RegExp('https://([a-zA-Z][a-zA-Z0-9_-]*).wordpress.com/'),
    usernameIsValid: (username: string) => {
      try {
        new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$').test(username);
      } catch {
        return false;
      }
    },
    iconName: 'wordpress-icon',
    icon: Logowordpress,
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com/@{}',
    urlMain: 'https://www.youtube.com/',
    regex: new RegExp('https://youtube.com/@([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'youtube-icon',
    icon: Logoyoutube,
  },
  lastfm: {
    name: 'last.fm',
    url: 'https://last.fm/user/{}',
    urlMain: 'https://last.fm/',
    regex: new RegExp('https://last.fm/user/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'lastfm',
    icon: Logolastfm,
  },
  npm: {
    name: 'npm',
    url: 'https://www.npmjs.com/~{}',
    urlMain: 'https://www.npmjs.com/',
    regex: new RegExp('https://npmjs.com/~([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'npm-icon',
    icon: Logonpm,
  },
  wakatime: {
    name: 'Wakatime',
    url: 'https://wakatime.com/@{}',
    urlMain: 'https://wakatime.com/',
    regex: new RegExp('https://wakatime.com/@([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'wakatime',
    icon: Logowakatime,
  },
  facebook: {
    name: 'Facebook',
    url: 'https://www.facebook.com/{}',
    urlMain: 'https://facebook.com/',
    regex: new RegExp('https://facebook.com/([\\w_.-]+)'),
    usernameIsValid: () => true,
    iconName: 'facebook',
    icon: Logofacebook,
  },
};
