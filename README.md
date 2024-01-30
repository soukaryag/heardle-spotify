# Heardle with Spotify

> Web app that allows you to play heardle with any artist you like (as long as you have spotify premium)


## Setup

1. [Register a Spotify App](https://developer.spotify.com/dashboard/applications) and add `http://localhost:8888/callback` as a Redirect URI in the app settings
2. Create an `.env` file in the root of the project based on `.env.example`
3. `nvm use`
4. `yarn && yarn client:install`
5. `yarn dev`


## TO-DO

- [ ] Implement daily heardle mode
    - [ ] Hash generation
    - [ ] One a day logic implementation - block play if today complete
    - [ ] Save game state idea if leaving page halfway through the game (save on every guess)
    - [ ] Stat and progress tracking for daily heardle
- [ ] Rework streak heardle mode
    - [ ] More satisfying ultimate win page
    - [ ] Share to socials button on end game state
- [ ] Rework home page
- [ ] Add a global stats page
- [ ] Rework db json
    - [x] Create db class
    - [ ] Consider moving it to postgres/mongodb
- [ ] Optimize for mobile play
    - [ ] Particularly with keyboard/search interaction pushing the page around


## Credits

This project uses https://github.com/bchiang7/spotify-profile as the base for auth setup and much of the styling. All credits to bchiang7 for her work on https://spotify-profile.herokuapp.com/


## Technologies Used
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Create React App](https://github.com/facebook/create-react-app)
- [Express](https://expressjs.com/)
- [Reach Router](https://reach.tech/router)
- [Styled Components](https://www.styled-components.com/)