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

const StatsCard = ({ stat, label, icon, subtext }) => (
  <StatsCardContainer>
    <StatsCardInside>
      <StatInfo>
        <StatLabel>{label}</StatLabel>
        <StatNumber>
          {stat === 0
            ? 0
            : stat < 1
            ? stat.toFixed(1)
            : stat < 10000
            ? formatWithCommas(stat)
            : formatLargeNumber(stat)}
        </StatNumber>
      </StatInfo>
      <StatIcon>{icon}</StatIcon>
    </StatsCardInside>
    <StatsCardInside>
      <StatSubtext>{subtext}</StatSubtext>
    </StatsCardInside>
  </StatsCardContainer>
);

StatsCard.propTypes = {
  stat: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  subtext: PropTypes.object.isRequired,
};

export default StatsCard;
