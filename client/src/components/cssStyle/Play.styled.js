import {Link} from '@reach/router';
import styled from 'styled-components/macro';
import {theme, mixins, media, Main} from '../../styles';

const {colors, fontSizes, fonts, spacing} = theme;


export const DevicesContainer = styled.div `
    display: flex;
    flex-direction: column;
    width: 320px;
    background-color: ${colors.darkGrey};
    padding: 20px;
    border-radius: 6px;
`;

export const DeviceContainer = styled.a `
    display: grid;
    grid-template-columns: 1fr 8fr;
    grid-gap: 15px;
    padding: 18px 10px;
    border-radius: 4px;
    &:hover {
        background-color: ${colors.grey};
    }
    &:focus {
        background-color: ${colors.green};
    }
`;
export const DeviceHelpContainer = styled.a `
    display: grid;
    grid-template-columns: 15fr 1fr;
    grid-gap: 15px;
    padding: 12px 10px;
    border-radius: 6px;
    &:hover {
        background-color: ${colors.grey};
    }
    &:focus {
        background-color: ${colors.green};
    }
`;
export const DeviceName = styled.div `
    font-size: ${fontSizes.smd};
    margin: auto 10px;
`;
export const DevicesHeader = styled.a `
    display: inline;
    font-weight: 700;
    font-size: 18px;
    padding: 10px;
`;

export const PageContainer = styled.div `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-height: 100vh;
`;
export const BannerHeader = styled.div `
    flex: 3;
    display: flex;
    flex-direction: column;
    padding: 20px;
`;
export const NavigationContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
`;
export const AristContainer = styled.div`
    flex: 8;
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    align-items: flex-end;
    ${media.tablet `
        margin-top: 80px;
    `};
`;
export const Artwork = styled.div `
    border-radius: 100%;
    img {
        object-fit: cover;
        border-radius: 100%;
        width: 220px;
        height: 220px;
        box-shadow: 0 4px 60px rgba(0,0,0,.5);
        ${media.tablet `
            display: none;
        `};
    }
`;
export const ArtistInfoContainer = styled.div `
    margin: 0 20px;
    display: flex;
    flex-direction: column;
    ${media.tablet `
        margin: 0 5px;
    `};
`;
export const ArtistName = styled.a `
    display: inline;
    font-weight: 700;
    &:hover {
        color: ${colors.green};
    }
    font-size: 96px;
    ${media.tablet `
        font-size: 80px;
    `};
`;
export const VerifiedArtistContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-cotent: flex-start;
`;
export const IconBackground = styled.div `
    position: absolute;
    background-color: ${colors.white};
    border-radius: 50%;
    height: 12px;
    width: 12px;
    margin-left: 5px;
    margin-top: 5px;
    z-index: 0;
    justify-self: center;
`;
export const NavButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
`;
export const ButtonContainer = styled.a`
    align-items: center;
    background-color: rgba(0,0,0,.7);
    border: none;
    border-radius: 50%;
    padding: 3px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    height: 32px;
    width: 32px;
    justify-content: center;
    position: relative;
    &:hover {
        background-color: rgba(0,0,0,.8);
    }
    svg {
        height: 18px;
        width: 18px;
    }
`;
export const LinkContainer = styled(Link)`
    align-items: center;
    background-color: rgba(0,0,0,.7);
    border: none;
    border-radius: 50%;
    padding: 3px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    height: 32px;
    width: 32px;
    justify-content: center;
    position: relative;
    &:hover {
        background-color: rgba(0,0,0,.8);
    }
    img {
        border-radius: 100%;
    }
`;

export const BodyContainer = styled.div `
    flex: 5;
    background-image: linear-gradient(rgba(0,0,0,.6) 0, ${colors.black} 100%);
    padding: 16px;
    display: flex;
    flex-direction: column;
    ${media.tablet `
        display: flex;
        flex-direction: column;
        align-items: center;
    `};
`;
export const ContentContainer = styled.div `
    display: flex;
    flex-direction: row;
    ${media.tablet `
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
    `};
`;
export const LeftsideContainer = styled.div `
    display: flex;
    flex-direction: column;
    padding: 16px;
    margin-right: 50px;
    ${media.tablet `
        padding: 5px;
        margin-right: 0px;
    `};
`;
export const ActionsContainer = styled.div `
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px 16px 0 16px;
    ${media.tablet `
        justify-content: space-between;
    `};
`;
export const StartButton = styled.a `
    display: inline-block;
    background-color: ${colors.green};
    color: ${colors.white};
    border-radius: 30px;
    padding: 17px 35px;
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
export const InfoButtonContainer = styled.a`
    align-items: center;
    background-color: rgba(0,0,0,.7);
    border: none;
    border-radius: 50%;
    padding: 3px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    height: 50px;
    width: 50px;
    justify-content: center;
    position: relative;
    &:hover {
        background-color: rgba(0,0,0,.8);
        color: ${colors.green}
    }
    svg {
        height: 25px;
        width: 25px;
    }
`;


export const StatsParentContainer = styled.div `
    display: flex;
    flex-direction: column;
    margin: 16px 0;
`;
export const StatsContainer = styled.div `
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin-bottom: 20px;
    ${media.tablet `
        display: flex;
        flex-direction: column;
    `};
`;
export const StatsCardContainer = styled.div `
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    background-image: linear-gradient(rgba(0,0,0,.2) 0, rgba(0,0,0,.4) 100%);
    padding: 15px 25px 20px 25px;
    max-width: 350px;
    &:hover {
        background-image: linear-gradient(45deg, rgba(0,0,0,.2) 0, ${colors.green} 2000%);
    }
`;
export const StatsCardInside = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;
export const StatIcon = styled.div `
    margin-top: 10px;
    svg {
        height: 85px;
        width: 85px;
    }
`;
export const StatInfo = styled.div `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-right: ${spacing.lg}
`;
export const StatNumber = styled.a `
    color: ${colors.white};
    font-weight: 500;
    font-size: 50px;
    text-transform: capitalize;
`;
export const StatLabel = styled.a `
    color: ${colors.lightGrey};
    font-size: ${fontSizes.sm};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    margin-top: ${spacing.xs};
`;
export const StatSubtext = styled.a `
    color: ${colors.lightGrey};
    font-size: ${fontSizes.sm};
    letter-spacing: 1px;
    margin-top: ${spacing.sm};
`;

export const RightsideContainer = styled.div `
    display: flex;
    flex-direction: column;
    padding: 16px;
    align-items: center;
    margin-top: 16px;
    ${media.tablet `
        padding: 5px;
        margin: 20px 0 40px 0;
    `};
`;
export const Number = styled.div `
    color: ${colors.white};
    font-weight: 500;
    font-size: ${fontSizes.smd};
    text-transform: capitalize;
    ${media.tablet `
        font-size: ${fontSizes.smd};
    `};
`;