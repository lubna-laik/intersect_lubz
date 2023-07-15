const express = require('express');
const turf = require('@turf/turf');

const app = express();
app.use(express.json());

// start to end dummy set of point
const lines = [
  { id: 'L01', coordinates: [[-74.0064, 40.7314], [-73.9876, 40.7661]] },
  // you can add more lines here
];

//here Middleware is for header-based authentication
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  //to Check if the auth header is missing or malformed
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  //here  Extracting the token from the header
  const token = authHeader.substring(7);

  // Validate the token
  // can check if token is expired or blacklisted

  if (!validateToken(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // If authentication is successful then  proceed to the next middleware...
  next();
});

app.post('/checkIntersections', (req, res) => {
  //here Checking if  request body contains a valid linestring or not
  if (!req.body || !req.body.type || req.body.type !== 'Feature' || !req.body.geometry || req.body.geometry.type !== 'LineString') {
    return res.status(400).json({ error: 'Invalid linestring' });
  }

  //here Converting the linestring to Turf.js geometry
  const linestring = turf.lineString(req.body.geometry.coordinates);

  //to find intersections with each line
  const intersections = [];
  lines.forEach((line) => {
    const lineString = turf.lineString(line.coordinates);
    const intersects = turf.lineIntersect(linestring, lineString, {
      properties: {
        id: line.id
      }
    });
    if (intersects.features.length !== 0) {
      intersects.features.forEach((feature) => {
        intersections.push({
          id: feature.properties.id,
          intersection: {
            type: "Point",
            coordinates: feature.geometry.coordinates
          }
        });
      });
    }
  });

  // Return the intersections with line id or an empty array if none found
  if (intersections.length !== 0) {
    return res.json(intersections);
  } else {
    return res.json([]);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

//it is a Function to validate the token
function validateToken(token) {
  

  // Return true if the token is valid otherwise return false
  return true;
}
