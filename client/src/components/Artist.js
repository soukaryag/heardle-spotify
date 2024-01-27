import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ConfettiExplosion from 'react-confetti-explosion';
import { ColorExtractor } from 'react-color-extractor';
import { formatWithCommas, formatLargeNumber, catchErrors } from '../utils';
import {
  getAllAlbumsByArtist,
  getAllTracksByAlbum,
  getArtist,
  startPlayback,
  pausePlayback,
  getAllDevices,
  getDatabase,
  setDatabase,
  getUserInfo,
} from '../spotify';

import Loader from './Loader';
import StatsCard from './StatsCard';
import TrackItem from './TrackItem';

import { theme } from '../styles';
import {
  IconPlay,
  IconMicrophone,
  IconReset,
  IconComputer,
  IconPhone,
  IconSpeaker,
  IconExternal,
  IconVerified,
  IconBack,
  IconForward,
  IconInfo,
  IconTrophy,
  IconLoss,
  IconBrain,
} from './icons';
import {
  DevicesContainer,
  DeviceContainer,
  PageContainer,
  BannerHeader,
  NavigationContainer,
  NavButtonContainer,
  ButtonContainer,
  LinkContainer,
  AristContainer,
  Artwork,
  ArtistInfoContainer,
  VerifiedArtistContainer,
  IconBackground,
  ArtistName,
  Number,
  BodyContainer,
  ContentContainer,
  LeftsideContainer,
  RightsideContainer,
  ActionsContainer,
  StartButton,
  InfoButtonContainer,
  StatsContainer,
  StatsParentContainer,
  DevicesHeader,
  DeviceHelpContainer,
  DeviceName,
  SecondaryButton,
  PlayButton,
  GuessContainer,
  GuessInput,
  TracksContainer,
} from './cssStyle/Play.styled';
const { colors, fontSizes, fonts, spacing } = theme;

const Artist = props => {
  const { artistId } = props;

  const [tracks, setTracks] = useState([]);
  const [artist, setArtist] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [devicesAvailable, setDevicesAvailable] = useState([]);
  const [statsForArtist, setStatsForArtist] = useState({});
  const [gradientColor, setGradientColor] = useState(colors.green);

  const timeLimitsArray = [1500, 2000, 4000, 8000, 16000, 32000];
  const [guesses, setGuesses] = useState([]);
  const [displayedTracks, setDisplayedTracks] = useState(null);
  const [trackPlaying, setTrackPlaying] = useState(false);
  const [winner, setWinner] = useState(false);
  const [loser, setLoser] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await getUserInfo();
      setUser(user);
    };
    catchErrors(fetchData());
  }, []);

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
          return (
            !el.name.toLowerCase().includes('remix') && !el.name.toLowerCase().includes('live')
          );
        });
        additionalTracks = additionalTracks.map(obj => ({
          ...obj,
          album: {
            id,
            images,
            name,
          },
        }));
        setTracks(oldTracks => [...oldTracks, ...additionalTracks]);
      });
    };
    catchErrors(fetchData());
  }, [artistId]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getArtist(artistId);
      setArtist(data);
      document.title = `${data?.name} | Heardle`;
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
        if (this.count < 5 && el.name.toLowerCase().includes(text)) {
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

    // For debugging console.log(track.name, currentTrack.name);

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
      {artist && user ? (
        <PageContainer
          style={{
            backgroundImage: `linear-gradient(${gradientColor}, ${colors.black} 90%)`,
          }}
        >
          <BannerHeader>
            <ColorExtractor getColors={colors => setGradientColor(colors[2])}>
              <img
                src={artist.images[0].url}
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
              <Artwork>
                <img src={artist.images[1].url} alt="Artist Artwork" />
              </Artwork>
              <ArtistInfoContainer>
                <VerifiedArtistContainer>
                  <IconBackground />
                  <div style={{ color: '#3d91f4', height: '20px', width: '20px', zIndex: 1 }}>
                    <IconVerified />
                  </div>
                  <div style={{ margin: 'auto 6px', fontWeight: 600, fontSize: fontSizes.sm }}>
                    Verified Artist
                  </div>
                </VerifiedArtistContainer>
                <ArtistName
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {artist.name}
                </ArtistName>
                <div style={{ paddingBottom: '10px' }}>
                  <Number>{formatWithCommas(artist.followers.total)} Followers</Number>
                </div>
              </ArtistInfoContainer>
            </AristContainer>
          </BannerHeader>
          {playing && currentTrack && deviceId ? (
            <BodyContainer>
              <ActionsContainer>
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
                  <SecondaryButton to={`/artist/${artistId}`} onClick={startGame}>
                    <IconReset />
                  </SecondaryButton>
                )}
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
                </LeftsideContainer>
                <RightsideContainer>Artist</RightsideContainer>
              </ContentContainer>
            </BodyContainer>
          ) : (
            <BodyContainer>
              <ActionsContainer>
                <StartButton
                  to={`/play/artist/${artistId}?device_id=${deviceId}`}
                  disabled={!deviceId}
                >
                  Start Game
                </StartButton>
                <InfoButtonContainer
                  onClick={e => console.log('Popup with how to play')}
                  style={{ marginLeft: '15px' }}
                >
                  <IconInfo />
                </InfoButtonContainer>
              </ActionsContainer>
              <ContentContainer>
                <LeftsideContainer>
                  <StatsParentContainer>
                    <StatsContainer>
                      <StatsCard
                        stat={statsForArtist.wins ?? 0}
                        label={'Wins'}
                        icon={<IconTrophy />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.green, marginRight: '3px', fontWeight: '600' }}
                            >
                              Top 0.005%
                            </span>{' '}
                            of all {artist.name} fans
                          </>
                        }
                      />
                      <StatsCard
                        stat={statsForArtist.losses ?? 0}
                        label={'Losses'}
                        icon={<IconLoss />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.red, marginRight: '3px', fontWeight: '600' }}
                            >
                              Bottom 3%
                            </span>{' '}
                            of all {artist.name} fans
                          </>
                        }
                      />
                    </StatsContainer>
                    <StatsContainer>
                      <StatsCard
                        stat={statsForArtist.attempts ?? 0}
                        label={'Attempts'}
                        icon={<IconPlay />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.green, marginRight: '3px', fontWeight: '600' }}
                            >
                              Top 1%
                            </span>{' '}
                            of all {artist.name} fans
                          </>
                        }
                      />
                      <StatsCard
                        stat={
                          statsForArtist.attempts > 0
                            ? statsForArtist.total_guesses / statsForArtist.attempts
                            : 0
                        }
                        label={'Average Guess'}
                        icon={<IconBrain />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.green, marginRight: '3px', fontWeight: '600' }}
                            >
                              Top 1%
                            </span>{' '}
                            of all {artist.name} fans
                          </>
                        }
                      />
                    </StatsContainer>
                  </StatsParentContainer>
                </LeftsideContainer>
                <RightsideContainer>
                  <DevicesContainer>
                    <DevicesHeader>Select a device</DevicesHeader>
                    {devicesAvailable.length > 0 ? (
                      devicesAvailable.map((device, i) =>
                        device.id && device.name ? (
                          <DeviceContainer
                            key={device.id}
                            onClick={e => setDeviceId(device.id)}
                            style={{
                              backgroundColor: deviceId === device.id ? colors.green : null,
                            }}
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
                </RightsideContainer>
              </ContentContainer>
            </BodyContainer>
          )}
        </PageContainer>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

Artist.propTypes = {
  artistId: PropTypes.string,
};

export default Artist;
