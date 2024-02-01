import { getDatabase, setDatabase } from '../spotify';

export class Database {
  SPOTIFY_USER_ID = 'SPOTIFY_USER_ID';
  ARTISTS = 'ARTISTS';
  ARTIST_ID = 'artist_id';
  STREAK_MODE = 'streak_mode';
  DAILY_MODE = 'daily_mode';

  HISTORY = 'history';
  GAMES_PLAYED = 'games_played';
  GAMES_WON = 'games_won';
  GAMES_LOST = 'games_lost';
  LAST_WIN_DATE = 'last_win_date';
  LAST_COMPLETED_DATE = 'last_completed_date';
  CURRENT_STREAK = 'current_streak';
  MAX_STREAK = 'max_streak';
  GUESS_DIST = 'guess_dist';
  CURRENT_GAME_STATE = 'current_game_state';
  GUESSES_ARRAY = 'guesses_array';

  constructor(user_id) {
    this.db = getDatabase();
    if (!this.db || this.db === 'undefined') {
      this.db = {
        SPOTIFY_USER_ID: user_id,
        ARTISTS: {},
      };
      this.saveDatabase(this.db);
    }

    this.cache_size = 5;
  }

  get database() {
    return this.db;
  }

  get artists() {
    if (this.db.hasOwnProperty(this.ARTISTS)) {
      return this.db[this.ARTISTS];
    }
    return {};
  }

  getDefaultArtistBlob(artist_id) {
    return {
      artist_id: artist_id,
      streak_mode: {
        games_played: 0,
        max_streak: 0,
      },
      daily_mode: {
        games_played: 0,
        games_won: 0,
        history: [],
        last_completed_date: null,
        last_win_date: null,
        current_streak: 0,
        max_streak: 0,
        guess_dist: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        current_game_state: null,
      },
    };
  }

  syncWithCache() {
    this.db = getDatabase();
  }

  saveDatabase() {
    setDatabase(this.db);
  }

  artistExists(artist_id) {
    return this.artists.hasOwnProperty(artist_id);
  }

  getArtistById(artist_id) {
    if (this.artistExists(artist_id)) return this.artists[artist_id];
    return this.getDefaultArtistBlob(artist_id);
  }

  dailyModeCompletedToday(artist_id) {
    if (!this.artistExists(artist_id)) return false;

    return this.isToday(this.getArtistById(artist_id)[this.DAILY_MODE][this.LAST_COMPLETED_DATE]);
  }

  // CREATE METHODS
  createArtist(artist_id) {
    if (this.artistExists(artist_id)) return;

    this.db[this.ARTISTS][artist_id] = this.getDefaultArtistBlob(artist_id);
    this.saveDatabase();
  }

  // DAILY MODE
  updateDailyMode(artist_id, won, track_id, guesses = null) {
    if (!this.artistExists(artist_id)) this.createArtist(artist_id);

    let artist_state = this.getArtistById(artist_id);

    artist_state[this.DAILY_MODE][this.GAMES_PLAYED]++;
    artist_state[this.DAILY_MODE][this.CURRENT_GAME_STATE] = null;
    artist_state[this.DAILY_MODE][this.HISTORY].push(track_id);
    if (artist_state[this.DAILY_MODE][this.HISTORY] > this.cache_size)
      artist_state[this.DAILY_MODE][this.HISTORY].shift();
    if (guesses) artist_state[this.DAILY_MODE][this.GUESS_DIST][guesses]++;
    artist_state[this.DAILY_MODE][this.LAST_COMPLETED_DATE] = new Date();

    if (won) {
      artist_state[this.DAILY_MODE][this.GAMES_WON]++;

      if (this.isYesterday(artist_state[this.DAILY_MODE][this.LAST_WIN_DATE])) {
        artist_state[this.DAILY_MODE][this.CURRENT_STREAK]++;
      } else {
        artist_state[this.DAILY_MODE][this.CURRENT_STREAK] = 1;
      }

      if (
        artist_state[this.DAILY_MODE][this.CURRENT_STREAK] >
        artist_state[this.DAILY_MODE][this.MAX_STREAK]
      ) {
        artist_state[this.DAILY_MODE][this.MAX_STREAK] =
          artist_state[this.DAILY_MODE][this.CURRENT_STREAK];
      }

      artist_state[this.DAILY_MODE][this.LAST_WIN_DATE] = new Date();
    } else {
      artist_state[this.DAILY_MODE][this.CURRENT_STREAK] = 0;
    }

    this.db[this.ARTISTS][artist_id] = artist_state;
    this.saveDatabase();
  }

  saveInProgressDailyMode(artist_id, guesses_array) {
    if (!this.artistExists(artist_id)) this.createArtist(artist_id);

    let artist_state = this.getArtistById(artist_id);
    artist_state[this.DAILY_MODE][this.CURRENT_GAME_STATE] = {
      guesses_array: guesses_array,
    };

    this.db[this.ARTISTS][artist_id] = artist_state;
    this.saveDatabase();
  }

  getInProgressDailyMode(artist_id) {
    if (!this.artistExists(artist_id)) {
      this.createArtist(artist_id);
      return null;
    }

    let artist_state = this.getArtistById(artist_id);
    return artist_state[this.DAILY_MODE][this.CURRENT_GAME_STATE];
  }

  getDailyModeHistory(artist_id) {
    if (!this.artistExists(artist_id)) {
      this.createArtist(artist_id);
      return [];
    }

    let artist_state = this.getArtistById(artist_id);
    return artist_state[this.DAILY_MODE][this.HISTORY];
  }

  getDailyModeGamesPlayed(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    return this.getArtistById(artist_id)[this.DAILY_MODE][this.GAMES_PLAYED];
  }

  getDailyModeWinPercentage(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    const gamesPlayed = this.getArtistById(artist_id)[this.DAILY_MODE][this.GAMES_PLAYED];
    if (gamesPlayed === 0) return 0;

    return (
      100 *
      (this.getArtistById(artist_id)[this.DAILY_MODE][this.GAMES_WON] / gamesPlayed)
    ).toFixed(0);
  }

  getDailyModeCurrentStreak(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    return this.getArtistById(artist_id)[this.DAILY_MODE][this.CURRENT_STREAK];
  }

  getDailyModeLongestStreak(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    return this.getArtistById(artist_id)[this.DAILY_MODE][this.MAX_STREAK];
  }

  // STREAK MODE
  updateStreakMode(artist_id, streak) {
    if (!this.artistExists(artist_id)) this.createArtist(artist_id);

    let artist_state = this.getArtistById(artist_id);

    artist_state[this.STREAK_MODE][this.GAMES_PLAYED]++;
    if (artist_state[this.STREAK_MODE][this.MAX_STREAK] < streak)
      artist_state[this.STREAK_MODE][this.MAX_STREAK] = streak;

    this.db[this.ARTISTS][artist_id] = artist_state;
    this.saveDatabase();
  }

  getStreakModeGamesPlayed(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    return this.getArtistById(artist_id)[this.STREAK_MODE][this.GAMES_PLAYED];
  }

  getStreakModeLongestStreak(artist_id) {
    if (!this.artistExists(artist_id)) return 0;

    return this.getArtistById(artist_id)[this.STREAK_MODE][this.MAX_STREAK];
  }

  // PRIVATE METHODS
  isYesterday(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
      if (!date) {
        return false;
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  isToday(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
      if (!date) {
        return false;
      }
    }

    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
