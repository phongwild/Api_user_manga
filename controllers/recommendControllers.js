const axios = require('axios');
const User = require('../models/userModel');
const MangaTagCache = require('../models/mangaTagCacheModel');
const { toCacheData } = require('../utils/mangaCacheMapper');

const IGNORED_TAGS = new Set([
    'web comic',
    'long strip',
    'full color'
]);

exports.cacheManga = async (req, res) => {
    try {
        const { mangaId } = req.body;
        const existing = await MangaTagCache.findOne(
            { mangaId },
            { updatedAt: 1 }
        ).lean();

        if (
            existing &&
            Date.now() - existing.updatedAt.getTime() <
            7 * 24 * 60 * 60 * 1000
        ) {
            return res.json({
                status: true,
                cached: true,
                mangaId,
            });
        }

        const response = await axios.get(
            `https://api.mangadex.org/manga/${mangaId}`,
            {
                params: {
                    includes: ['cover_art']
                },
                timeout: 10000
            }
        );

        const manga = response.data.data;

        const coverArt = manga.relationships.find(
            rel => rel.type === 'cover_art'
        );
        const attr = manga.attributes;
        await MangaTagCache.updateOne(
            { mangaId },
            { $set: toCacheData(manga, coverArt) },
            { upsert: true }
        );

        return res.status(200).json({
            status: true,
            mangaId,
        });

    } catch (e) {
        return res.status(500).json({
            status: false,
            message: e.message,
        });
    }
};

const buildUserProfile = async (uid) => {
    const user = await User.findById(uid).lean();

    if (!user) {
        throw new Error('User not found');
    }

    const historyIds = user.history
        .slice(-20)
        .map(item => item.mangaId);

    const followIds = user.follow_list;

    const followSet = new Set(followIds);

    const allIds = [
        ...new Set([
            ...historyIds,
            ...followIds,
        ])
    ];

    const mangas = await MangaTagCache.find({
        mangaId: {
            $in: allIds
        }
    }).lean();

    const profile = {};

    for (const manga of mangas) {
        const weight =
            followSet.has(manga.mangaId)
                ? 3
                : 1;

        for (const tag of manga.tags ?? []) {
            if (
                IGNORED_TAGS.has(tag)
            ) {
                continue;
            }

            profile[tag] =
                (profile[tag] || 0) +
                weight;
        }
    }

    return {
        profile,
        excludedIds: allIds,
    };

};

exports.getRecommendations = async (req, res) => {
    try {
        const uid = req.user._id;

        const {
            profile,
            excludedIds
        } =
            await buildUserProfile(uid);

        const topTags =
            Object.entries(profile)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 10)
                .map(
                    item => item[0]
                );

        const candidates =
            await MangaTagCache.find({
                mangaId: {
                    $nin: excludedIds,
                },
                tags: {
                    $in: topTags
                }
            })
                .sort({
                    followedCount: -1
                })
                .limit(1000)
                .lean();

        const recommendations = [];

        for (const manga of candidates) {
            const tags = manga.tags ?? [];

            const matchedTags = tags.filter(
                tag => profile[tag]
            );

            if (!matchedTags.length) {
                continue;
            }

            let tagScore = 0;

            for (const tag of matchedTags) {
                tagScore += profile[tag];
            }

            // match ratio
            const matchRatio =
                matchedTags.length /
                tags.length;

            tagScore *= matchRatio;

            // popularity bonus
            const popularityScore =
                Math.log10(
                    (manga.followedCount || 100) + 1
                );

            const overlapBonus =
                matchedTags.length * 2;

            const score =
                tagScore +
                overlapBonus +
                popularityScore;

            if (score > 0) {
                recommendations.push({
                    mangaId:
                        manga.mangaId,
                    title:
                        manga.title,
                    coverFileName:
                        manga.coverFileName,
                    rating:
                        manga.rating,
                    followedCount:
                        manga.followedCount,
                    score,
                });
            }
        }

        recommendations.sort(
            (a, b) =>
                b.score - a.score
        );

        return res.status(200).json({
            status: true,
            data:
                recommendations.slice(0, 20),
        });

    } catch (e) {
        return res.status(500).json({
            status: false,
            message: e.message,
        });
    }

};