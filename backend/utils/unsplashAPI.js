const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

export const getUnsplashImage = async (query) => {
  try {
    if (!UNSPLASH_API_KEY) {
      console.warn('⚠️  UNSPLASH_API_KEY not set, using fallback images');
      return null;
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_API_KEY}&per_page=1&orientation=portrait`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        url: data.results[0].urls.regular,
        thumb: data.results[0].urls.thumb,
        alt: data.results[0].alt_description || query,
        photographer: data.results[0].user.name,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching image for "${query}":`, error.message);
    return null;
  }
};

export const getMultipleImages = async (queries) => {
  try {
    const imagePromises = queries.map((q) => getUnsplashImage(q));
    const images = await Promise.all(imagePromises);
    return images.filter((img) => img !== null);
  } catch (error) {
    console.error('Error fetching multiple images:', error);
    return [];
  }
};
