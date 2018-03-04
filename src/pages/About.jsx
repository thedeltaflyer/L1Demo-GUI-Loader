import React, { Component } from 'react';
import { Card, CardActions, CardHeader, CardTitle, CardMedia, CardText } from 'material-ui/Card';
import { GridList, GridTile } from 'material-ui/GridList';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import { grey400, darkBlack } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconPeople from 'material-ui/svg-icons/social/people';
import IconLink from 'material-ui/svg-icons/content/link';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faGithub, faGithubSquare, faReact, faFontAwesome } from '@fortawesome/fontawesome-free-brands';
import { faImages, faExternalLinkAlt, faCode, faGavel } from '@fortawesome/fontawesome-free-solid';


const iconButtonElement = (
  <IconButton
    touch
    tooltip="more"
    tooltipPosition="bottom-left"
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

const arkoIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>
      <a href="https://twitter.com/arkorobotics" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Twitter
      </a>
    </MenuItem>
    <MenuItem>
      <a href="https://github.com/arkorobotics" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        GitHub
      </a>
    </MenuItem>
    <MenuItem>
      <a href="http:///arkorobotics.com" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Website
      </a>
    </MenuItem>
  </IconMenu>
);

const davoIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>
      <a href="https://twitter.com/deltaflyerzero" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Twitter
      </a>
    </MenuItem>
    <MenuItem>
      <a href="https://github.com/thedeltaflyer" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        GitHub
      </a>
    </MenuItem>
    <MenuItem>
      <a href="http:///thedeltaflyer.com" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Website
      </a>
    </MenuItem>
  </IconMenu>
);

const layeroneIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>
      <a href="https://www.layerone.org" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Website
      </a>
    </MenuItem>
    <MenuItem>
      <a href="https://www.layerone.org/registration/" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Registration
      </a>
    </MenuItem>
  </IconMenu>
);

const l1demoIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>
      <a href="http://l1demo.org/" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Website
      </a>
    </MenuItem>
    <MenuItem>
      <a href="http://l1demo.org/wiki" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Wiki
      </a>
    </MenuItem>
    <MenuItem>
      <a href="http://l1demo.org/forum" style={{ textDecoration: 'inherit', color: 'inherit' }}>
        Forum
      </a>
    </MenuItem>
  </IconMenu>
);

const listPeople = (
  <div>
    <List>
      <Subheader><IconPeople viewBox="0 -7 25 25" color={grey400} /> People</Subheader>
      <ListItem
        leftAvatar={<Avatar src="../static/images/arko.jpg" />}
        rightIconButton={arkoIconMenu}
        primaryText="Arko"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>Founder & Designer</span><br />
            Enjoys long walks on the beach
          </p>
        }
        secondaryTextLines={2}
      />
      <Divider inset />
      <ListItem
        leftAvatar={<Avatar src="../static/images/davo.jpg" />}
        rightIconButton={davoIconMenu}
        primaryText="Davo"
        secondaryText={
          <p>
            <span style={{ color: darkBlack }}>Coder</span><br />
            When did I find time to write this?
          </p>
        }
        secondaryTextLines={2}
      />
    </List>
  </div>
);

const listLinks = (
  <div>
    <div>
      <List>
        <Subheader><IconLink viewBox="0 -7 25 25" color={grey400} /> Links</Subheader>
        <ListItem
          leftAvatar={<img
            src="../static/images/l1icon.png"
            alt=""
            style={{ width: '15%' }}
          />}
          rightIconButton={layeroneIconMenu}
          primaryText="LayerOne Conference"
          secondaryText={
            <p>
              <span style={{ color: darkBlack }}>The Enabler</span><br />
              Security Conference in Los Angeles.
            </p>
          }
          secondaryTextLines={2}
        />
        <Divider inset />
        <ListItem
          leftAvatar={<img
            src="../static/images/l1demo-board.png"
            alt=""
            style={{ width: '15%' }}
          />}
          rightIconButton={l1demoIconMenu}
          primaryText="L1 Demo Party"
          secondaryText={
            <p>
              <span style={{ color: darkBlack }}>The Party</span><br />
              The best Demo Party on the West Coast!
            </p>
          }
          secondaryTextLines={2}
        />
      </List>
    </div>
  </div>
);

const catsData = [
  {
    img: '../static/images/link.png',
    title: 'Link',
    owner: 'Davo',
  },
  {
    img: '../static/images/rocket.jpeg',
    title: 'Rocket',
    owner: 'Arko',
  },
  {
    img: '../static/images/max.jpeg',
    title: 'Max',
    owner: 'Mattrix',
  },
];

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandCats: false,
    };
    this.handleCatToggle = this.handleCatToggle.bind(this);
    this.handleCatExpandChange = this.handleCatExpandChange.bind(this);
  }

  handleCatToggle(event, toggle) {
    this.setState({ expandCats: toggle });
  }

  handleCatExpandChange(expanded) {
    this.setState({ expandCats: expanded });
  }

  render() {
    const containerStyle = {
      width: '80%',
      margin: 'auto',
      marginBottom: '20px',
      marginTop: '20px',
    };

    const wrapperStyle = {
      display: 'flex',
      marginTop: '20px',
    };

    const paperSplitStyle = {
      width: '48%',
      marginLeft: 'auto',
      marginRight: 'auto',
    };

    const gridStyle = {
      overflowY: 'auto',
    };

    return (<div style={containerStyle}>
      <div style={wrapperStyle}>
        <Card style={{ width: '100%' }}>
          <CardTitle title="About" subtitle="About the L1 Demo GUI Loader" />
          <CardText>
            <p>
              The L1 Demo GUI Loader is an easy way to upload programs to your L1 Demo Board.
              It started as a side-project to help people not comfortable using command-line options
              (or those too lazy to ;) program their new L1 Demo Boards without needing to fuss with
              all the options available.
            </p>
            <br />
            <p>
              From this it grew into the full-featured program you see before you!
              If this program helps you out, find Arko and Davo at the LayerOne conference
              and buy us some beer!
            </p>
          </CardText>
        </Card>
      </div>
      <div style={wrapperStyle}>
        <Paper style={paperSplitStyle}>
          {listPeople}
        </Paper>
        <Paper style={paperSplitStyle}>
          {listLinks}
        </Paper>
      </div>
      <div style={wrapperStyle}>
        <Card style={{ width: '100%' }}>
          <CardTitle title="Libraries" subtitle="Open Source Libraries used in this program" />
          <CardText>
            <List>
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faGithubSquare} />}
                primaryText="Electron"
                secondaryText="MIT License"
                rightIconButton={<FlatButton
                  href="https://electronjs.org"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </FlatButton>}
              />
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faReact} />}
                primaryText="React"
                secondaryText="MIT License"
                rightIconButton={<FlatButton
                  href="https://reactjs.org"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </FlatButton>}
              />
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faImages} />}
                primaryText="Material-UI"
                secondaryText="MIT License"
                rightIconButton={<FlatButton
                  href="http://www.material-ui.com"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </FlatButton>}
              />
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faFontAwesome} />}
                primaryText="FontAwesome"
                secondaryText="MIT License"
                rightIconButton={<FlatButton
                  href="https://fontawesome.com"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </FlatButton>}
              />
            </List>
          </CardText>
          <CardActions>
            <Subheader>
              See the GitHub project for the full list of libraries.
            </Subheader>
            <FlatButton
              label="Source"
              href="https://github.com/thedeltaflyer/L1Demo-GUI-Loader"
              icon={<FontAwesomeIcon icon={faGithub} />}
            />
          </CardActions>
        </Card>
      </div>
      <div style={wrapperStyle}>
        <Card style={{ width: '100%' }}>
          <CardTitle title="Licensing" />
          <CardText>
            <List>
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faCode} />}
                primaryText="WTFPL-2.0"
                secondaryText="This project is covered under the
                WTFPL-2.0 License (with exceptions)."
                rightIconButton={<FlatButton
                  href="http://www.wtfpl.net"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </FlatButton>}
              />
              <ListItem
                leftIcon={<FontAwesomeIcon icon={faGavel} />}
                primaryText="Exceptions"
                secondaryText="This software is distributed with the
                ds30LoaderConsole.exe which is NOT
                covered under this program's license."
                secondaryTextLines={2}
              />
            </List>
          </CardText>
        </Card>
      </div>
      <div style={wrapperStyle}>
        <Card style={{ width: '100%' }} expanded={this.state.expandCats} onExpandChange={this.handleCatExpandChange}>
          <CardHeader
            title="Cats"
            subtitle="Because we live on the internet..."
            actAsExpander
            showExpandableButton
          />
          <CardMedia expandable>
            <div>
              <GridList
                cellHeight={350}
                style={gridStyle}
              >
                {catsData.map(tile => (
                  <GridTile
                    key={tile.img}
                    title={tile.title}
                    subtitle={<span>Thanks <b>{tile.owner}</b>!</span>}
                  >
                    <img src={tile.img} alt="" />
                  </GridTile>
                ))}
              </GridList>
            </div>
          </CardMedia>
        </Card>
      </div>
    </div>);
  }
}

export default About;
