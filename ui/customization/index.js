/*
* Use this file to customize/replace the content of the index (home) page
* Please do not include this file in your contributions
*/

import React from 'react';

/* this component receives all the same props that the index page does...
* so you can render whatever you want (like the user's name!)
*
* Returns "false" by default. Replace this return with whatever JSX you want
*/
export default function CustomIndex(props) {
  return null; // example below does not render while this return statement exists
  return (
    <h1>{`Hello ${(props.user) ? props.user.name : 'world'}`}</h1>
  );
}
