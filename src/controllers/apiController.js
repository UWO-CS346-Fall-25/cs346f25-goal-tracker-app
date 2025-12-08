const ACCESS_KEY = (process.env.UNSPLASH_ACCESS_KEY || '').trim();
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Helper to retrieve random motivational images from Unsplash
async function getRandomPhotos(count = 3, query = 'motivation') {
  const url = new URL('/photos/random', UNSPLASH_BASE_URL);
  url.searchParams.set('count', count);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape'); // keeps images widescreen for UI

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash random error ${response.status}`);
  }

  return response.json(); // returns array of photos
}

if (!ACCESS_KEY) {
  throw new Error('Missing UNSPLASH_ACCESS_KEY in .env');
}

// Controller: renders Unsplash search results page
exports.searchPhotos = async (req, res) => {
  const query = (req.query.query || 'motivation').trim(); // allow user-provided keyword, fallback to motivation

  try {
    const url = new URL('/search/photos', UNSPLASH_BASE_URL);
    url.searchParams.set('query', query);
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('per_page', 12); // limit response size for performance

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Unsplash API responded with ${response.status}`);
    }
    const data = await response.json();
    res.render('api/photos', {
      title: 'unsplash results for "${query}"',
      query,
      images: data.results,
      error: null,
    });
  } catch (error) {
    console.error('unsplash api error:', error);

    res.render('goals/unsplash', {
      title: 'Goal Inspiration',
      images: [],
      query: req.query.query || 'goal motivation',
      error: 'Failed to fetch images from Unsplash. Please try again later.', // graceful fallback view
    });
  }
};
module.exports = { searchPhotos: exports.searchPhotos, getRandomPhotos };
