import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ConfettiExplosion from 'react-confetti-explosion';
import { formatWithCommas, catchErrors } from '../utils';
import {
  getAllAlbumsByArtist,
  getAllTracksByAlbum,
  getArtist,
  startPlayback,
  pausePlayback,
  getAllDevices,
  getDatabase,
  setDatabase,
} from '../spotify';

import Loader from './Loader';
import TrackItem from './TrackItem';

import styled from 'styled-components/macro';
import { theme, mixins, media, Main } from '../styles';
import {
  IconPlay,
  IconMicrophone,
  IconReset,
  IconComputer,
  IconPhone,
  IconSpeaker,
  IconExternal,
} from './icons';
import { Link } from '@reach/router';
const { colors, fontSizes, fonts, spacing } = theme;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;
const Header = styled.div`
  display: grid;
  grid-template-columns:
    4fr 1fr 4fr
    ${media.tablet`
        display: flex;
        flex-direction: column;
        margin-bottom: 6vh;
    `};
  ${media.phablet`
        display: flex;
        flex-direction: column;
        margin-bottom: 6vh;
    `};
`;
const HeaderContainer = styled(Main)`
  ${mixins.flexTop};
  flex-direction: row;
  min-height: 10%;
  ${media.tablet`
        padding: 30px 20px 0px 20px;
        justify-content: center;
    `};
  ${media.phablet`
        padding: 30px 20px 0px 20px;
        justify-content: center;
    `};
`;
const Artwork = styled.div`
  border-radius: 100%;
  img {
    object-fit: cover;
    border-radius: 100%;
    width: 120px;
    height: 120px;
    ${media.tablet`
            width: 60px;
            height: 60px;
        `};
  }
`;
const ArtistName = styled.a`
  display: inline;
  border-bottom: 1px solid transparent;
  font-weight: 500;
  &:hover {
    color: ${colors.green};
  }
  font-size: 50px;
  ${media.tablet`
        font-size: 7vw;
    `};
`;
const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 8px;
  margin-top: ${spacing.sm};
  text-align: center;
`;
const Stat = styled.div`
  margin: auto auto;
`;
const Number = styled.div`
  color: ${colors.blue};
  font-weight: 500;
  font-size: ${fontSizes.sm};
  text-transform: capitalize;
  ${media.tablet`
        font-size: ${fontSizes.sm};
    `};
`;
const Genre = styled.div`
  font-size: ${fontSizes.sm};
`;
const NumLabel = styled.p`
  color: ${colors.lightGrey};
  font-size: ${fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: ${spacing.xs};
`;

const GuessContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;
const GuessInput = styled.input`
  border: 2px solid ${colors.darkGrey};
  position: relative;
  z-index: 1;
  height: 40px;
  border-radius: 25px;
  width: 100%;
  min-width: 300px;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 10px;
  font-family: ${fonts.primary}!important;
  font-size: ${fontSizes.smd};
  background-color: ${colors.darkGrey};
  color: white;
  &:focus {
    border: 2px solid ${colors.white};
  }
  ${media.tablet`
        min-width: 200px;
    `};
  ${media.phablet`
        min-width: 100px;
    `};
`;

const TracksContainer = styled.ul`
  display: flex;
  flex-direction: column;
  width: 500px;
  margin-top: 50px;
  ${media.tablet`
        width: 300px;
    `}
`;

const StartButton = styled.a`
  display: inline-block;
  background-color: ${colors.green};
  color: ${colors.white};
  border-radius: 30px;
  padding: 17px 35px;
  margin: 50px auto;
  min-width: 160px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  &:hover,
  &:focus {
    background-color: ${colors.offGreen};
  }
  &:disabled {
    background-color: ${colors.grey};
  }
`;

const PlayButton = styled.a`
  display: inline-block;
  background-color: ${colors.green};
  color: ${colors.black};
  border-radius: 100%;
  padding: 10px 10px;
  margin: 20px 0;
  width: 70px;
  height: 70px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  justify-content: center;
  &:hover,
  &:focus {
    background-color: ${colors.offGreen};
  }
`;

const SecondaryButton = styled(Link)`
  background-color: ${colors.darkGrey};
  color: ${colors.white};
  border-radius: 100%;
  padding: 10px 10px;
  margin: 0 15px;
  width: 50px;
  height: 50px;
  font-weight: 500;
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: flex-end;
  justify-content: flex-end;
  &:hover,
  &:focus {
    color: ${colors.green};
  }
`;

const DevicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.darkGrey};
  padding: 20px;
  border-radius: 10px;
`;

const DeviceContainer = styled.a`
  display: grid;
  grid-template-columns: 1fr 8fr;
  grid-gap: 15px;
  padding: 18px 10px;
  border-radius: 6px;
  min-width: 300px;
  &:hover {
    background-color: ${colors.grey};
  }
  &:focus {
    background-color: ${colors.green};
  }
`;
const DeviceHelpContainer = styled.a`
  display: grid;
  grid-template-columns: 15fr 1fr;
  grid-gap: 15px;
  padding: 12px 10px;
  border-radius: 6px;
  min-width: 300px;
  &:hover {
    background-color: ${colors.grey};
  }
  &:focus {
    background-color: ${colors.green};
  }
`;
const DeviceName = styled.div`
  font-size: ${fontSizes.smd};
  margin: auto 10px;
`;
const DevicesHeader = styled.a`
  display: inline;
  font-weight: 700;
  font-size: 18px;
  padding: 10px;
  ${media.tablet`
        font-size: 5vw;
    `};
`;

const Play = props => {
  const { artistId } = props;

  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [devicesAvailable, setDevicesAvailable] = useState([]);
  const [statsForArtist, setStatsForArtist] = useState({});

  const timeLimitsArray = [1500, 2000, 4000, 8000, 16000, 32000];
  const [guesses, setGuesses] = useState([]);
  const [displayedTracks, setDisplayedTracks] = useState(null);
  const [trackPlaying, setTrackPlaying] = useState(false);
  const [winner, setWinner] = useState(false);
  const [loser, setLoser] = useState(false);

  useEffect(() => {
    if (guesses.length >= 5 && !winner) {
      console.log('You lost!');
      setDisplayedTracks([currentTrack]);
      setLoser(true);

      let db = getDatabase();
      db[artistId].losses = db[artistId].losses + 1;
      db[artistId].total_guesses = db[artistId].total_guesses + guesses.length;
      setDatabase(db);
    }
  }, [guesses]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getAllAlbumsByArtist(artistId);
      data.items.forEach(async ({ id, images, name }) => {
        if (name.toLowerCase().includes('remix') || name.toLowerCase().includes('live')) {
          return;
        }
        const { data } = await getAllTracksByAlbum(id);
        let additionalTracks = data.items ?? [];
        additionalTracks = additionalTracks.filter(function (el) {
          return !el.name.toLowerCase().includes('remix') && !el.name.toLowerCase().includes('live');
        });
        additionalTracks = additionalTracks.map(obj => ({ ...obj, album: { id, images, name } }));
        setTracks(oldTracks => [...oldTracks, ...additionalTracks]);
      });
    };
    catchErrors(fetchData());
  }, [artistId]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getArtist(artistId);
      setArtist(data);
    };
    catchErrors(fetchData());
  }, [artistId]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getAllDevices();
      setDevicesAvailable(data.devices ?? []);
      if (data.devices.length > 0) {
        setDeviceId(data.devices[0].id);
      }
    };
    catchErrors(fetchData());
  }, []);

  useEffect(() => {
    let db = getDatabase();
    if (!db || db === 'undefined' || !db.hasOwnProperty(artistId)) {
      db = {};
      db[artistId] = {
        attempts: 0,
        wins: 0,
        losses: 0,
        total_guesses: 0,
        id: artistId,
      };
      console.log('!!!', db);
      setStatsForArtist(db[artistId]);
      setDatabase(db);
    } else {
      setStatsForArtist(db[artistId]);
    }
  }, []);

  const startGame = () => {
    const random = Math.floor(Math.random() * tracks.length);
    setCurrentTrack(tracks[random]);
    setPlaying(true);
    setWinner(false);
    setLoser(false);
    pausePlayback(deviceId);
    setTrackPlaying(false);
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
  };

  const displayTracks = text => {
    if (!text) {
      setDisplayedTracks([]);
      return;
    }

    const matchedTracks = tracks.filter(
      function (el) {
        if (this.count < 8 && el.name.toLowerCase().includes(text)) {
          this.count++;
          return true;
        }
        return false;
      },
      { count: 0 },
    );

    setDisplayedTracks(matchedTracks);
  };

  const playSong = timeLimit => {
    setTrackPlaying(true);
    startPlayback(currentTrack.id, deviceId);
    setTimeout(function () {
      pausePlayback(deviceId);
      setTrackPlaying(false);
    }, timeLimit ?? timeLimitsArray[guesses.length]);
  };

  const checkGuess = track => {
    const currId = guesses.length;
    const inputElement = document.getElementById(`guess${currId}`);
    inputElement.value = track.name;

    // For debugging
    // console.log(track.name, currentTrack.name);

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
        };
      }
      setDatabase(db);
    }

    setDisplayedTracks([]);

    if (
      track.name === currentTrack.name ||
      currentTrack.name.toLowerCase().indexOf(track.name) !== -1 ||
      track.name.toLowerCase().indexOf(currentTrack.name) !== -1
    ) {
      // got it! WINNER
      inputElement.setAttribute('style', 'background-color: #1DB954; border: 2px solid #1DB954');
      startPlayback(currentTrack.id, deviceId);
      setDisplayedTracks([currentTrack]);
      setWinner(true);

      let db = getDatabase();
      db[artistId].wins = db[artistId].wins + 1;
      db[artistId].total_guesses = db[artistId].total_guesses + currId + 1;
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
  };

  return (
    <React.Fragment>
      {tracks.length > 0 && artist ? (
        <PageContainer>
          <Header>
            <HeaderContainer>
              <Artwork>
                <img src={artist.images[1].url} alt="Artist Artwork" />
              </Artwork>
              <div style={{ marginLeft: spacing.md }}>
                <ArtistName
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {artist.name}
                </ArtistName>
                <Stats>
                  <Stat>
                    <Number>{formatWithCommas(artist.followers.total)}</Number>
                    <NumLabel>Followers</NumLabel>
                  </Stat>
                  {artist.genres.length > 0 && (
                    <Stat>
                      <Number>
                        <Genre key={artist.genres[0]}>{artist.genres[0]}</Genre>
                      </Number>
                      <NumLabel>Genres</NumLabel>
                    </Stat>
                  )}
                  {artist.popularity && (
                    <Stat>
                      <Number>{artist.popularity}%</Number>
                      <NumLabel>Popularity</NumLabel>
                    </Stat>
                  )}
                </Stats>
              </div>
            </HeaderContainer>

            <div />

            {statsForArtist ? (
              <HeaderContainer>
                <Stats
                  style={{
                    backgroundColor: colors.darkGrey,
                    borderRadius: '6px',
                    padding: '20px 30px',
                  }}
                >
                  {statsForArtist.attempts > -1 ? (
                    <Stat>
                      <Number>{statsForArtist.attempts}</Number>
                      <NumLabel>Attempts</NumLabel>
                    </Stat>
                  ) : (
                    <div />
                  )}
                  {statsForArtist.wins > -1 ? (
                    <Stat>
                      <Number>{statsForArtist.wins}</Number>
                      <NumLabel>Wins</NumLabel>
                    </Stat>
                  ) : (
                    <div />
                  )}
                  {statsForArtist.total_guesses > -1 ? (
                    <Stat style={{ paddingTop: '16px' }}>
                      <Number>
                        {statsForArtist.attempts > 0
                          ? statsForArtist.total_guesses / statsForArtist.attempts
                          : 0}
                      </Number>
                      <NumLabel>
                        Avg
                        <br />
                        Guesses
                      </NumLabel>
                    </Stat>
                  ) : (
                    <div />
                  )}
                </Stats>
              </HeaderContainer>
            ) : (
              <div />
            )}
          </Header>

          {playing && currentTrack && deviceId ? (
            <div
              style={{
                textAlign: 'center',
                maxWidth: '60%',
                overflow: 'auto',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                {(winner || loser) && (
                  <SecondaryButton to={`/track/${currentTrack.id}`}>
                    <IconMicrophone />
                  </SecondaryButton>
                )}

                <PlayButton onClick={e => playSong()}>
                  <IconPlay />
                  {winner && (
                    <ConfettiExplosion
                      duration={5000}
                      particleCount={200}
                      onComplete={e => console.log('DONE!')}
                    />
                  )}
                </PlayButton>

                {(winner || loser) && (
                  <SecondaryButton to={`/play/artist/${artistId}`} onClick={startGame}>
                    <IconReset />
                  </SecondaryButton>
                )}
              </div>

              <GuessContainer>
                <GuessInput
                  id="guess0"
                  key="guess0"
                  autoComplete="off"
                  placeholder="Type your guess..."
                  onChange={e => displayTracks(e.target.value.toLowerCase())}
                  disabled={guesses.length > 0}
                />
                {guesses.length > 0 ? (
                  <GuessInput
                    id="guess1"
                    key="guess1"
                    autoComplete="off"
                    placeholder="Type your guess..."
                    onChange={e => displayTracks(e.target.value.toLowerCase())}
                    disabled={guesses.length > 1}
                  />
                ) : null}
                {guesses.length > 1 ? (
                  <GuessInput
                    id="guess2"
                    key="guess2"
                    autoComplete="off"
                    placeholder="Type your guess..."
                    onChange={e => displayTracks(e.target.value.toLowerCase())}
                    disabled={guesses.length > 2}
                  />
                ) : null}
                {guesses.length > 2 ? (
                  <GuessInput
                    id="guess3"
                    key="guess3"
                    autoComplete="off"
                    placeholder="Type your guess..."
                    onChange={e => displayTracks(e.target.value.toLowerCase())}
                    disabled={guesses.length > 3}
                  />
                ) : null}
                {guesses.length > 3 ? (
                  <GuessInput
                    id="guess4"
                    key="guess4"
                    autoComplete="off"
                    placeholder="Type your guess..."
                    onChange={e => displayTracks(e.target.value.toLowerCase())}
                    disabled={guesses.length > 4}
                  />
                ) : null}
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
                        key={i}
                      />
                    ))
                  : null}
              </TracksContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <DevicesContainer>
                <DevicesHeader>Select a device</DevicesHeader>
                {devicesAvailable.length > 0 ? (
                  devicesAvailable.map((device, i) =>
                    device.id && device.name ? (
                      <DeviceContainer
                        key={device.id}
                        onClick={e => setDeviceId(device.id)}
                        style={{ backgroundColor: deviceId === device.id ? colors.green : null }}
                      >
                        {device.type === 'Computer' ? (
                          <IconComputer />
                        ) : device.type === 'Smartphone' ? (
                          <IconPhone />
                        ) : device.type === 'CastAudio' ? (
                          <IconSpeaker />
                        ) : (
                          <p>?</p>
                        )}

                        <DeviceName>{device.name}</DeviceName>
                      </DeviceContainer>
                    ) : null,
                  )
                ) : (
                  <div
                    style={{
                      color: colors.lightGrey,
                      paddingLeft: '18px',
                      margin: '10px 0 20px 0',
                    }}
                  >
                    No devices available!
                  </div>
                )}
                <DeviceHelpContainer
                  href={'https://support.spotify.com/us/article/spotify-connect/'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DeviceName style={{ marginLeft: 0 }}>Don't see your device?</DeviceName>
                  <div style={{ color: colors.lightGrey }}>
                    <IconExternal />
                  </div>
                </DeviceHelpContainer>
                <DeviceHelpContainer
                  href={'https://connect.spotify.com/howto'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DeviceName style={{ marginLeft: 0 }}>What can I connect to?</DeviceName>
                  <div style={{ color: colors.lightGrey }}>
                    <IconExternal />
                  </div>
                </DeviceHelpContainer>
              </DevicesContainer>
              <StartButton onClick={e => startGame()} disabled={!deviceId}>
                Start Game
              </StartButton>
            </div>
          )}
        </PageContainer>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

Play.propTypes = {
  artistId: PropTypes.string,
};

export default Play;
