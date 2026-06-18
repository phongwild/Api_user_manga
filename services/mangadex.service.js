const axios = require('axios');

module.exports.getMangasByIds = async (ids) => {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }

        const response = await axios.get(
            'https://api.mangadex.org/manga',
            {
                params: {
                    ids,
                    includes: ['cover_art']
                },
                timeout: 10000
            }
        );

        if (!response) {
            console.error('[MangaDex] Empty response');
            return [];
        }

        if (response.status !== 200) {
            console.error(
                `[MangaDex] Unexpected status: ${response.status}`
            );
            return [];
        }

        const mangas = response?.data?.data;

        if (!Array.isArray(mangas)) {
            console.error(
                '[MangaDex] Invalid response format:',
                response.data
            );
            return [];
        }

        return mangas;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('[MangaDex] Request timeout');
        } else if (error.response) {
            console.error(
                '[MangaDex] Response error:',
                error.response.status,
                error.response.data
            );
        } else if (error.request) {
            console.error(
                '[MangaDex] No response received'
            );
        } else {
            console.error(
                '[MangaDex] Unknown error:',
                error.message
            );
        }

        return [];
    }
};