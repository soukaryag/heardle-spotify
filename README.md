# Heardle with Spotify

> Web app that allows you to play heardle with any artist you like (as long as you have spotify premium)


## Setup

1. [Register a Spotify App](https://developer.spotify.com/dashboard/applications) and add `http://localhost:8888/callback` as a Redirect URI in the app settings
1. Create an `.env` file in the root of the project based on `.env.example`
1. `nvm use`
1. `yarn && yarn client:install`
1. `yarn dev`


## Credits

This project uses https://github.com/bchiang7/spotify-profile as the base for auth setup and much of the styling. All credits to bchiang7 for her work on https://spotify-profile.herokuapp.com/


## Technologies Used
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Create React App](https://github.com/facebook/create-react-app)
- [Express](https://expressjs.com/)
- [Reach Router](https://reach.tech/router)
- [Styled Components](https://www.styled-components.com/)