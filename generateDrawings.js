const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'drawings');

fs.readdir(photosDir, (err, files) => {
  if (err) {
    console.error('Error reading drawings folder:', err);
    return;
  }

  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(file)
  );

  const formatted = imageFiles.map(file => ({
    name: file,
    file: `drawings/${file}`
  }));

  console.log(JSON.stringify(formatted, null, 2));
});
