import React from 'react';
import PropTypes from 'prop-types';

import { formatWithCommas, formatLargeNumber } from '../utils';
import {
  StatsCardContainer,
  StatIcon,
  StatInfo,
  StatNumber,
  StatLabel,
  StatsCardInside,
  StatSubtext,
} from './cssStyle/Play.styled';
import { theme } from '../styles';
const { colors } = theme;

const StatsCard = ({ stat, label, icon, subtext }) => (
  <StatsCardContainer>
    <StatsCardInside>
      <StatInfo>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{stat === 0 ? 0 : stat < 1 ? stat.toFixed(2) : stat < 10000 ? formatWithCommas(stat) : formatLargeNumber(stat)}</StatNumber>
      </StatInfo>
      <StatIcon>{icon}</StatIcon>
    </StatsCardInside>
    <StatsCardInside>
      <StatSubtext>{subtext}</StatSubtext>
    </StatsCardInside>
  </StatsCardContainer>
);

StatsCard.propTypes = {
  stat: PropTypes.object.isRequired,
  label: PropTypes.object.isRequired,
  icon: PropTypes.object.isRequired,
  subtext: PropTypes.object.isRequired,
};

export default StatsCard;
