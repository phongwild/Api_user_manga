exports.toCacheData = (
    manga,
    coverArt
) => {
    const attr = manga.attributes;

    return {
        mangaId: manga.id,
        title:
            attr.title?.en ||
            Object.values(attr.title || {})[0] ||
            '',
        description:
            attr.description?.en || '',
        tags:
            attr.tags?.map(
                t =>
                    t.attributes.name.en
                        .trim()
                        .toLowerCase()
            ) || [],
        status: attr.status,
        year: attr.year,
        originalLanguage:
            attr.originalLanguage,
        followedCount:
            attr.followedCount || 0,
        rating:
            attr.rating?.bayesian || 0,
        contentRating:
            attr.contentRating,
        coverFileName:
            coverArt?.attributes?.fileName || '',
        lastChapter:
            attr.lastChapter,
        updatedAt: new Date(),
    };
};