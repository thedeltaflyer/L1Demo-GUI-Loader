import React, { Component } from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import IconAlert from 'material-ui/svg-icons/alert/warning';


class RequiresMono extends Component {
  render() {
    const cardStyle = {
      width: '80%',
      margin: 'auto',
      marginTop: '20px',
      marginBottom: '10px',
    };

    const imageStyle = {
      width: '40%',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'block',
    };

    return (<Card style={cardStyle}>
      <CardHeader
        title="Requires Mono!"
        subtitle="The L1 Demo GUI Loader requires the Mono Framework to be installed!"
        avatar={<IconAlert color="red" />}
      />
      <CardMedia>
        <div>
          <img src="../static/images/l1demo-board.png" alt="" style={imageStyle} />
        </div>
      </CardMedia>
      <CardText>
        The L1 Demo GUI Loader was unable to locate the Mono Framework on your system,
        please install it and re-launch this program.
      </CardText>
      <CardActions>
        <RaisedButton label="Download Mono" href="http://www.mono-project.com/" />
      </CardActions>
    </Card>);
  }
}

export default RequiresMono;
