// pages/api/update-tle-data.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const tleSources = [
  {
    group: 'debris',
    urls: [
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=tle',
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-2251-debris&FORMAT=tle'
    ],
    files: [
      'public/data/cosmos1408.txt',
      'public/data/fengyun1c.txt',
      'public/data/iridium33.txt',
      'public/data/cosmos2251.txt'
    ]
  },
  { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle', file: 'public/data/activesatellite.txt' }
];

export default async function handler(req, res) {
  try {
    const promises = tleSources.flatMap(source => {
      if (source.group === 'debris') {
        return source.urls.map((url, index) => axios.get(url).then(response => {
          fs.writeFileSync(path.join(process.cwd(), source.files[index]), response.data);
        }));
      } else {
        return axios.get(source.url).then(response => {
          fs.writeFileSync(path.join(process.cwd(), source.file), response.data);
        });
      }
    });

    await Promise.all(promises);

    res.status(200).json({ message: 'TLE data updated successfully' });
  } catch (error) {
    console.error('Error updating TLE data:', error);
    res.status(500).json({ error: 'Error updating TLE data' });
  }
}