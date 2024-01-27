import React, { useState, useEffect, useSearchParams } from 'react';
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
import TrackItem from './TrackItem';

import { theme } from '../styles';
import { IconPlay, IconMicrophone, IconReset, IconVerified, IconBack, IconForward } from './icons';
import {
  PageContainer,
  BannerHeader,
  NavigationContainer,
  NavButtonContainer,
  ButtonContainer,
  LinkContainer,
  AristContainer,
  Artwork,
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
  PlayButton,
  GuessContainer,
  GuessInput,
  TracksContainer,
} from './cssStyle/Play.styled';
const { colors, fontSizes, fonts, spacing } = theme;

const PlayV2 = props => {
    const { artistId } = props;

    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [deviceId, setDeviceId] = useState(props.location.search.split('=')[1] ?? null);
    const [gradientColor, setGradientColor] = useState(colors.green);

    const timeLimitsArray = [1500, 2000, 4000, 8000, 16000, 32000];
    const [guesses, setGuesses] = useState([]);
    const [displayedTracks, setDisplayedTracks] = useState(null);
    const [trackPlaying, setTrackPlaying] = useState(false);
    const [winner, setWinner] = useState(false);
    const [loser, setLoser] = useState(false);

    const [albumGuessed, setAlbumGuessed] = useState(false);
    const [trackSelectedFromSearch, setTrackSelectedFromSearch] = useState(0);

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
        const random = Math.floor(Math.random() * tracks.length);
        setCurrentTrack(tracks[random]);
    }, [tracks]);

    useEffect(() => {
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
    }, []);

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

        if (track.album.name === currentTrack.album.name) {
            setAlbumGuessed(true);
        }

        if (
            track.name === currentTrack.name ||
            currentTrack.name.toLowerCase().indexOf(track.name) !== -1 ||
            track.name.toLowerCase().indexOf(currentTrack.name) !== -1
        ) {
            // got it! WINNER
            inputElement.setAttribute('style', 'background-color: #1DB954; border: 2px solid #1DB954');
            inputElement.disabled = true;
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

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            checkGuess(displayedTracks[trackSelectedFromSearch]);
        } else if (e.key === 'ArrowUp') {
            setTrackSelectedFromSearch(e => {
                if (e > 0) {
                    return e - 1;
                } else {
                    return e
                }
            });
        } else if (e.key === 'ArrowDown') {
            setTrackSelectedFromSearch(e => {
                if (e < 4) {
                    return e + 1;
                } else {
                    return e
                }
            });
        }
    }

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
                      href={artist.external_urls.spotify}
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
                      <Artwork style={{ width: '20px', height: '20px', marginRight: '10px' }}>
                        <img
                          style={{ width: '20px', height: '20px' }}
                          src={artist.images[1].url}
                          alt="Artist Artwork"
                        />
                      </Artwork>
                      <ArtistNameLink to={`/artist/${artistId}`}>{artist.name}</ArtistNameLink>
                    </div>
                  </ArtistInfoContainer>
                </AristContainer>
              </BannerHeader>
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
                    <SecondaryButton
                      to={`/artist/${artistId}`}
                      onClick={() => window.location.reload()}
                    >
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
                        onKeyUp={handleKeyPress}
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
                              selected={trackSelectedFromSearch === i}
                              key={i}
                            />
                          ))
                        : null}
                    </TracksContainer>
                  </LeftsideContainer>
                  <RightsideContainer>Artist</RightsideContainer>
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
