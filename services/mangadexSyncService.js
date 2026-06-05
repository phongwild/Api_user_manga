const axios = require('axios');
const MangaTagCache = require('../models/mangaTagCacheModel');
const { toCacheData } = require('../utils/mangaCacheMapper');

const BASE_URL = 'https://api.mangadex.org';

const syncPage = async (offset = 0) => {
    const response = await axios.get(
        `${BASE_URL}/manga`,
        {
            params: {
                limit: 100,
                offset,
                includes: ['cover_art'],
                contentRating: [
                    'safe',
                    'suggestive',
                    'erotica',
                    'pornographic'
                ],
                order: {
                    followedCount: 'desc',
                    createdAt: 'desc',
                    updatedAt: 'desc'
                }
            },
            timeout: 30000
        }
    );

    const mangas = response.data.data;

    const operations = mangas.map(
        manga => {
            const coverArt =
                manga.relationships?.find(
                    rel =>
                        rel.type ===
                        'cover_art'
                );

            const data =
                toCacheData(
                    manga,
                    coverArt
                );

            return {
                updateOne: {
                    filter: {
                        mangaId:
                            manga.id
                    },
                    update: {
                        $set: data
                    },
                    upsert: true
                }
            };
        }
    );

    if (operations.length) {
        await MangaTagCache.bulkWrite(
            operations,
            {
                ordered: false
            }
        );
    }

    return mangas.length;
};

const syncMangadex = async (
    req,
    res
) => {
    try {
        let total = 0;

        for (
            let offset = 0;
            offset < 2000;
            offset += 100
        ) {
            const count =
                await syncPage(offset);

            total += count;

            console.log(
                `Synced ${total}`
            );
        }

        return res.json({
            status: true,
            total
        });

    } catch (e) {
        return res.status(500).json({
            status: false,
            message: e.message
        });
    }
};

module.exports = {
    syncPage,
    syncMangadex
};