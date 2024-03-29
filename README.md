# Heardle with Spotify

> Web app that allows you to play heardle with any artist you like (as long as you have spotify premium)


## Setup

1. [Register a Spotify App](https://developer.spotify.com/dashboard/applications) and add `http://localhost:8888/callback` as a Redirect URI in the app settings
2. Create an `.env` file in the root of the project based on `.env.example`
3. `nvm use`
4. `yarn && yarn client:install`
5. `yarn dev`


## TO-DO

### Frontend
- [ ] Add modals with instructions!!!! (3pt)
- [ ] Artist page
    - [ ] Rework stat cards based on new format
- [ ] Implement daily heardle mode
    - [x] Hash generation (2pt)
    - [x] One a day logic implementation - block play if today complete (1pt)
    - [x] Save game state idea if leaving page halfway through the game (save on every guess) (2pt)
    - [ ] Stat and progress tracking for daily heardle  (3pt)
    - [x] Win/loss state similar to wordle but prettier :O (2pt)
    - [x] Bug on load for new artists
    - [ ] Sleep for 3 seconds before displaying stats screen (modal?)
    - [ ] Consider limiting daily mode to user's top 5 artists only (supply demand management)
- [ ] Rework streak heardle mode
    - [ ] More satisfying ultimate win page (2pt)
    - [ ] Share to socials button on end game state (2pt)
- [ ] Rework home page (3pt)
- [ ] Add a global stats page (4pt)
- [ ] Rework db
    - [x] Create db class (3pt)
    - [ ] Consider moving it to postgres/mongodb (5pt)
        - [ ] This will allow for leaderboards and all - look into that (Kruti) (5pt)
- [x] Optimize for mobile play
    - [x] Particularly with keyboard/search interaction pushing the page around (1pt)
    - [ ] Remove Nav bar from play pages
- [ ] General enhancements
    - [ ] Fix the back and fwd buttons, right now they just does history(-1), but that's wrong (1pt)

### Backend
- [ ] Complete refactor and abstraction of code (it's ugh lee right now)
- [ ] Add schemas, design database structure and collections
- [ ] Use spotify as primary auth to fetch user data from mongo
- [ ] Rework frontend to connect to backend endpoints for data flow, tear down cached data
- [ ] Testing suite for endpoints (WIP, mongo dono walled me lul - need to install monogdb locally)


## Credits

This project uses https://github.com/bchiang7/spotify-profile as the base for auth setup and much of the styling. All credits to bchiang7 for her work on https://spotify-profile.herokuapp.com/


## Technologies Used
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Create React App](https://github.com/facebook/create-react-app)
- [Express](https://expressjs.com/)
- [Reach Router](https://reach.tech/router)
- [Styled Components](https://www.styled-components.com/)