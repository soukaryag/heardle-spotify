import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ColorExtractor } from 'react-color-extractor';
import { formatWithCommas, catchErrors } from '../utils';
import { getArtist, getAllDevices, getUserInfo } from '../spotify';
import { Database } from '../database';

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
  ButtonsContainer,
  StartButton,
  StartButtonSecondary,
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
  const [statsForArtist, setStatsForArtist] = useState(null);
  const [gradientColor, setGradientColor] = useState(colors.green);

  const [dbObj, setDbObj] = useState(null);
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
    if (dbObj) return
    if (!user || !user.id) return

    let databaseObj = new Database(user.id);
    setDbObj(databaseObj);
    setStatsForArtist(databaseObj.getArtistById(artistId));
  }, [user]);

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
                  onClick={e => window.location.href = `/`}
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
              {deviceId && artist ? (
                <ButtonsContainer>
                  <StartButton
                    style={{ marginRight: '10px' }}
                    to={`/daily/artist/${artistId}?device_id=${deviceId}`}
                  >
                    Daily Heardle
                  </StartButton>
                  <StartButtonSecondary 
                    to={`/streak/artist/${artistId}?device_id=${deviceId}`}
                  >
                    Song Streak
                  </StartButtonSecondary>
                </ButtonsContainer>
              ) : (
                <div>
                  <StartButtonDisabled style={{ marginRight: '10px' }}>
                    Daily Heardle
                  </StartButtonDisabled>
                  <StartButtonDisabled>Song Streak</StartButtonDisabled>
                  <p
                    style={{
                      color: colors.error,
                      fontSize: fontSizes.sm,
                      fontWeight: 400,
                      margin: '3px 0 0 24px',
                      position: 'absolute',
                    }}
                  >
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
                { dbObj && statsForArtist ? (
                  <StatsParentContainer>
                    <StatsContainer>
                      <StatsCard
                        stat={statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_WON] ?? 0}
                        label={'Wins'}
                        icon={<IconTrophy />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.green, marginRight: '3px', fontWeight: '600' }}
                            >
                              {statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED]
                                ? (100 * (statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_WON] / statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED])).toFixed(2)
                                : 0}
                              %
                            </span>{' '}
                            of games won
                          </>
                        }
                      />
                      <StatsCard
                        stat={statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED] - statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_WON] ?? 0}
                        label={'Losses'}
                        icon={<IconLoss />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.red, marginRight: '3px', fontWeight: '600' }}
                            >
                              {statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED]
                                ? (100 * ((statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED] - statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_WON]) / statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED])).toFixed(2)
                                : 0}
                              %
                            </span>{' '}
                            of games lost
                          </>
                        }
                      />
                    </StatsContainer>
                    <StatsContainer>
                      <StatsCard
                        stat={statsForArtist[dbObj.DAILY_MODE][dbObj.GAMES_PLAYED] ?? 0}
                        label={'Attempts'}
                        icon={<IconPlay />}
                        subtext={
                          <>
                            <span
                              style={{ color: colors.green, marginRight: '3px', fontWeight: '600' }}
                            >
                              0%
                            </span>{' '}
                            of games finsihed
                          </>
                        }
                      />
                      <StatsCard
                        stat={
                          statsForArtist[dbObj.DAILY_MODE][dbObj.MAX_STREAK] > 0
                            ? statsForArtist[dbObj.DAILY_MODE][dbObj.MAX_STREAK]
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
                ) : (
                  <Loader />
                )}
                
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
                            <IconComputer style={{ width: '28px', height: '28px' }} />
                          ) : device.type === 'Smartphone' ? (
                            <IconPhone style={{ width: '28px', height: '28px' }} />
                          ) : device.type === 'CastAudio' ? (
                            <IconSpeaker style={{ width: '28px', height: '28px' }} />
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
                      <a
                        style={{ color: colors.green }}
                        onClick={e => {
                          window.open('https://open.spotify.com/');
                          new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                            window.location.reload();
                          });
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
