import React from 'react';
import { Router } from '@reach/router';

import ScrollToTop from './ScrollToTop';
import Nav from './Nav';
import User from './User';
import TopTracks from './TopTracks';
import PlayStreak from './PlayStreak';
import PlayDaily from './PlayDaily';
import Artist from './Artist';
import Track from './Track';

import styled from 'styled-components/macro';
import { theme, media } from '../styles';

const SiteWrapper = styled.div`
  padding-left: ${theme.navWidth};
  ${media.tablet`
    padding-left: 0;
    padding-bottom: 50px;
  `};
`;

const Profile = () => (
  <SiteWrapper>
    <Nav />
    <Router primary={false}>
      <ScrollToTop path="/">
        <User path="/" />
        {/* <TopArtists path="artists" /> */}
        <TopTracks path="tracks" />
        {/* <Play path="play/artist/:artistId" /> */}
        <Artist path="artist/:artistId" />
        <PlayStreak path="streak/artist/:artistId" />
        <PlayDaily path="daily/artist/:artistId" />
        <Track path="track/:trackId" />
      </ScrollToTop>
    </Router>
  </SiteWrapper>
);

export default Profile;
