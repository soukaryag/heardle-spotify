import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ColorExtractor } from 'react-color-extractor';
import { formatWithCommas, catchErrors } from '../utils';
import { getArtist, getAllDevices, getDatabase, setDatabase, getUserInfo } from '../spotify';

import Loader from './Loader';
import StatsCard from './StatsCard';

import { theme } from '../styles';
import {
  IconPlay,
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
  StartButtonDisabled,
  InfoButtonContainer,
  StatsContainer,
  StatsParentContainer,
  DevicesHeader,
  DeviceHelpContainer,
  DeviceName,
} from './cssStyle/Play.styled';
const { colors, fontSizes } = theme;

const Artist = props => {
  const { artistId } = props;

  const [artist, setArtist] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [devicesAvailable, setDevicesAvailable] = useState([]);
  const [statsForArtist, setStatsForArtist] = useState({});
  const [gradientColor, setGradientColor] = useState(colors.green);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await getUserInfo();
      setUser(user);
    };
    catchErrors(fetchData());
  }, []);

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
        last_5_songs: [],
      };
      setStatsForArtist(db[artistId]);
      setDatabase(db);
    } else {
      setStatsForArtist(db[artistId]);
    }
  }, []);

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
          <BodyContainer>
            <ActionsContainer style={{ paddingTop: '16px' }}>
              { deviceId && artist ? (
                <StartButton
                  to={`/play/artist/${artistId}?device_id=${deviceId}`}
                >
                  Start Game
                </StartButton>
              ) : (
                <div>
                  <StartButtonDisabled>
                    Start Game
                  </StartButtonDisabled>
                  <p style={{ color: colors.error, fontSize: fontSizes.sm, fontWeight: 400, margin: '3px 0 0 12px', position: 'absolute' }}>
                    Please select a device first
                  </p>
                </div>
                
              )}
              
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
                            {(100 * (statsForArtist.wins / statsForArtist.attempts)).toFixed(2)}%
                          </span>{' '}
                          of games won
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
                            {(100 * (statsForArtist.losses / statsForArtist.attempts)).toFixed(2)}%
                          </span>{' '}
                          of games lost
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
                            {(
                              100 *
                              ((statsForArtist.wins + statsForArtist.losses) /
                                statsForArtist.attempts)
                            ).toFixed(2)}
                            %
                          </span>{' '}
                          of games finsihed
                        </>
                      }
                    />
                    <StatsCard
                      stat={
                        statsForArtist.attempts > 0
                          ? statsForArtist.total_guesses /
                            (statsForArtist.wins + statsForArtist.losses)
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
                      No devices available! Try 
                      <a style={{ color: colors.green }}
                        onClick={e => {
                          window.open('https://open.spotify.com/')
                          new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
                            window.location.reload()
                          })
                        }}
                      >
                        opening Spotify
                      </a>
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
