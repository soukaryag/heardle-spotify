import React, { useState, useEffect } from 'react';
import { Link } from '@reach/router';
import { getUserInfo, getSearchArists, getAllTracksByArtist, logout,  } from '../spotify';
import { catchErrors } from '../utils';

import { IconUser, IconInfo } from './icons';
import Loader from './Loader';

import styled from 'styled-components/macro';
import { theme, mixins, media, Main } from '../styles';
const { fonts, colors, fontSizes, spacing } = theme;

const Header = styled.header`
  ${mixins.flexCenter};
  flex-direction: column;
  position: relative;
`;
const Avatar = styled.div`
  width: 150px;
  height: 150px;
  img {
    border-radius: 100%;
  }
`;
const NoAvatar = styled.div`
  border: 2px solid currentColor;
  border-radius: 100%;
  padding: ${spacing.md};
`;
const UserName = styled.a`
  &:hover,
  &:focus {
    color: ${colors.offGreen};
  }
`;
const Name = styled.h1`
  font-size: 50px;
  font-weight: 700;
  margin: 20px 0 0;
  ${media.tablet`
    font-size: 40px;
  `};
  ${media.phablet`
    font-size: 8vw;
  `};
`;
const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 30px;
  margin-top: ${spacing.base};
`;
const Stat = styled.div`
  text-align: center;
`;
const Number = styled.div`
  color: ${colors.green};
  font-weight: 700;
  font-size: ${fontSizes.md};
`;
const NumLabel = styled.p`
  color: ${colors.lightGrey};
  font-size: ${fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: ${spacing.xs};
`;
const LogoutButton = styled.a`
  background-color: transparent;
  color: ${colors.white};
  border: 1px solid ${colors.white};
  border-radius: 30px;
  margin-top: 30px;
  padding: 12px 30px;
  font-size: ${fontSizes.xs};
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  &:hover,
  &:focus {
    background-color: ${colors.white};
    color: ${colors.black};
  }
`;

const Mask = styled.div`
  ${mixins.flexCenter};
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 100%;
  font-size: 20px;
  color: ${colors.white};
  opacity: 0;
  transition: ${theme.transition};
  svg {
    width: 25px;
  }
`;
const ArtistArtwork = styled(Link)`
  display: inline-block;
  position: relative;
  width: 200px;
  height: 200px;
  ${media.tablet`
    width: 150px;
    height: 150px;
  `};
  ${media.phablet`
    width: 120px;
    height: 120px;
  `};
  &:hover,
  &:focus {
    ${Mask} {
      opacity: 1;
    }
  }
  img {
    border-radius: 100%;
    object-fit: cover;
    width: 200px;
    height: 200px;
    ${media.tablet`
      width: 150px;
      height: 150px;
    `};
    ${media.phablet`
      width: 120px;
      height: 120px;
    `};
  }
`;
const ArtistsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 20px;
  margin-top: 50px;
  ${media.tablet`
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  `};
  ${media.phablet`
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  `};
`;
const Artist = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;
const ArtistName = styled.a`
  margin: ${spacing.base} 0;
  border-bottom: 1px solid transparent;
  &:hover,
  &:focus {
    border-bottom: 1px solid ${colors.white};
  }
`;

const SpotifySearchContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 360px;
  position: relative;
  margin: 50px auto 100px auto;
  width: 300px;
  ${media.tablet`
    width: 200px;
  `};
  ${media.phablet`
    width: 150px;
  `};
`;
const SpotifySearch = styled.input`
  border: 2px solid ${colors.darkGrey};
  position: relative;
  z-index: 1;
  height: 40px;
  border-radius: 25px;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  font-family: ${fonts.primary}!important;
  font-size: ${fontSizes.smd};
  background-color: ${colors.darkGrey};
  color: white;
  &:focus {
    border: 2px solid ${colors.white};
  }
`;

const User = () => {
  const [user, setUser] = useState(null);
  const [artistsSearched, setArtistsSearched] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { user } = await getUserInfo();
      setUser(user);
    };
    catchErrors(fetchData());
  }, []);

  const updateSearchText = (text) => {
    if (!text) {
      setArtistsSearched(null)
      return
    }

    const fetchDataArtists = async () => {
      const { data } = await getSearchArists(text);
      const { artists } = data
      setArtistsSearched(artists)
    };
    catchErrors(fetchDataArtists());
  }

  return (
    <React.Fragment>
      {user ? (
        <Main>
          <Header>
            <Avatar>
              {user.images.length > 1 ? (
                <img src={user.images[1].url} alt="avatar" />
              ) : user.images.length > 0 ? (
                <img src={user.images[0].url} alt="avatar" />
              )
              : (
                <NoAvatar>
                  <IconUser />
                </NoAvatar>
              )}
            </Avatar>
            <UserName href={user.external_urls.spotify} target="_blank" rel="noopener noreferrer">
              <Name>{user.display_name}</Name>
            </UserName>
            <Stats>
              <Stat>
                <Number>0</Number>
                <NumLabel>Attempts</NumLabel>
              </Stat>
              <Stat>
                <Number>0</Number>
                <NumLabel>Wins</NumLabel>
              </Stat>
              <Stat>
                <Number>0.0%</Number>
                <NumLabel>Percentage</NumLabel>
              </Stat>
            </Stats>
            <LogoutButton onClick={logout}>Logout</LogoutButton>
          </Header>
          
          <SpotifySearchContainer>
            <SpotifySearch placeholder='Who do you want to heardle?' onChange={e => updateSearchText(e.target.value)} />
          </SpotifySearchContainer>

          <ArtistsContainer>
            {artistsSearched ? (
              artistsSearched.items.map(({ id, external_urls, images, name }, i) => (
                id && external_urls && images && images.length > 0 && name ? (
                  <Artist key={i}>
                    <ArtistArtwork to={`/play/${id}`}>
                      {images.length > 1 ? <img src={images[1].url} alt="Artist" /> : images.length > 0 ? <img src={images[0].url} alt="Artist" /> : null}
                      <Mask>
                        <IconInfo />
                      </Mask>
                    </ArtistArtwork>
                    <ArtistName>
                      {name}
                    </ArtistName>
                  </Artist>
                ) : null
              ))
            ) : null}
          </ArtistsContainer>
        </Main>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

export default User;
