import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ConfettiExplosion from 'react-confetti-explosion';
import { ColorExtractor } from 'react-color-extractor';
import ProgressBar from '@ramonak/react-progress-bar';
import { formatForSearch, formatPlaybackTime, catchErrors } from '../utils';
import {
  getAllAlbumsByArtist,
  getAllTracksByAlbum,
  getArtist,
  startPlayback,
  pausePlayback,
  getDatabase,
  setDatabase,
  getUserInfo,
} from '../spotify';

import Loader from './Loader';
import TrackItem from './TrackItem';

import { theme } from '../styles';
import { IconPlay, IconMicrophone, IconReset, IconBack, IconForward, IconPause } from './icons';
import {
  PageContainer,
  BannerHeader,
  NavigationContainer,
  NavButtonContainer,
  ButtonContainer,
  LinkContainer,
  AristContainer,
  ArtworkSmall,
  AlbumArtwork,
  ArtistInfoContainer,
  VerifiedArtistContainer,
  ArtistName,
  ArtistNameLink,
  BodyContainer,
  ContentContainer,
  LeftsideContainer,
  RightsideContainer,
  ActionsContainer,
  SecondaryButton,
  SecondaryButtonDisabled,
  PlayButton,
  GuessContainer,
  GuessInput,
  TracksContainer,
  ArtistCardsContainer,
  ArtistCardContainer,
  ArtistCardArtwork,
  ArtistCardInfo,
  ArtistCardLabel,
  ArtistCardName,
  ContolsBarContainer,
  ContolsBarTop,
  PlaybackBar,
  PlaybackTime,
  PlaybackProgressBarContainer,
} from './cssStyle/Play.styled';
const { colors, fontSizes } = theme;

const PlayV2 = props => {
  const { artistId } = props;
  const timerId = useRef();

  const deviceId = props.location.search.split('=')[1] ?? null;

  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackArtistPictures, setCurrentTrackArtistPictures] = useState({});
  const [gradientColor, setGradientColor] = useState(colors.black);

  const timeLimitsArray = [1500, 2000, 4000, 8000, 16000, 32000];
  const [timeLeft, setTimeLeft] = useState(null);
  const [progressBarPercent, setProgressBarPercent] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [displayedTracks, setDisplayedTracks] = useState(null);
  const [trackIsPlaying, setTrackIsPlaying] = useState(false);
  const [winner, setWinner] = useState(false);
  const [loser, setLoser] = useState(false);

  const [albumGuessed, setAlbumGuessed] = useState(false);
  const [artistsGuessed, setArtistsGuessed] = useState([]);
  const [trackSelectedFromSearch, setTrackSelectedFromSearch] = useState(0);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // fetches user data - can be stored in state from the start (rework)
    const fetchData = async () => {
      const { user } = await getUserInfo();
      setUser(user);
    };
    catchErrors(fetchData());
  }, []);

  useEffect(() => {
    // Checks if guesses >= LIMIT when guesses array updates and sets loss state apporiately
    if (guesses.length >= 5 && !winner) {
      console.log('You lost!');
      setDisplayedTracks([currentTrack]);
      setLoser(true);

      let db = getDatabase();
      db[artistId].losses = db[artistId].losses + 1;
      db[artistId].total_guesses = db[artistId].total_guesses + guesses.length;
      db[artistId].last_5_songs.push(currentTrack);
      if (db[artistId].last_5_songs.length > 5) {
        db[artistId].last_5_songs.pop();
      }
      setDatabase(db);
    }
  }, [guesses]);

  const fetchAllTracks = async items => {
    const allTracks = [];

    for await (const { id, images, name } of items) {
      if (name.toLowerCase().includes('remix') || name.toLowerCase().includes('live')) {
        continue;
      }
      const { data } = await getAllTracksByAlbum(id);
      let additionalTracks = data.items ?? [];
      additionalTracks = additionalTracks.filter(function (el) {
        return !el.name.toLowerCase().includes('remix') && !el.name.toLowerCase().includes('live');
      });
      additionalTracks = additionalTracks.map(obj => ({
        ...obj,
        album: {
          id,
          images,
          name,
        },
      }));

      allTracks.push(...additionalTracks);
    }

    // remove any duplicate song (in the case a track appears as single AND in album)
    return allTracks.reduce((accumulator, current) => {
      if (!accumulator.find(item => item.name === current.name)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
  };

  useEffect(() => {
    // fetches all relevant tracks minus remixes and live renditions
    const fetchData = async () => {
      const { data } = await getAllAlbumsByArtist(artistId);
      const allTracks = await fetchAllTracks(data.items);
      setTracks(allTracks);

      let db = getDatabase();
      const history = db[artistId].last_5_songs ?? [];
      let pickedTrack = null;
      while (!pickedTrack || history.includes(pickedTrack.id)) {
        pickedTrack = allTracks[Math.floor(Math.random() * allTracks.length)];
      }

      pickedTrack.artists.forEach(async e => {
        const { data } = await getArtist(e.id);
        const toAdd = {};
        toAdd[e.id] = data.images[0].url;
        setCurrentTrackArtistPictures(prevState => ({ ...prevState, ...toAdd }));
      });
      setTimeLeft(pickedTrack.duration_ms);
      setCurrentTrack(pickedTrack);
    };

    catchErrors(fetchData());
  }, [artistId]);

  useEffect(() => {
    // gets artist data and set's page name
    const fetchData = async () => {
      const { data } = await getArtist(artistId);
      setArtist(data);
      document.title = `${data?.name} | Heardle`;
      setArtistsGuessed([data.id]);
    };
    catchErrors(fetchData());
  }, [artistId]);

  useEffect(() => {
    // when track is selected, play it
    playSong();
  }, [currentTrack]);

  useEffect(() => {
    // initially sets up the game state
    setWinner(false);
    setLoser(false);
    pausePlayback(deviceId);
    setTimeLeft(null);
    setProgressBarPercent(0);
    setTrackIsPlaying(false);
    setDisplayedTracks(false);
    setGuesses([]);
    for (let i = 0; i < 5; i++) {
      let inputElement = document.getElementById(`guess${i}`);
      if (inputElement) {
        inputElement.setAttribute(
          `style", "background-color: ${colors.darkGrey}; border: 2px solid ${colors.darkGrey}`,
        );
      }
    }
  }, []);

  useEffect(() => {
    if (trackIsPlaying && currentTrack && currentTrack.duration_ms) {
      timerId.current = window.setInterval(() => {
        setTimeLeft(prevProgress => prevProgress - 1000);
      }, 1000);

      return () => {
        clearInterval(timerId.current);
      };
    }
  }, [trackIsPlaying]);

  useEffect(() => {
    if (trackIsPlaying && currentTrack && currentTrack.duration_ms) {
      if (progressBarPercent < 100) {
        let updateProgressPercent = Math.round(
          ((currentTrack.duration_ms - (timeLeft - 1000)) / currentTrack.duration_ms) * 100,
        );
        setProgressBarPercent(updateProgressPercent);
      }

      if (timeLeft === 0 && timerId.current) {
        clearInterval(timerId.current);
        return;
      }
    }
  }, [timeLeft]);

  const displayTracks = text => {
    if (!text) {
      setDisplayedTracks([]);
      return;
    }

    const matchedTracks = tracks.filter(
      function (el) {
        if (this.count < 5 && formatForSearch(el.name).includes(formatForSearch(text))) {
          this.count++;
          return true;
        }
        return false;
      },
      {
        count: 0,
      },
    );

    setDisplayedTracks(matchedTracks);
  };

  const playSong = timeLimit => {
    if (!currentTrack) return;
    if (winner || loser) {
      setTrackIsPlaying(true);
      startPlayback(currentTrack.id, deviceId, currentTrack.duration_ms - timeLeft);
      return;
    }

    setTrackIsPlaying(true);
    startPlayback(currentTrack.id, deviceId);
    setTimeout(function () {
      pausePlayback(deviceId);
      setTrackIsPlaying(false);
      setTimeLeft(currentTrack.duration_ms);
      setProgressBarPercent(0);
    }, timeLimit ?? timeLimitsArray[guesses.length]);
  };

  const checkGuess = track => {
    const currId = guesses.length;
    const inputElement = document.getElementById(`guess${currId}`);
    inputElement.value = track.name;

    if (currId === 0) {
      let db = getDatabase();
      if (!db || db === 'undefined') {
        db = {};
      }

      if (db.hasOwnProperty(artistId)) {
        db[artistId].attempts = db[artistId].attempts + 1;
      } else {
        db[artistId] = {
          attempts: 1,
          wins: 0,
          losses: 0,
          total_guesses: 0,
          id: artistId,
          last_5_songs: [],
        };
      }
      setDatabase(db);
    }

    setDisplayedTracks([]);
    setTrackSelectedFromSearch(0);

    // update guessed ui elements
    if (track.album.name === currentTrack.album.name) {
      setAlbumGuessed(true);
    }

    track.artists.forEach(item => {
      if (item.id !== artistId && currentTrack.artists.filter(e => e.id === item.id).length > 0) {
        setArtistsGuessed(oldGuessed => [...oldGuessed, item.id]);
      }
    });

    if (
      track.name === currentTrack.name ||
      currentTrack.name.toLowerCase().indexOf(track.name) !== -1 ||
      track.name.toLowerCase().indexOf(currentTrack.name) !== -1
    ) {
      // got it! WINNER
      inputElement.setAttribute('style', 'background-color: #1DB954; border: 2px solid #1DB954');
      inputElement.disabled = true;
      setTrackIsPlaying(true);
      startPlayback(currentTrack.id, deviceId);
      setDisplayedTracks([currentTrack]);
      setWinner(true);

      let db = getDatabase();
      db[artistId].wins = db[artistId].wins + 1;
      db[artistId].total_guesses = db[artistId].total_guesses + currId + 1;
      db[artistId].last_5_songs.push(currentTrack.id);
      if (db[artistId].last_5_songs.length > 5) {
        db[artistId].last_5_songs.shift();
      }
      setDatabase(db);
    } else if (track.album?.name === currentTrack.album.name) {
      // same album
      inputElement.setAttribute('style', 'background-color: #f6cd61; border: 2px solid #f6cd61');
      playSong(timeLimitsArray[currId + 1]);
      setGuesses(currGuesses => [...currGuesses, track.name]);
    } else {
      // wrong
      inputElement.setAttribute('style', 'background-color: #69202f; border: 2px solid #69202f');
      playSong(timeLimitsArray[currId + 1]);
      setGuesses(currGuesses => [...currGuesses, track.name]);
    }

    if (currId < 3) {
      const nextInputElement = document.getElementById(`guess${currId + 1}`);
      if (nextInputElement) {
        nextInputElement.focus();
      } else {
        console.log(`guess${currId + 1}`);
      }
    }
  };

  const handleKeyPress = e => {
    if (winner || loser) {
      return;
    }

    if (e.key === 'Control') {
      playSong();
    } else if (e.key === 'Enter') {
      if (trackSelectedFromSearch < displayedTracks.length) {
        checkGuess(displayedTracks[trackSelectedFromSearch]);
      }
    } else if (e.key === 'ArrowUp') {
      setTrackSelectedFromSearch(e => {
        if (e > 0) {
          return e - 1;
        } else {
          return e;
        }
      });
    } else if (e.key === 'ArrowDown') {
      setTrackSelectedFromSearch(e => {
        if (e < 4) {
          return e + 1;
        } else {
          return e;
        }
      });
    }
  };

  const handleUserKeyPress = useCallback((event, gameOver, currTrack, device) => {
    const { key } = event;
    if (gameOver) {
      console.log(key);
      if (key === 'r') {
        window.location.reload();
      } else if (key === 'i') {
        window.open(`https://spotify-profile.herokuapp.com/track/${currTrack.id}`);
      } else if (key === ' ' || key === 'Enter') {
        pausePlayback(device);
        setTrackIsPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', e =>
      handleUserKeyPress(e, winner || loser, currentTrack, deviceId),
    );
    return () => {
      window.removeEventListener('keydown', e =>
        handleUserKeyPress(e, winner || loser, currentTrack, deviceId),
      );
    };
  }, [handleUserKeyPress, winner, loser, currentTrack, deviceId]);

  return (
    <React.Fragment>
      {artist && user ? (
        <PageContainer
          style={{
            backgroundImage: `linear-gradient(${gradientColor}, ${colors.black} 90%)`,
          }}
        >
          {currentTrack && deviceId ? (
            <>
              <BannerHeader>
                <ColorExtractor getColors={colors => setGradientColor(colors[1])}>
                  <img
                    src={currentTrack.album.images[0].url}
                    style={{
                      display: 'none',
                    }}
                  />
                </ColorExtractor>
                <NavigationContainer>
                  <NavButtonContainer>
                    <ButtonContainer
                      onClick={e => window.history.go(-1)}
                      style={{ marginRight: '10px' }}
                    >
                      <IconBack />
                    </ButtonContainer>
                    <ButtonContainer style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                      <IconForward />
                    </ButtonContainer>
                  </NavButtonContainer>
                  <LinkContainer to={'/'}>
                    <img src={user.images[1].url} alt="avatar" />
                  </LinkContainer>
                </NavigationContainer>
                <AristContainer>
                  <AlbumArtwork>
                    {albumGuessed ? (
                      <img src={currentTrack.album.images[1].url} alt="Album Artwork" />
                    ) : (
                      <img
                        src={
                          'https://media.pitchfork.com/photos/5a78bdf7aa1f611d13c97b96/master/pass/SpotifyCredits.jpg'
                        }
                        alt="Unkown Artwork"
                      />
                    )}
                  </AlbumArtwork>
                  <ArtistInfoContainer>
                    <VerifiedArtistContainer>
                      <div style={{ margin: 'auto 6px', fontWeight: 600, fontSize: fontSizes.sm }}>
                        Album
                      </div>
                    </VerifiedArtistContainer>
                    <ArtistName
                      href={albumGuessed ? `https://open.spotify.com/album/${currentTrack.album.id}` : null}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {albumGuessed ? currentTrack.album.name ?? '' : '???'}
                    </ArtistName>
                    <div
                      style={{
                        paddingBottom: '10px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      {winner && (
                        <ConfettiExplosion
                          duration={5000}
                          particleCount={200}
                          onComplete={e => console.log('DONE!')}
                        />
                      )}
                      <ArtworkSmall style={{ width: '20px', height: '20px', marginRight: '10px' }}>
                        <img
                          style={{ width: '20px', height: '20px' }}
                          src={artist.images[1].url}
                          alt="Artist Artwork"
                        />
                      </ArtworkSmall>
                      <ArtistNameLink to={`/artist/${artistId}`}>{artist.name}</ArtistNameLink>
                    </div>
                  </ArtistInfoContainer>
                </AristContainer>
              </BannerHeader>
              <BodyContainer>
                <ActionsContainer>
                  <ContolsBarContainer>
                    <ContolsBarTop>
                      {winner || loser ? (
                        <SecondaryButton to={`/track/${currentTrack.id}`}>
                          <IconMicrophone />
                        </SecondaryButton>
                      ) : (
                        <SecondaryButtonDisabled>
                          <IconMicrophone />
                        </SecondaryButtonDisabled>
                      )}
                      <PlayButton onClick={e => playSong()}>
                        {trackIsPlaying ? <IconPause /> : <IconPlay />}
                      </PlayButton>

                      {winner || loser ? (
                        <SecondaryButton
                          to={`/play/artist/${artistId}?device_id=${deviceId}`}
                          onClick={() => window.location.reload()}
                        >
                          <IconReset />
                        </SecondaryButton>
                      ) : (
                        <SecondaryButtonDisabled>
                          <IconReset />
                        </SecondaryButtonDisabled>
                      )}
                    </ContolsBarTop>
                    <PlaybackBar>
                      <PlaybackTime>
                        {timeLeft
                          ? formatPlaybackTime(currentTrack.duration_ms - timeLeft)
                          : '0:00'}
                      </PlaybackTime>
                      <PlaybackProgressBarContainer>
                        <ProgressBar
                          completed={progressBarPercent ? progressBarPercent : 0}
                          baseBgColor="hsla(0,0%,100%,.3)"
                          bgColor="#fff"
                          height="4px"
                          width="280px"
                        />
                      </PlaybackProgressBarContainer>
                      <PlaybackTime>
                        {winner || loser ? formatPlaybackTime(currentTrack.duration_ms) : '?:??'}
                      </PlaybackTime>
                    </PlaybackBar>
                  </ContolsBarContainer>
                </ActionsContainer>
                <ContentContainer>
                  <LeftsideContainer>
                    <GuessContainer>
                      <GuessInput
                        id="guess0"
                        key="guess0"
                        autoComplete="off"
                        placeholder="Type your guess..."
                        onChange={e => displayTracks(e.target.value.toLowerCase())}
                        onKeyUp={handleKeyPress}
                        disabled={guesses.length > 0}
                        autoFocus={guesses.length === 0}
                      />
                      <GuessInput
                        id="guess1"
                        key="guess1"
                        autoComplete="off"
                        placeholder="Type your guess..."
                        onChange={e => displayTracks(e.target.value.toLowerCase())}
                        onKeyUp={handleKeyPress}
                        disabled={guesses.length > 1}
                        style={{ display: guesses.length < 1 ? 'none' : null }}
                        autoFocus={guesses.length === 1}
                      />
                      <GuessInput
                        id="guess2"
                        key="guess2"
                        autoComplete="off"
                        placeholder="Type your guess..."
                        onChange={e => displayTracks(e.target.value.toLowerCase())}
                        onKeyUp={handleKeyPress}
                        disabled={guesses.length > 2}
                        style={{ display: guesses.length < 2 ? 'none' : null }}
                        autoFocus={guesses.length === 2}
                      />
                      <GuessInput
                        id="guess3"
                        key="guess3"
                        autoComplete="off"
                        placeholder="Type your guess..."
                        onChange={e => displayTracks(e.target.value.toLowerCase())}
                        onKeyUp={handleKeyPress}
                        disabled={guesses.length > 3}
                        style={{ display: guesses.length < 3 ? 'none' : null }}
                        autoFocus={guesses.length === 3}
                      />
                      <GuessInput
                        id="guess4"
                        key="guess4"
                        autoComplete="off"
                        placeholder="Type your guess..."
                        onChange={e => displayTracks(e.target.value.toLowerCase())}
                        onKeyUp={handleKeyPress}
                        disabled={guesses.length > 4}
                        style={{ display: guesses.length < 4 ? 'none' : null }}
                        autoFocus={guesses.length === 4}
                      />
                    </GuessContainer>
                    <TracksContainer>
                      {displayedTracks
                        ? displayedTracks.map((track, i) => (
                            <TrackItem
                              track={track}
                              onClick={e => {
                                if (!winner && !loser) {
                                  checkGuess(track);
                                }
                              }}
                              selected={trackSelectedFromSearch === i}
                              key={i}
                            />
                          ))
                        : null}
                    </TracksContainer>
                  </LeftsideContainer>
                  <RightsideContainer style={{ margin: 0, paddingTop: 0 }}>
                    <ArtistCardsContainer>
                      <ArtistCardContainer
                        id={`ArtistCardContainer${-1}`}
                        key={`ArtistCardContainer${-1}`}
                      >
                        <ArtistCardArtwork>
                          <img src={artist.images[0].url} alt="Artist Artwork" />
                        </ArtistCardArtwork>
                        <ArtistCardInfo>
                          <ArtistCardLabel>Artist</ArtistCardLabel>
                          <ArtistCardName>{artist.name}</ArtistCardName>
                        </ArtistCardInfo>
                      </ArtistCardContainer>
                      {currentTrack.artists?.map((item, i) =>
                        item.id !== artistId ? (
                          <ArtistCardContainer
                            id={`ArtistCardContainer${i}`}
                            key={`ArtistCardContainer${i}`}
                          >
                            <ArtistCardArtwork>
                              {artistsGuessed.includes(item.id) ? (
                                <img
                                  src={
                                    currentTrackArtistPictures[item.id] ??
                                    'https://i.pinimg.com/474x/f1/da/a7/f1daa70c9e3343cebd66ac2342d5be3f.jpg'
                                  }
                                  alt="Artist Artwork"
                                />
                              ) : (
                                <img
                                  src={
                                    'https://i.pinimg.com/736x/fd/b6/de/fdb6dea1b13458837c6e56361d2c2771.jpg'
                                  }
                                  alt="Artist Artwork"
                                />
                              )}
                            </ArtistCardArtwork>
                            <ArtistCardInfo>
                              <ArtistCardLabel>Artist</ArtistCardLabel>
                              <ArtistCardName>
                                {artistsGuessed.includes(item.id) ? item.name : '???'}
                              </ArtistCardName>
                            </ArtistCardInfo>
                          </ArtistCardContainer>
                        ) : null,
                      )}
                    </ArtistCardsContainer>
                  </RightsideContainer>
                </ContentContainer>
              </BodyContainer>
            </>
          ) : (
            <Loader />
          )}
        </PageContainer>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

PlayV2.propTypes = {
  artistId: PropTypes.string,
};

export default PlayV2;
