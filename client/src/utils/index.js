// Get the query params off the window's URL
export const getHashParams = () => {
  const hashParams = {};
  let e;
  const r = /([^&;=]+)=?([^&;]*)/g;
  const q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};

// Format milliseconds into MM:SS
export const formatDuration = millis => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Format milliseconds into X minutes and Y seconds
export const formatDurationForHumans = millis => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes} Mins ${seconds} Secs`;
};

// Get year from YYYY-MM-DD
export const getYear = date => date.split('-')[0];

// Transform Pitch Class Notation to string
export const parsePitchClass = note => {
  let key = note;

  switch (note) {
    case 0:
      key = 'C';
      break;
    case 1:
      key = 'D♭';
      break;
    case 2:
      key = 'D';
      break;
    case 3:
      key = 'E♭';
      break;
    case 4:
      key = 'E';
      break;
    case 5:
      key = 'F';
      break;
    case 6:
      key = 'G♭';
      break;
    case 7:
      key = 'G';
      break;
    case 8:
      key = 'A♭';
      break;
    case 9:
      key = 'A';
      break;
    case 10:
      key = 'B♭';
      break;
    case 11:
      key = 'B';
      break;
    default:
      return null;
  }

  return key;
};

export const formatWithCommas = n =>
  n
    .toFixed(1)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatLargeNumber = n => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e12) return formatWithCommas(+(n / 1e12).toFixed(1)) + 'T';
};

export const formatForSearch = text => {
  return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g, '');
};

export const formatPlaybackTime = milliseconds => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / 1000 / 60) % 60);

  return [minutes.toString().padStart(1, '0'), seconds.toString().padStart(2, '0')].join(':');
};

// Higher-order function for async/await error handling
export const catchErrors = fn =>
  function (...args) {
    return fn(...args).catch(err => {
      console.error(err);
    });
  };

export const hash = string => {
  let hash = 0;
  if (string.length == 0) return hash;
  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

export const hashIndex = (artistId, length) => {
  const hashValueCount = 2 ** 31;
  let minBiasedIndex = hashValueCount - (hashValueCount % length);
  for (let i = 0; ; i++) {
    let hashInput = artistId + ':' + String(i) + ':' + new Date().toISOString().substring(0, 10);
    let hashResult = hash(hashInput);
    if (hashResult > 0 && hashResult < minBiasedIndex) {
      return hashResult % length;
    }
  }
};

export const getStartOfTomorrrowUTC = () => {
  let tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return tomorrow;
};
